import clsx from "clsx";
import { forwardRef } from "react";

/**
 * O nhap lieu gan lien voi react-hook-form.
 *
 * Dung `forwardRef` vi RHF can ref that cua the <input> de doc gia tri
 * va de focus vao o dau tien bi loi.
 *
 * Cach dung: <FormField label="Email" error={errors.email?.message} {...register("email")} />
 */
export const FormField = forwardRef(function FormField(
  { label, error, hint, type = "text", required = false, className, id, ...rest },
  ref,
) {
  const fieldId = id ?? rest.name;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-600">*</span>}
        </label>
      )}

      <input
        ref={ref}
        id={fieldId}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={clsx(error && errorId, hint && hintId) || undefined}
        className={clsx(
          "w-full rounded-lg border px-3 py-2 text-sm transition",
          "focus:outline-none focus:ring-2 focus:ring-offset-0",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-200"
            : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-200",
        )}
        {...rest}
      />

      {hint && !error && (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

/** Bien the cho <textarea>. */
export const TextAreaField = forwardRef(function TextAreaField(
  { label, error, rows = 4, className, id, ...rest },
  ref,
) {
  const fieldId = id ?? rest.name;

  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={clsx(
          "w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-200"
            : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-200",
        )}
        {...rest}
      />
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});
