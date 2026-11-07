/**
 * Small presentational building blocks for the task screens: icons, status / priority badges,
 * avatars, tags, buttons, drawer, modal, empty and loading states.
 */
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { PRIORITY_META, STATUS_META } from "../../../constants/TaskConstants";
import { colorFor, initials } from "../../../utils/TaskFormat";

const ICON_PATHS = {
  plus: "M12 5v14M5 12h14",
  search: "M21 21l-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z",
  close: "M6 6l12 12M18 6L6 18",
  flag: "M5 21V4m0 0h11l-2 4 2 4H5",
  calendar: "M8 3v3m8-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  clock: "M12 7v5l3 2M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z",
  check: "M5 13l4 4L19 7",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  board: "M4 4h6v16H4zM14 4h6v10h-6z",
  comment: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z",
  checklist: "M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2",
  edit: "M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  alert: "M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
  refresh: "M4 4v6h6M20 20v-6h-6M5 15a7 7 0 0 0 12 3M19 9A7 7 0 0 0 7 6",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0",
  activity: "M3 12h4l3-8 4 16 3-8h4",
  chevronDown: "M6 9l6 6 6-6",
  chevronLeft: "M15 18l-6-6 6-6",
  chevronRight: "M9 18l6-6-6-6",
  review: "M9 12l2 2 4-4M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4z",
  play: "M7 4v16l13-8z",
  undo: "M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3",
  tag: "M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9zM7.5 7.5h.01",
  filter: "M3 5h18l-7 8v6l-4 2v-8L3 5z",
  move: "M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20",
};

export const Icon = ({ name, className = "h-4 w-4", strokeWidth = 2 }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={ICON_PATHS[name]} />
  </svg>
);

export const SectionLabel = ({ children, className = "" }) => (
  <p className={`mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400 ${className}`}>{children}</p>
);

export const StatusBadge = ({ status, size = "md" }) => {
  const meta = STATUS_META[status] || STATUS_META.todo;
  const padding = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full font-bold uppercase tracking-wider ${padding}`}
      style={{ background: meta.bg, color: meta.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.dot }} />
      {meta.label}
    </span>
  );
};

export const PriorityFlag = ({ priority, showLabel = true }) => {
  const meta = PRIORITY_META[priority] || PRIORITY_META.normal;
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[11px] font-bold"
      style={{ color: meta.color }}
      title={`${meta.label} priority`}
    >
      <Icon name="flag" className="h-3.5 w-3.5" strokeWidth={2.4} />
      {showLabel && meta.label}
    </span>
  );
};

export const Avatar = ({ name, size = "md", ring = false }) => {
  const sizes = { sm: "h-6 w-6 text-[10px]", md: "h-8 w-8 text-[11px]", lg: "h-10 w-10 text-xs" };
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${sizes[size]} ${ring ? "ring-2 ring-white" : ""}`}
      style={{ background: colorFor(name) }}
      title={name}
    >
      {initials(name)}
    </span>
  );
};

export const AvatarStack = ({ people = [], max = 3, size = "sm" }) => {
  if (!people.length) return <span className="whitespace-nowrap text-[11px] font-semibold text-slate-400">Unassigned</span>;
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <span className="inline-flex shrink-0 items-center -space-x-1.5" title={people.map((person) => (person.email ? `${person.name} <${person.email}>` : person.name)).join("\n")}>
      {shown.map((person) => (
        <Avatar key={person.employeeId} name={person.name} size={size} ring />
      ))}
      {extra > 0 && (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 ring-2 ring-white">
          +{extra}
        </span>
      )}
    </span>
  );
};

export const TagChip = ({ tag, onRemove }) => {
  const color = colorFor(tag);
  return (
    <span
      className="inline-flex max-w-[150px] items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{ background: `${color}18`, color }}
      title={tag}
    >
      <span className="truncate">{tag}</span>
      {onRemove && (
        <button type="button" onClick={onRemove} className="ml-0.5 shrink-0 hover:opacity-70" aria-label={`Remove ${tag}`}>
          <Icon name="close" className="h-3 w-3" strokeWidth={3} />
        </button>
      )}
    </span>
  );
};

const BUTTON_VARIANTS = {
  primary: "bg-slate-900 text-white hover:bg-brand-600 shadow-sm",
  brand: "bg-brand-500 text-white hover:bg-brand-600 shadow-sm",
  secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
  ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
  danger: "bg-white text-rose-600 border border-rose-200 hover:bg-rose-50",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
};

