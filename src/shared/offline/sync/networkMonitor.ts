import { store } from '../../../app/store';
import {
  initializeConnectivity,
  setConnectivityOffline,
  setConnectivityOnline,
  dismissOnlineBadge,
} from '../../slices/syncSlice';

/**
 * Display duration for the transient Online badge before it automatically hides (4 seconds).
 */
const ONLINE_BADGE_DISPLAY_MS = 4000;

/**
 * Module-level timer reference ensuring a single timer across the entire application lifecycle.
 */
let onlineHideTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Initializes browser network connectivity listeners to automatically update Redux sync state
 * and manage the global temporary Online / persistent Offline badge lifecycle.
 */
export function initializeNetworkMonitor(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  // 1. Synchronize initial state immediately on initialization
  const initialOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  store.dispatch(
    initializeConnectivity({
      isOnline: initialOnline,
      badgeVisibility: initialOnline ? 'hidden' : 'offline',
    })
  );

  const handleOnline = () => {
    // Cancel any active auto-hide timer immediately
    if (onlineHideTimer) {
      clearTimeout(onlineHideTimer);
      onlineHideTimer = null;
    }

    // Only display the temporary Online badge if returning from an offline state
    const state = store.getState().sync;
    const wasOffline = !state.isOnline || state.badgeVisibility === 'offline';

    if (wasOffline) {
      store.dispatch(setConnectivityOnline({ showTemporaryBadge: true }));

      // Automatically hide the Online badge after 4 seconds
      onlineHideTimer = setTimeout(() => {
        store.dispatch(dismissOnlineBadge());
        onlineHideTimer = null;
      }, ONLINE_BADGE_DISPLAY_MS);
    } else {
      store.dispatch(setConnectivityOnline({ showTemporaryBadge: false }));
    }

    // Dynamically trigger background replay of queued offline submissions
    import('../../../features/onboarding/services/onboardingSyncService')
      .then(({ onboardingSyncService }) => {
        import('../../../features/onboarding/api/fpcInvitationApi').then(({ fpcInvitationApi }) => {
          onboardingSyncService.processPendingSubmissions((payload) =>
            store.dispatch(fpcInvitationApi.endpoints.completeFpcInvitation.initiate(payload)).unwrap()
          );
        });
      })
      .catch(() => {});
  };

  const handleOffline = () => {
    // Cancel any active auto-hide timer immediately to prevent race conditions
    if (onlineHideTimer) {
      clearTimeout(onlineHideTimer);
      onlineHideTimer = null;
    }

    // Immediately display the persistent Offline badge
    store.dispatch(setConnectivityOffline());
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function for teardown
  return () => {
    if (onlineHideTimer) {
      clearTimeout(onlineHideTimer);
      onlineHideTimer = null;
    }
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

