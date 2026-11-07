/**
 * India Standard Time display helpers. The server stores real UTC instants and IST date keys
 * ("YYYY-MM-DD"); these helpers show them in Asia/Kolkata no matter which time zone the browser
 * is in, so a date never shifts by a day. Display only - no salary or attendance rules here.
 */
export const IST_TIME_ZONE = "Asia/Kolkata";
const IST_OFFSET_MS = 330 * 60 * 1000;

const toDate = (value) => (value instanceof Date ? value : value ? new Date(value) : null);

/** "06:30 pm" */
export const formatIstTime = (value) => {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return "--:--";
  return new Intl.DateTimeFormat("en-IN", { timeZone: IST_TIME_ZONE, hour: "2-digit", minute: "2-digit", hour12: true }).format(date);
};

/** "16 Oct 2026, 06:30 pm" */
export const formatIstDateTime = (value) => {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

/**
 * Formats a date KEY ("2026-10-16") without any time-zone conversion: "Fri, 16 Oct 2026".
 * Date keys are already IST calendar dates, so they are read as UTC midnight to avoid shifting.
 */
export const formatDateKey = (dateKey, options = { weekday: "short", day: "2-digit", month: "short", year: "numeric" }) => {
  if (!dateKey) return "-";
  const date = new Date(`${String(dateKey).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return String(dateKey);
  return new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", ...options }).format(date);
};

/** Today's IST date key, e.g. "2026-10-16". */
export const todayIstKey = (now = new Date()) => new Date(now.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);

/** Current IST month and year: { month: 10, year: 2026 }. */
export const currentIstMonth = (now = new Date()) => {
  const [year, month] = todayIstKey(now).split("-").map(Number);
  return { month, year };
};

/** Shifts a { month, year } by n months. */
export const shiftMonth = ({ month, year }, offset) => {
  const index = year * 12 + (month - 1) + offset;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
};

/** Days in a month and the weekday (0 = Sunday) of its first day, for calendar grids. */
export const monthGrid = ({ month, year }) => ({
  daysInMonth: new Date(Date.UTC(year, month, 0)).getUTCDate(),
  firstWeekday: new Date(Date.UTC(year, month - 1, 1)).getUTCDay(),
});

/** 135 -> "2h 15m" */
export const minutesToHm = (minutes) => {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  return `${Math.floor(total / 60)}h ${String(total % 60).padStart(2, "0")}m`;
};

/** Milliseconds -> "02:15:07" */
export const msToClock = (milliseconds) => {
  const total = Math.max(0, Math.floor(milliseconds / 1000));
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
};

/** "HH:mm" in IST of an instant (for pre-filling a time input). */
export const istTimeInputValue = (value) => {
  const date = toDate(value);
  if (!date) return "";
  return new Date(date.getTime() + IST_OFFSET_MS).toISOString().slice(11, 16);
};

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
