import { store } from '../../../app/store';
import { setOnlineStatus } from '../../slices/syncSlice';

/**
 * Initializes browser network connectivity listeners to automatically update Redux sync state
 */
export function initializeNetworkMonitor(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleOnline = () => {
    store.dispatch(setOnlineStatus(true));
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
    store.dispatch(setOnlineStatus(false));
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function for teardown
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