export const Button = ({ variant = "secondary", icon, children, className = "", isLoading, ...props }) => (
  <button
    type="button"
    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_VARIANTS[variant]} ${className}`}
    disabled={isLoading || props.disabled}
    {...props}
  >
    {isLoading ? (
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
    ) : (
      icon && <Icon name={icon} className="h-4 w-4 shrink-0" />
    )}
    {children}
  </button>
);

/**
 * Renders overlays straight into <body>. A parent with transform / filter / animation (e.g. the
 * page wrapper) would otherwise trap `position: fixed` inside itself, so the drawer would open
 * under the app header and the backdrop would only cover the content area.
 */
export const Portal = ({ children }) => (typeof document === "undefined" ? null : createPortal(children, document.body));

const useEscape = (isOpen, onClose) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);
};

/** Right-side panel (full screen on phones). */
export const Drawer = ({ isOpen, onClose, children, width = "max-w-3xl", label }) => {
  useEscape(isOpen, onClose);
  if (!isOpen) return null;
  return (
    <Portal>
      <div className="fixed inset-0 z-[1000] flex justify-end" role="dialog" aria-modal="true" aria-label={label}>
        <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} aria-label="Close" />
        <div className={`relative flex h-[100dvh] w-full ${width} flex-col overflow-hidden bg-white shadow-2xl`}>{children}</div>
      </div>
    </Portal>
  );
};

export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  useEscape(isOpen, onClose);
  if (!isOpen) return null;
  return (
    <Portal>
    <div className="fixed inset-0 z-[1010] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="absolute inset-0 bg-slate-900/50" onClick={onClose} aria-label="Close" />
      <div className="relative flex max-h-[90dvh] w-full max-w-md flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <h3 className="min-w-0 truncate text-sm font-bold text-slate-800">{title}</h3>
          <button type="button" onClick={onClose} className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-4 sm:px-6">{footer}</div>}
      </div>
    </div>
    </Portal>
  );
};

export const EmptyState = ({ icon = "checklist", title, text, action }) => (
  <div className="flex flex-col items-center justify-center px-6 py-12 text-center sm:py-14">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
      <Icon name={icon} className="h-6 w-6" />
    </div>
    <h3 className="text-sm font-bold text-slate-700">{title}</h3>
    {text && <p className="mt-1 max-w-sm text-xs font-medium text-slate-400">{text}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const SkeletonRows = ({ rows = 5 }) => (
  <div className="divide-y divide-slate-50">
    {Array.from({ length: rows }, (_, index) => (
      <div key={index} className="flex animate-pulse items-center gap-4 px-4 py-4 sm:px-5">
        <div className="h-4 w-4 rounded bg-slate-100" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-1/2 rounded bg-slate-100" />
          <div className="h-2.5 w-1/4 rounded bg-slate-100" />
        </div>
        <div className="hidden h-3 w-16 rounded bg-slate-100 sm:block" />
        <div className="hidden h-6 w-16 rounded-full bg-slate-100 sm:block" />
      </div>
    ))}
  </div>
);

export const ErrorBanner = ({ error, onRetry }) => (
  <div className="flex flex-col gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
    <div className="flex min-w-0 items-center gap-3 text-rose-700">
      <Icon name="alert" className="h-5 w-5 shrink-0" />
      <p className="break-words text-xs font-bold">{error?.message || "Could not load tasks"}</p>
    </div>
    {onRetry && (
      <Button variant="secondary" icon="refresh" onClick={() => onRetry()} className="self-start sm:self-auto">
        Retry
      </Button>
    )}
  </div>
);

/** Avatars + the assignee's name and e-mail, so the admin sees who got the task. */
export const AssigneeSummary = ({ people = [] }) => {
  if (!people.length) return <span className="whitespace-nowrap text-[11px] font-semibold text-slate-400">Unassigned</span>;
  const [first] = people;
  const others = people.length - 1;
  return (
    <span className="flex min-w-0 items-center gap-1.5" title={people.map((person) => (person.email ? `${person.name} <${person.email}>` : person.name)).join("\n")}>
      <Avatar name={first.name} size="sm" />
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[11px] font-bold text-slate-700">
          {first.name}
          {others > 0 && <span className="font-semibold text-slate-400"> +{others}</span>}
        </span>
        {first.email && <span className="block truncate text-[10px] text-slate-400">{first.email}</span>}
      </span>
    </span>
  );
};
