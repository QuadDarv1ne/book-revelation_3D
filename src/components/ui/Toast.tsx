"use client";

import { useState, useCallback, createContext, useContext, useEffect } from "react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return { showToast: () => {} };
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Auto-dismiss toasts after 5 seconds (accessibility improvement)
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none"
        role="region"
        aria-label="Уведомления"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto px-4 py-2.5 rounded-lg shadow-lg backdrop-blur-xl
              transition-all duration-300 ease-out animate-slide-up max-w-sm
              ${index > 0 ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
              ${toast.type === "success" ? "bg-amber-900/90 border border-amber-500/40" : ""}
              ${toast.type === "error" ? "bg-red-900/90 border border-red-500/40" : ""}
              ${toast.type === "info" ? "bg-blue-900/90 border border-blue-500/40" : ""}
            `}
            role="alert"
            aria-live={toast.type === "error" ? "assertive" : "polite"}
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1">
                {toast.type === "success" && (
                  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {toast.type === "error" && (
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {toast.type === "info" && (
                  <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <p className="text-sm text-amber-100">{toast.message}</p>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="p-1 text-amber-400/60 hover:text-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 rounded"
                aria-label="Закрыть уведомление"
                type="button"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
