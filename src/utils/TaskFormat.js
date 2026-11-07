/**
 * Formatting helpers for the task screens. Dates from the API are IST calendar dates
 * ("YYYY-MM-DD"); the server also sends isOverdue / isDueToday / daysLeft, so the UI never has to
 * guess the time zone.
 */
import { ACCENT_COLORS } from "../constants/TaskConstants";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-10-25" -> "25 Oct" (adds the year when it is not the current one). */
export const formatDateKey = (dateKey) => {
  if (!dateKey) return "";
  const [year, month, day] = dateKey.split("-").map(Number);
  const sameYear = year === new Date().getFullYear();
  return `${day} ${MONTHS[month - 1]}${sameYear ? "" : ` ${year}`}`;
};

/**
 * Due date label and tone for a task row.
 * Example: daysLeft -2 -> { label: "2d overdue", tone: "danger" }; 0 -> "Today"; 1 -> "Tomorrow".
 */
export const describeDue = (task) => {
  if (!task?.dueDate) return { label: "No due date", tone: "muted" };
  if (task.status === "done") return { label: formatDateKey(task.dueDate), tone: "muted" };
  const days = task.daysLeft;
  if (task.isOverdue) return { label: days === -1 ? "Yesterday" : `${Math.abs(days)}d overdue`, tone: "danger" };
  if (task.isDueToday) return { label: "Today", tone: "warning" };
  if (days === 1) return { label: "Tomorrow", tone: "warning" };
  if (days !== null && days <= 7) return { label: `In ${days} days`, tone: "default" };
  return { label: formatDateKey(task.dueDate), tone: "default" };
};

export const DUE_TONE_CLASS = {
  danger: "text-rose-600",
  warning: "text-brand-600",
  default: "text-slate-600",
  muted: "text-slate-400",
};

/** 90 -> "1h 30m", 480 -> "8h", null -> "". */
export const formatMinutes = (minutes) => {
  if (minutes === null || minutes === undefined || minutes === "") return "";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

/**
 * Reads what people type in the estimate box. "4h" -> 240, "1h 30m" -> 90, "45m" -> 45,
 * "1.5h" -> 90, "90" -> 90 (plain number = minutes), "" -> null, "abc" -> undefined (invalid).
 */
export const parseEstimate = (text) => {
  const value = String(text ?? "").trim().toLowerCase();
  if (!value) return null;
  if (/^\d+$/.test(value)) return Number(value);
  const match = value.match(/^(?:(\d+(?:\.\d+)?)\s*h)?\s*(?:(\d+)\s*m)?$/);
  if (!match || (!match[1] && !match[2])) return undefined;
  return Math.round(Number(match[1] || 0) * 60) + Number(match[2] || 0);
};

/** "Priya Patel" -> "PP". */
export const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";

/** Same text -> same colour, everywhere. */
export const colorFor = (text = "") => {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  return ACCENT_COLORS[hash % ACCENT_COLORS.length];
};

/** ISO instant -> "just now", "5m ago", "3h ago", "2d ago", or a date. */
export const timeAgo = (iso) => {
  if (!iso) return "";
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

/** Today's date key in India time, for the date inputs' default and min values. */
export const todayKeyIst = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date()
  );
