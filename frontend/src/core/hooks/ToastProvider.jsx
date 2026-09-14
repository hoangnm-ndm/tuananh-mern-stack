import { useCallback, useMemo, useState } from "react";
import { ToastContext } from "./ToastContext.js";

/**
 * He thong thong bao (toast) toi gian, khong phu thuoc thu vien ngoai.
 * Muon doi sang react-hot-toast/sonner: chi can giu nguyen API { success, error, info }.
 *
 * Hook `useToast` nam o file rieng (useToast.js) de Fast Refresh hoat dong dung.
 */
let nextId = 0;

export function ToastProvider({ children, duration = 4000 }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message, type = "info") => {
      const id = ++nextId;
      setToasts((current) => [...current, { id, message, type }]);
      setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss, duration],
  );

  const value = useMemo(
    () => ({
      toasts,
      dismiss,
      show,
      success: (message) => show(message, "success"),
      error: (message) => show(message, "error"),
      info: (message) => show(message, "info"),
    }),
    [toasts, dismiss, show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

const TOAST_STYLES = {
  success: "bg-emerald-600",
  error: "bg-red-600",
  info: "bg-slate-800",
};

function ToastViewport({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`flex items-start justify-between gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
            TOAST_STYLES[toast.type] ?? TOAST_STYLES.info
          }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dong thong bao"
            className="shrink-0 opacity-70 transition hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
