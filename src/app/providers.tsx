import React, { type ReactNode } from 'react';
import { NotificationProvider } from '../shared/notifications';

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  );
};

