import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!notification) {
      return undefined;
    }

    const timer = setTimeout(() => setNotification(null), 3200);
    return () => clearTimeout(timer);
  }, [notification]);

  const value = useMemo(
    () => ({
      notification,
      notify: (message, type = 'success') => setNotification({ message, type }),
      clear: () => setNotification(null),
    }),
    [notification]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notification && (
        <div className="toast-container position-fixed top-0 end-0 p-3">
          <div className={`toast show border-0 shadow-soft ${notification.type === 'error' ? 'bg-danger text-white' : 'bg-success text-white'}`} role="alert">
            <div className="toast-body">{notification.message}</div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }

  return context;
}
