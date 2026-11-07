/**
 * Payroll rule defaults, mirrored from the backend (src/constants/payrollsettings.constant.js).
 * DISPLAY ONLY: the live values come from GET /payroll/settings and every amount is calculated on
 * the server. Used to label the settings form and explain the rules on screen.
 */
export const DEFAULT_PAYROLL_SETTINGS = Object.freeze({
  weeklyOffDays: [0],
  standardShiftMinutes: 480,
  saturdayShiftMinutes: 360,
  lateAfterTime: "09:30",
  fullDayGraceMinutes: 10,
  halfDayThresholdPercent: 50,
  extraMinimumMinutes: 30,
  extraPayMultiplier: 1,
  extraRequiresApproval: false,
  paidLeaveQuotaPerMonth: 1,
  paidLeaveTypes: ["SICK", "CASUAL"],
  leaveBackdateDays: 7,
  leaveMaxFutureDays: 180,
  punchOutCorrectionWindowDays: 7,
  allowPunchOnOffDays: true,
});

/** Settings form fields: key, label, unit and input kind. */
export const PAYROLL_SETTING_FIELDS = Object.freeze([
  { key: "standardShiftMinutes", label: "Standard day (Mon-Fri)", unit: "minutes", kind: "number", min: 60, max: 960 },
  { key: "saturdayShiftMinutes", label: "Saturday day (09:00-15:00)", unit: "minutes", kind: "number", min: 60, max: 960 },
  { key: "fullDayGraceMinutes", label: "Full-day grace", unit: "minutes", kind: "number", min: 0, max: 120 },
  { key: "halfDayThresholdPercent", label: "Half-day threshold", unit: "% of the day", kind: "number", min: 1, max: 100 },
  { key: "extraMinimumMinutes", label: "Extra time counts from", unit: "minutes", kind: "number", min: 0, max: 600 },
  { key: "extraPayMultiplier", label: "Extra pay multiplier", unit: "x per hour", kind: "number", min: 0, max: 5, step: 0.25 },
  { key: "extraRequiresApproval", label: "Extra pay needs approval", kind: "boolean" },
  { key: "paidLeaveQuotaPerMonth", label: "Paid leave per month", unit: "days", kind: "number", min: 0, max: 31, step: 0.5 },
  { key: "leaveBackdateDays", label: "Leave back-dating limit", unit: "days", kind: "number", min: 0, max: 90 },
  { key: "leaveMaxFutureDays", label: "Leave max days ahead", unit: "days", kind: "number", min: 1, max: 730 },
  { key: "punchOutCorrectionWindowDays", label: "Punch-out correction window", unit: "days", kind: "number", min: 0, max: 90 },
  { key: "lateAfterTime", label: "Late after (IST)", kind: "time" },
  { key: "allowPunchOnOffDays", label: "Allow punching on Sundays / holidays", kind: "boolean" },
]);

export const PAYROLL_PAGE_SIZE = 20;

export const PAYROLL_COLUMNS = Object.freeze([
  { key: "name", label: "Employee" },
  { key: "baseSalary", label: "Base", money: true },
  { key: "workingDays", label: "Working days" },
  { key: "presentDays", label: "Present" },
  { key: "paidLeaveDays", label: "Paid leave" },
  { key: "unpaidLeaveDays", label: "Unpaid leave" },
  { key: "absentDays", label: "Absent" },
  { key: "halfDays", label: "Half days" },
  { key: "totalWorkedHours", label: "Worked hrs" },
  { key: "extraHours", label: "Extra hrs" },
  { key: "extraPay", label: "Extra pay", money: true },
  { key: "totalDeductions", label: "Deductions", money: true },
  { key: "netPayable", label: "Net payable", money: true },
  { key: "paymentStatus", label: "Salary status", get: (row) => PAYMENT_STATUS_LABEL[row.payment?.status] || "" },
  { key: "paidAmount", label: "Paid", money: true, get: (row) => row.payment?.paidAmount },
  { key: "balance", label: "Balance", money: true, get: (row) => row.payment?.balance },
  { key: "lastPaidOn", label: "Paid on", get: (row) => row.payment?.lastPaidOn || "" },
]);

const PAYMENT_STATUS_LABEL = { PAID: "Paid", PARTIAL: "Partly paid", DUE: "Not paid", UPCOMING: "Not paid", NOTHING_DUE: "Nothing to pay", NO_SALARY: "No salary" };

export const MONTH_STATUS_STYLE = Object.freeze({
  OPEN: "bg-sky-100 text-sky-700",
  FINALIZED: "bg-emerald-100 text-emerald-700",
});

/** Permissions used to show / hide payroll and HR screens (the server checks them again). */
export const HR_PERMISSIONS = Object.freeze({
  HOLIDAY_MANAGE: "attendance.holiday.manage",
  TEAM_ATTENDANCE_READ: "attendance.team.read",
  PAYROLL_READ: "payroll.salary.read",
  PAYROLL_UPDATE: "payroll.salary.update",
  PAYROLL_FINALIZE: "payroll.month.finalize",
  PAYROLL_SETTINGS_UPDATE: "payroll.settings.update",
  PROFILE_READ: "employee.profile.read",
  PROFILE_UPDATE: "employee.profile.update",
  SENSITIVE_READ: "employee.sensitive.read",
  DOCUMENT_READ: "employee.document.read",
  DOCUMENT_VERIFY: "employee.document.verify",
});

/** Rupees with 2 decimals: 24125 -> "₹24,125.00" */
export const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    Number(value) || 0
  );

/**
 * Salary payment state per employee and month (sent by the server as row.payment.status).
 *  PAID      - paid in full (done)
 *  PARTIAL   - part paid, balance still pending (baki)
 *  DUE       - month is over, nothing paid yet (salary deni hai)
 *  UPCOMING  - month still running, nothing paid yet
 */
export const PAYMENT_STATUS_META = Object.freeze({
  PAID: { label: "Paid", hint: "Done", badge: "bg-emerald-100 text-emerald-700", row: "bg-emerald-50/40" },
  PARTIAL: { label: "Partly paid", hint: "Balance pending", badge: "bg-amber-100 text-amber-800", row: "" },
  DUE: { label: "Not paid", hint: "Salary due", badge: "bg-rose-100 text-rose-700", row: "" },
  UPCOMING: { label: "Not paid", hint: "Month running", badge: "bg-rose-50 text-rose-600", row: "" },
  NOTHING_DUE: { label: "Nothing to pay", hint: "", badge: "bg-slate-100 text-slate-500", row: "" },
  NO_SALARY: { label: "No salary", hint: "Set a salary", badge: "bg-slate-100 text-slate-500", row: "" },
});

/** Filter tabs above the payroll table: key -> ?paymentStatus=key */
export const PAYMENT_FILTERS = Object.freeze([
  { key: "", label: "All employees" },
  { key: "unpaid", label: "Not paid", countKeys: ["dueCount", "partialCount", "upcomingCount"], tone: "rose" },
  { key: "paid", label: "Paid", countKeys: ["paidCount"], tone: "emerald" },
  { key: "partial", label: "Partly paid", countKeys: ["partialCount"], tone: "amber" },
]);

export const PAYMENT_MODES = Object.freeze([
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "UPI", label: "UPI" },
  { value: "CASH", label: "Cash" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "OTHER", label: "Other" },
]);

export const paymentModeLabel = (mode) => PAYMENT_MODES.find((item) => item.value === mode)?.label || mode;

/** Statuses where a "Mark paid" button makes sense. */
export const canPay = (row) => ["DUE", "PARTIAL", "UPCOMING"].includes(row?.payment?.status) && row?.payment?.balance > 0;
