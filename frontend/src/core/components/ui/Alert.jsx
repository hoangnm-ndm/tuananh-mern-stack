import clsx from "clsx";

const STYLES = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
};

/** Hop thong bao tinh (khac toast: nam co dinh trong trang). */
export function Alert({ type = "info", title, children, className }) {
  return (
    <div
      role="alert"
      className={clsx("rounded-lg border px-4 py-3 text-sm", STYLES[type], className)}
    >
      {title && <p className="mb-1 font-semibold">{title}</p>}
      {children}
    </div>
  );
}
