/**
 * One shell for every popup in the admin: modals, side drawers and phone bottom sheets.
 *
 *   <Dialog open onClose={close} size="lg">                      centered modal (sheet on phones)
 *   <Dialog open onClose={close} variant="drawer" size="xl">     right-side drawer
 *     <DialogHeader icon={FileText} title="Invoice #12" subtitle="..." onClose={close} />
 *     <DialogBody>...</DialogBody>
 *     <DialogFooter>...buttons...</DialogFooter>
 *   </Dialog>
 *
 * The dialog is rendered into <body> through a portal, so it always covers the whole screen
 * (header and sidebar included) no matter where in the page tree it is used. It also locks body
 * scroll, closes on Escape and on a backdrop click.
 */
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const SIZES = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  "2xl": "sm:max-w-5xl",
  full: "sm:max-w-6xl",
};

const DRAWER_SIZES = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-3xl",
  "2xl": "sm:max-w-5xl",
  full: "sm:max-w-6xl",
};

let openCount = 0;

const useDialogBehaviour = (open, onClose) => {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onCloseRef.current?.();
    };
    document.addEventListener("keydown", onKey);
    openCount += 1;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      openCount = Math.max(0, openCount - 1);
      if (!openCount) document.body.style.overflow = "";
    };
  }, [open]);
};

export const Portal = ({ children }) => (typeof document === "undefined" ? null : createPortal(children, document.body));

export function Dialog({
  open = true,
  onClose,
  children,
  variant = "modal",
  size = "md",
  label,
  closeOnBackdrop = true,
  className = "",
}) {
  useDialogBehaviour(open, onClose);
  if (!open) return null;

  const isDrawer = variant === "drawer";

  return (
    <Portal>
      <div
        className={`fixed inset-0 z-[1000] flex ${isDrawer ? "justify-end" : "items-end justify-center sm:items-center sm:p-6"}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close"
          className="dialog-backdrop absolute inset-0 cursor-default bg-slate-900/45 backdrop-blur-[3px]"
          onClick={closeOnBackdrop ? onClose : undefined}
        />
        <div
          className={
            isDrawer
              ? `dialog-drawer relative flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl ${DRAWER_SIZES[size] || size} ${className}`
              : `dialog-panel relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[min(88dvh,900px)] sm:rounded-2xl ${SIZES[size] || size} ${className}`
          }
        >
          {!isDrawer && <span className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-slate-200 sm:hidden" aria-hidden />}
          {children}
        </div>
      </div>
    </Portal>
  );
}

export function DialogHeader({ icon: IconComponent, title, subtitle, badge, onClose, actions, className = "" }) {
  return (
    <div className={`flex shrink-0 items-start gap-3 border-b border-slate-100 bg-white px-5 py-4 sm:px-6 ${className}`}>
      {IconComponent && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
          <IconComponent size={20} strokeWidth={2} />
        </span>
      )}
      <div className="min-w-0 flex-1 self-center">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <h2 className="min-w-0 break-words text-base font-bold leading-snug text-slate-900 sm:text-lg">{title}</h2>
          {badge}
        </div>
        {subtitle && <div className="mt-0.5 break-words text-xs font-medium text-slate-500">{subtitle}</div>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2 self-center">{actions}</div>}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="-mr-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export function DialogBody({ children, className = "", padded = true }) {
  return (
    <div className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain ${padded ? "px-5 py-5 sm:px-6" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function DialogFooter({ children, className = "" }) {
  return (
    <div
      className={`flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:px-6 ${className}`}
    >
      {children}
    </div>
  );
}

/** Buttons that match the rest of the admin. */
const BUTTON_TONES = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 shadow-sm",
  dark: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm",
  ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
  danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
};

export function DialogButton({ tone = "secondary", className = "", children, isLoading, disabled, type = "button", ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_TONES[tone]} ${className}`}
      disabled={Boolean(isLoading || disabled)}
      {...props}
    >
      {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}

export default Dialog;
