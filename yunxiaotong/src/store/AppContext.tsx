import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error';
  text: string;
}

interface AppContextValue {
  toasts: ToastMessage[];
  showToast: (type: ToastMessage['type'], text: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((type: ToastMessage['type'], text: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <AppContext.Provider value={{ toasts, showToast }}>
      {children}
      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`toast ${t.type}`}>
              <span>
                {t.type === 'success' ? '✅' : t.type === 'warning' ? '⚠️' : '❌'}
              </span>
              {t.text}
            </div>
          ))}
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
