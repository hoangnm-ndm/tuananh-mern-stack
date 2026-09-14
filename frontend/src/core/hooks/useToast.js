import { useContext } from "react";
import { ToastContext } from "./ToastContext.js";

/** Hook hien thong bao: toast.success("..."), toast.error("..."), toast.info("..."). */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast phai duoc dung ben trong <ToastProvider>");
  return context;
}
