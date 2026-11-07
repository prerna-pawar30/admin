import React from "react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";

/** Loading placeholder for a card or table area. */
export const LoadingBlock = ({ text = "Loading...", className = "" }) => (
  <div className={`flex flex-col items-center justify-center gap-3 py-16 text-slate-400 ${className}`} role="status" aria-live="polite">
    <Loader2 className="animate-spin text-[#E68736]" size={28} />
    <span className="text-xs font-bold uppercase tracking-wider">{text}</span>
  </div>
);

/** Nothing to show. */
export const EmptyBlock = ({ title = "Nothing here yet", hint, className = "" }) => (
  <div className={`flex flex-col items-center justify-center gap-2 py-16 text-center ${className}`}>
    <Inbox className="text-slate-300" size={32} />
    <p className="text-sm font-bold text-slate-600">{title}</p>
    {hint && <p className="max-w-sm text-xs text-slate-400">{hint}</p>}
  </div>
);

/** A failed request, with a retry button. */
export const ErrorBlock = ({ message = "Something went wrong", onRetry, className = "" }) => (
  <div className={`flex flex-col items-center justify-center gap-3 py-16 text-center ${className}`} role="alert">
    <AlertTriangle className="text-red-400" size={30} />
    <p className="max-w-md text-sm font-semibold text-slate-700">{message}</p>
    {onRetry && (
      <button type="button" onClick={onRetry} className="rounded-xl border border-orange-200 px-4 py-2 text-xs font-bold text-[#E68736] hover:bg-orange-50">
        Try again
      </button>
    )}
  </div>
);
