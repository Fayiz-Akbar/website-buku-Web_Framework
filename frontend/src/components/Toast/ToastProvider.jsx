import React, { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    const timer = setTimeout(() => removeToast(id), duration);
    return () => {
      clearTimeout(timer);
      removeToast(id);
    };
  }, [removeToast]);

  const value = {
    showToast,
    success: (msg, duration) => showToast(msg, 'success', duration),
    error: (msg, duration) => showToast(msg, 'error', duration),
    info: (msg, duration) => showToast(msg, 'info', duration),
  };

  const colorByType = (type) => {
    switch (type) {
      case 'error': return 'border-red-500';
      case 'info': return 'border-blue-500';
      default: return 'border-green-500';
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`w-72 bg-white shadow-lg rounded-md border-l-4 ${colorByType(t.type)} p-3 text-sm text-gray-800 pointer-events-auto`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                {t.type === 'error' ? '⚠️' : t.type === 'info' ? 'ℹ️' : '✅'}
              </div>
              <div className="flex-1">{t.message}</div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Tutup notifikasi"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}