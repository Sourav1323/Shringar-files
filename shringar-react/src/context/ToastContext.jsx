import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = {
    success: (msg, dur) => showToast(msg, 'success', dur),
    error: (msg, dur) => showToast(msg, 'error', dur),
    info: (msg, dur) => showToast(msg, 'info', dur),
    showSuccess: (msg, dur) => showToast(msg, 'success', dur),
    showError: (msg, dur) => showToast(msg, 'error', dur),
    showInfo: (msg, dur) => showToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Overlay Container - Positioned at top on mobile for full visibility */}
      <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-5 sm:top-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none mx-auto sm:mx-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-slide-in ${
              t.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/40'
                : t.type === 'error'
                ? 'bg-rose-950/90 text-rose-100 border-rose-500/40'
                : 'bg-slate-900/90 text-amber-100 border-amber-500/40'
            }`}
          >
            <span className="mt-0.5 flex-shrink-0">
              {t.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-amber-400" />}
            </span>
            <div className="flex-1 text-xs md:text-sm font-medium leading-relaxed">
              {t.message}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white transition p-0.5 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      success: (msg) => console.log('[Toast Success]:', msg),
      error: (msg) => console.error('[Toast Error]:', msg),
      info: (msg) => console.log('[Toast Info]:', msg),
      showSuccess: (msg) => console.log('[Toast Success]:', msg),
      showError: (msg) => console.error('[Toast Error]:', msg),
      showInfo: (msg) => console.log('[Toast Info]:', msg),
    };
  }
  return context;
}
