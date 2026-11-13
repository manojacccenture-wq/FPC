import React, { type ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { NotificationProvider } from '../shared/notifications';
import { initializeNetworkMonitor } from '../shared/offline/sync/networkMonitor';
import { offlineDb } from '../shared/offline/db';

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    offlineDb.initialize().catch((err) => console.warn('Offline DB init error:', err));
    const cleanup = initializeNetworkMonitor();
    return cleanup;
  }, []);

  return (
    <Provider store={store}>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </Provider>
  );
};

