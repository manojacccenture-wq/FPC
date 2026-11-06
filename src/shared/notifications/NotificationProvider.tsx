import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { Alert, type AlertTone } from '../components/Alert';

export interface NotificationItem {
  id: string;
  message: string;
  tone: AlertTone;
  title?: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  notify: (message: string, tone?: AlertTone, title?: string) => void;
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const notify = (message: string, tone: AlertTone = 'info', title?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setNotifications((prev) => [...prev, { id, message, tone, title }]);
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, notify, dismiss }}>
      {children}
      {/* Toast viewport overlay */}
      {notifications.length > 0 && (
        <div 
          aria-live="polite" 
          className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        >
          {notifications.map((item) => (
            <div key={item.id} className="pointer-events-auto">
              <Alert
                tone={item.tone}
                variant="card"
                size="md"
                title={item.title}
                onClose={() => dismiss(item.id)}
              >
                {item.message}
              </Alert>
            </div>
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

