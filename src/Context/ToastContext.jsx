import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ message: "", visible: false });

  const showToast = useCallback((message) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast.visible && (
        <div className="bb-toast" style={{ animation: "fadeIn 0.2s ease" }}>
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
