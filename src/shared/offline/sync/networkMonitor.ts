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

