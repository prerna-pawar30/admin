import React from "react";

const baseInput =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70";
const inputClass = (error) => `${baseInput} ${error ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-brand-400"}`;

/** Label + control + error message. */
export const Field = ({ label, error, hint, required, htmlFor, children, className = "" }) => (
  <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
    {label && (
      <label htmlFor={htmlFor} className="text-xs font-semibold text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-[#E68736]">*</span>}
      </label>
    )}
    {children}
    {error ? <p className="text-xs font-medium text-red-500">{error}</p> : hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
  </div>
);

export const TextInput = ({ label, error, hint, required, id, className, ...props }) => (
  <Field label={label} error={error} hint={hint} required={required} htmlFor={id} className={className}>
    <input id={id} className={inputClass(error)} aria-invalid={Boolean(error)} {...props} />
  </Field>
);

export const SelectInput = ({ label, error, hint, required, id, options = [], placeholder, className, ...props }) => (
  <Field label={label} error={error} hint={hint} required={required} htmlFor={id} className={className}>
    <select id={id} className={inputClass(error)} aria-invalid={Boolean(error)} {...props}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </Field>
);

export const TextArea = ({ label, error, hint, required, id, className, ...props }) => (
  <Field label={label} error={error} hint={hint} required={required} htmlFor={id} className={className}>
    <textarea id={id} className={`${inputClass(error)} min-h-[90px] resize-y`} aria-invalid={Boolean(error)} {...props} />
  </Field>
);

/** Primary / secondary / danger buttons used by the HR screens. */
export const Button = ({ variant = "primary", className = "", children, ...props }) => {
  const styles = {
    primary: "bg-brand-500 text-white shadow-sm hover:bg-brand-600 disabled:bg-brand-300",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50",
    danger: "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-emerald-300",
    ghost: "text-slate-600 hover:bg-slate-100 disabled:opacity-50",
  };
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
