import { store } from '../../../app/store';
import { setPendingCount, setSyncing, syncCompleted, syncFailed } from '../../../shared/slices/syncSlice';
import { offlineDb } from '../../../shared/offline/db';
import type { OfflineMutationRecord } from '../../../shared/offline/types';
import type { CompleteFpcInvitationRequest } from '../api/fpcInvitationApi';
import { invitationApi } from '../api/invitation.api';

export interface OnboardingSubmitResult {
  success: boolean;
  queuedOffline?: boolean;
  message?: string;
}

class OnboardingSyncService {
  private isProcessing = false;

  /**
   * Generates a stable, deterministic idempotency key for an onboarding submission.
   */
  public generateMutationId(token: string): string {
    const raw = `fpc_onboard_${token.slice(0, 16)}_${Date.now()}`;
    return raw;
  }

  /**
   * Submits an onboarding registration payload with offline queueing and timeout protection.
   */
  public async submitOnboarding(
    request: CompleteFpcInvitationRequest,
    executeMutation: (payload: CompleteFpcInvitationRequest) => Promise<unknown>,
    validateToken?: (token: string) => Promise<{ isValid: boolean; errorMessage?: string | null }>
  ): Promise<OnboardingSubmitResult> {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const clientMutationId = request.clientMutationId || this.generateMutationId(request.token);
    const payloadWithIdempotency: CompleteFpcInvitationRequest = {
      ...request,
      clientMutationId,
    };

    // 1. If currently offline, queue immediately in Dexie mutationsQueue
    if (!isOnline) {
      await this.queueOfflineSubmission(payloadWithIdempotency);
      return {
        success: true,
        queuedOffline: true,
        message: 'You are currently offline. Your application is safely saved on this device and will submit automatically when connectivity is restored.',
      };
    }

    // 2. If online, attempt direct RTK Query mutation
    try {
      await executeMutation(payloadWithIdempotency);
      await invitationApi.clearOnboardingDraft(request.token);

      return {
        success: true,
        queuedOffline: false,
        message: 'Onboarding application successfully submitted for administrative review and verification.',
      };
    } catch (err: unknown) {
      // 3. Timeout / Network Interruption Handling
      // Before blindly retrying, account for whether the server already processed it
      if (validateToken) {
        try {
          const validation = await validateToken(request.token);
          // If the backend returns that it is already completed, the transaction succeeded before timeout!
          if (
            validation?.errorMessage &&
            validation.errorMessage.toLowerCase().includes('already been completed')
          ) {
            await invitationApi.clearOnboardingDraft(request.token);
            return {
              success: true,
              queuedOffline: false,
              message: 'Onboarding application successfully received and verified by the server.',
            };
          }
        } catch {
          // Validation request also failed or unreachable
        }
      }

      // Check if the error was a network / connectivity drop
      const isNetworkError =
        !navigator.onLine ||
        (err instanceof Error &&
          (err.message.includes('fetch') ||
            err.message.includes('NetworkError') ||
            err.message.includes('timeout')));

      if (isNetworkError) {
        await this.queueOfflineSubmission(payloadWithIdempotency);
        return {
          success: true,
          queuedOffline: true,
          message: 'Connection was interrupted during submission. Your application has been securely queued and will automatically submit once connection stabilizes.',
        };
      }

      // Re-throw server-side validation / HTTP 400 errors for form handling
      throw err;
    }
  }

  /**
   * Persists an onboarding submission to Dexie IndexedDB mutationsQueue
   */
  public async queueOfflineSubmission(request: CompleteFpcInvitationRequest): Promise<void> {
    try {
      const record: OfflineMutationRecord = {
        id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        fpcId: request.token,
        userId: 'anonymous',
        clientMutationId: request.clientMutationId || this.generateMutationId(request.token),
        entityType: 'farmer', // Reusing entityType schema
        entityId: request.token,
        operation: 'INSERT',
        baseSyncVersion: 1,
        payloadJson: JSON.stringify(request),
        createdAtUtc: new Date().toISOString(),
        retryCount: 0,
      };

      await offlineDb.mutationsQueue.put(record);

      const count = await offlineDb.mutationsQueue.count();
      store.dispatch(setPendingCount(count));
    } catch (err) {
      console.warn('Failed to queue mutation in Dexie:', err);
    }
  }

  /**
   * Flushes all queued onboarding submissions when connectivity returns
   */
  public async processPendingSubmissions(
    executeMutation: (payload: CompleteFpcInvitationRequest) => Promise<unknown>
  ): Promise<void> {
    if (this.isProcessing || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      return;
    }

    this.isProcessing = true;
    store.dispatch(setSyncing(true));

    try {
      const pending = await offlineDb.mutationsQueue.toArray();
      if (pending.length === 0) {
        store.dispatch(syncCompleted({ syncedAt: new Date().toISOString(), remainingPending: 0, conflicts: 0 }));
        return;
      }

      for (const item of pending) {
        try {
          const payload: CompleteFpcInvitationRequest = JSON.parse(item.payloadJson);
          await executeMutation(payload);
          await offlineDb.mutationsQueue.delete(item.id);
          await invitationApi.clearOnboardingDraft(payload.token);
        } catch (err) {
          console.warn(`Failed to replay mutation ${item.id}:`, err);
          item.retryCount += 1;
          item.lastError = err instanceof Error ? err.message : String(err);
          await offlineDb.mutationsQueue.put(item);
        }
      }

      const remaining = await offlineDb.mutationsQueue.count();
      store.dispatch(
        syncCompleted({
          syncedAt: new Date().toISOString(),
          remainingPending: remaining,
          conflicts: 0,
        })
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      store.dispatch(syncFailed(msg));
    } finally {
      this.isProcessing = false;
    }
  }
}

export const onboardingSyncService = new OnboardingSyncService();

