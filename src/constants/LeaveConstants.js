/**
 * Leave options for forms and labels. The server validates the same values and computes the
 * number of days; the client never sends totalDays.
 */
export const LEAVE_TYPES = Object.freeze([
  { value: "SICK", label: "Sick" },
  { value: "CASUAL", label: "Casual" },
  { value: "UNPAID", label: "Unpaid" },
]);

export const LEAVE_DURATIONS = Object.freeze([
  { value: "FULL_DAY", label: "Full day" },
  { value: "HALF_DAY", label: "Half day" },
]);

export const HALF_DAY_SESSIONS = Object.freeze([
  { value: "MORNING", label: "Morning (first half)" },
  { value: "AFTERNOON", label: "Afternoon (second half)" },
]);

export const LEAVE_STATUS_STYLE = Object.freeze({
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-500",
});

export const LEAVE_REASON_MIN = 3;
export const LEAVE_REASON_MAX = 1000;

export const EMPTY_LEAVE_FORM = Object.freeze({
  leaveType: "SICK",
  leaveDuration: "FULL_DAY",
  halfDaySession: "MORNING",
  fromDate: "",
  toDate: "",
  leaveReason: "",
});

export const leaveTypeLabel = (value) => LEAVE_TYPES.find((type) => type.value === value)?.label || value;
export const sessionLabel = (value) => (value === "MORNING" ? "AM" : value === "AFTERNOON" ? "PM" : "");
