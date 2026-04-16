import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

// ── Shared ────────────────────────────────────────────────────────────────────

interface FieldWrapperProps {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export function FieldWrapper({ label, hint, required, error, children }: FieldWrapperProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
        {hint && <span className="ml-1.5 text-xs font-normal text-slate-400">{hint}</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, required, className = "", ...props }, ref) => {
    const borderClass = error
      ? "border-red-400 focus:ring-red-400"
      : "border-slate-300 focus:ring-indigo-500";

    return (
      <FieldWrapper label={label} hint={hint} required={required} error={error}>
        <input
          ref={ref}
          className={`w-full border ${borderClass} rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${className}`}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
Input.displayName = "Input";

// ── Textarea ──────────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, required, className = "", ...props }, ref) => {
    const borderClass = error
      ? "border-red-400 focus:ring-red-400"
      : "border-slate-300 focus:ring-indigo-500";

    return (
      <FieldWrapper label={label} hint={hint} required={required} error={error}>
        <textarea
          ref={ref}
          className={`w-full border ${borderClass} rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition resize-y ${className}`}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
Textarea.displayName = "Textarea";

// ── ErrorAlert ────────────────────────────────────────────────────────────────

export function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {message}
    </div>
  );
}
