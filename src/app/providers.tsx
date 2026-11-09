import React, { type ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { NotificationProvider } from '../shared/notifications';
import { initializeNetworkMonitor } from '../shared/offline/sync/networkMonitor';

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
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

