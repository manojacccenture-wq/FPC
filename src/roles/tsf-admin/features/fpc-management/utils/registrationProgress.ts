import type { BadgeVariant } from '../../../../../shared/components';
import { invitationApi, type DraftIdentifierInput } from '../../../../../features/onboarding/api/invitation.api';

export interface RegistrationProgressResult {
  percentage: number;
  label: string;
  badgeVariant: BadgeVariant;
  completedStepsCount: number;
  totalSteps: number;
}

export interface ProgressCalculationOptions {
  status: string; // 'Active' | 'Pending' | 'InProgress' | 'Completed' | 'Expired' | 'Revoked' | etc.
  isRegisteredFpc?: boolean;
  token?: string | null;
  invitationId?: string | null;
  companyName?: string | null;
  email?: string | null;
}

/**
 * Counts how many onboarding wizard steps (1 to 8) have saved draft data in local persistent storage.
 */
export function getSavedWizardStepsCount(identifier?: DraftIdentifierInput | null): number {
  if (typeof window === 'undefined' || !identifier) {
    return 0;
  }

  const tokenOrId = invitationApi.resolveDraftKey(identifier);
  if (!tokenOrId) {
    return 0;
  }

  let count = 0;

  // Check Step 8 / final completion flag
  try {
    const isCompleted =
      localStorage.getItem(`fpc_completed_${tokenOrId}`) === 'true';
    if (isCompleted) {
      return 8;
    }
  } catch {
    // Local storage inaccessible
  }

  // Check individual step draft entries (1 to 7)
  for (let step = 1; step <= 7; step += 1) {
    try {
      const raw = localStorage.getItem(`fpc_step${step}_${tokenOrId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          count += 1;
        }
      }
    } catch {
      // Local storage inaccessible or invalid JSON
    }
  }

  return count;
}

/**
 * Calculates registration completion percentage and user-facing status label.
 *
 * Rules:
 * 1. Registered active FPCs or Completed invitations -> 100% (Registration completed: 100%).
 * 2. Revoked invitations -> Preserve lifecycle status (Invited (Revoked)).
 * 3. Expired invitations -> Preserve lifecycle status (Invited (Expired)).
 * 4. InProgress invitations -> Calculate percentage from saved steps (e.g. 25%, 63%).
 * 5. Pending invitations -> 0% (Registration not started: 0%).
 */
export function calculateRegistrationProgress(
  options: ProgressCalculationOptions
): RegistrationProgressResult {
  const { status, isRegisteredFpc = false, token, invitationId } = options;
  const totalSteps = 8;

  // 1. Registered active FPC record
  if (isRegisteredFpc) {
    return {
      percentage: 100,
      label: 'Registration completed: 100%',
      badgeVariant: 'brand',
      completedStepsCount: 8,
      totalSteps,
    };
  }

  // 2. Lifecycle state: Revoked
  if (status === 'Revoked') {
    return {
      percentage: 0,
      label: 'Invited (Revoked)',
      badgeVariant: 'warning',
      completedStepsCount: 0,
      totalSteps,
    };
  }

  // 3. Lifecycle state: Expired
  if (status === 'Expired') {
    return {
      percentage: 0,
      label: 'Invited (Expired)',
      badgeVariant: 'warning',
      completedStepsCount: 0,
      totalSteps,
    };
  }

  // 4. Lifecycle state: Completed invitation
  if (status === 'Completed') {
    return {
      percentage: 100,
      label: 'Registration completed: 100%',
      badgeVariant: 'brand',
      completedStepsCount: 8,
      totalSteps,
    };
  }

  // 5. InProgress: check stored draft steps
  const resolvedDraftId = {
    tokenOrId: token || invitationId,
    companyName: options.companyName,
    email: options.email,
  };
  const savedSteps = getSavedWizardStepsCount(resolvedDraftId);

  if (status === 'InProgress') {
    if (savedSteps >= 8) {
      return {
        percentage: 100,
        label: 'Registration completed: 100%',
        badgeVariant: 'brand',
        completedStepsCount: 8,
        totalSteps,
      };
    }

    if (savedSteps > 0) {
      const percentage = Math.round((savedSteps / totalSteps) * 100);
      const label =
        percentage >= 50
          ? `Registration partially completed: ${percentage}%`
          : `Registration started: ${percentage}%`;
      return {
        percentage,
        label,
        badgeVariant: 'info',
        completedStepsCount: savedSteps,
        totalSteps,
      };
    }

    // Default InProgress without localStorage items (e.g. opened in another device)
    return {
      percentage: 25,
      label: 'Registration started: 25%',
      badgeVariant: 'info',
      completedStepsCount: 2,
      totalSteps,
    };
  }

  // 6. Pending: check if user started filling without submitting step 1
  if (savedSteps > 0) {
    const percentage = Math.round((savedSteps / totalSteps) * 100);
    return {
      percentage,
      label: `Registration started: ${percentage}%`,
      badgeVariant: 'info',
      completedStepsCount: savedSteps,
      totalSteps,
    };
  }

  // Default Pending (Not Started)
  return {
    percentage: 0,
    label: 'Registration not started: 0%',
    badgeVariant: 'neutral',
    completedStepsCount: 0,
    totalSteps,
  };
}

