/**
 * Day statuses sent by the server (calendar, payroll breakdown) and how the UI shows them.
 * Labels and colours only - the server decides the status.
 */
export const DAY_STATUS = Object.freeze({
  PRESENT: "PRESENT",
  HALF_DAY: "HALF_DAY",
  ABSENT: "ABSENT",
  LEAVE: "LEAVE",
  HALF_DAY_LEAVE: "HALF_DAY_LEAVE",
  LEAVE_PENDING: "LEAVE_PENDING",
  WEEKLY_OFF: "WEEKLY_OFF",
  HOLIDAY: "HOLIDAY",
  MISSING_PUNCH_OUT: "MISSING_PUNCH_OUT",
  CORRECTION_PENDING: "CORRECTION_PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  NOT_STARTED: "NOT_STARTED",
  UPCOMING: "UPCOMING",
  NOT_JOINED: "NOT_JOINED",
});

/** Punch card state from GET /attendance/today. */
export const PUNCH_STATE = Object.freeze({
  NOT_STARTED: "NOT_STARTED",
  IN: "IN",
  DONE: "DONE",
  HOLIDAY: "HOLIDAY",
  WEEKLY_OFF: "WEEKLY_OFF",
  ON_LEAVE: "ON_LEAVE",
});

export const DAY_STATUS_STYLE = Object.freeze({
  PRESENT: { label: "Present", cell: "bg-emerald-50 border-emerald-200 text-emerald-700", dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
  HALF_DAY: { label: "Half day", cell: "bg-amber-50 border-amber-200 text-amber-700", dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700" },
  ABSENT: { label: "Absent", cell: "bg-red-50 border-red-200 text-red-600", dot: "bg-red-500", badge: "bg-red-100 text-red-700" },
  LEAVE: { label: "Leave", cell: "bg-orange-50 border-orange-200 text-orange-700", dot: "bg-orange-500", badge: "bg-orange-100 text-orange-700" },
  HALF_DAY_LEAVE: { label: "Half leave", cell: "bg-orange-50 border-orange-200 text-orange-700", dot: "bg-orange-400", badge: "bg-orange-100 text-orange-700" },
  LEAVE_PENDING: { label: "Leave pending", cell: "bg-white border-dashed border-orange-300 text-orange-600", dot: "bg-orange-300", badge: "bg-orange-50 text-orange-600" },
  WEEKLY_OFF: { label: "Sunday", cell: "bg-slate-50 border-slate-100 text-slate-400", dot: "bg-slate-300", badge: "bg-slate-100 text-slate-500" },
  HOLIDAY: { label: "Holiday", cell: "bg-rose-50 border-rose-200 text-rose-600", dot: "bg-rose-400", badge: "bg-rose-100 text-rose-700" },
  MISSING_PUNCH_OUT: { label: "Missing punch-out", cell: "bg-yellow-50 border-yellow-300 text-yellow-800", dot: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-800" },
  CORRECTION_PENDING: { label: "Correction pending", cell: "bg-yellow-50 border-dashed border-yellow-300 text-yellow-700", dot: "bg-yellow-400", badge: "bg-yellow-50 text-yellow-700" },
  IN_PROGRESS: { label: "Working", cell: "bg-sky-50 border-sky-300 text-sky-700", dot: "bg-sky-500", badge: "bg-sky-100 text-sky-700" },
  NOT_STARTED: { label: "Today", cell: "bg-white border-sky-300 text-sky-700", dot: "bg-sky-300", badge: "bg-sky-50 text-sky-700" },
  UPCOMING: { label: "", cell: "bg-white border-slate-100 text-slate-300", dot: "", badge: "bg-slate-50 text-slate-400" },
  NOT_JOINED: { label: "Not joined", cell: "bg-slate-50 border-slate-100 text-slate-300", dot: "", badge: "bg-slate-50 text-slate-400" },
});

/** Extra-time indicator in the calendar legend. */
export const EXTRA_STYLE = Object.freeze({ label: "Extra hours", dot: "bg-violet-500", badge: "bg-violet-100 text-violet-700" });

export const CALENDAR_LEGEND = Object.freeze([
  "PRESENT",
  "HALF_DAY",
  "ABSENT",
  "LEAVE",
  "HALF_DAY_LEAVE",
  "LEAVE_PENDING",
  "HOLIDAY",
  "WEEKLY_OFF",
  "MISSING_PUNCH_OUT",
]);

export const styleForStatus = (status) => DAY_STATUS_STYLE[status] || DAY_STATUS_STYLE.UPCOMING;
