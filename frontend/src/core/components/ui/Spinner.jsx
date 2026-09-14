import clsx from "clsx";

/** Bieu tuong dang tai. Luon kem nhan de trinh doc man hinh hieu. */
export function Spinner({ className, label = "Dang tai..." }) {
  return (
    <div role="status" className={clsx("flex items-center justify-center gap-2", className)}>
      <svg className="h-5 w-5 animate-spin text-indigo-600" viewBox="0 0 24 24" aria-hidden="true">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Man hinh cho toan trang - dung khi dang khoi phuc phien dang nhap. */
export function FullPageSpinner({ label = "Dang tai..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner label={label} />
    </div>
  );
}
