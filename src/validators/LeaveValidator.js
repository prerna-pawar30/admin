/**
 * Leave form checks run before calling the API (the server checks again and computes the days).
 * Throws { validationErrors: { field: message } } like AuthValidator; returns the cleaned payload.
 */
import { LEAVE_REASON_MAX, LEAVE_REASON_MIN } from "../constants/LeaveConstants";

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * @param {{ leaveType, leaveDuration, halfDaySession, fromDate, toDate, leaveReason }} data
 * @returns {object} payload for POST /attendance/leave-request (never includes totalDays)
 */
export const validateLeaveForm = (data) => {
  const errors = {};
  const isHalfDay = data.leaveDuration === "HALF_DAY";
  const toDate = isHalfDay ? data.fromDate : data.toDate;

  if (!data.leaveType) errors.leaveType = "Choose a leave type";
  if (!DATE_KEY.test(data.fromDate || "")) errors.fromDate = "Choose a start date";
  if (!DATE_KEY.test(toDate || "")) errors.toDate = "Choose an end date";
  if (!errors.fromDate && !errors.toDate && toDate < data.fromDate) errors.toDate = "End date cannot be before the start date";
  if (isHalfDay && !["MORNING", "AFTERNOON"].includes(data.halfDaySession)) errors.halfDaySession = "Choose morning or afternoon";
  const reason = (data.leaveReason || "").trim();
  if (reason.length < LEAVE_REASON_MIN) errors.leaveReason = "Please give a reason";
  if (reason.length > LEAVE_REASON_MAX) errors.leaveReason = `Reason must be under ${LEAVE_REASON_MAX} characters`;

  if (Object.keys(errors).length) throw { validationErrors: errors };

  return {
    leaveType: data.leaveType,
    leaveDuration: data.leaveDuration,
    ...(isHalfDay ? { halfDaySession: data.halfDaySession } : {}),
    fromDate: data.fromDate,
    toDate,
    leaveReason: reason,
  };
};

/** Admin decision on a leave / punch-out request. A rejection needs a reason. */
export const validateDecision = ({ action, note }) => {
  const errors = {};
  if (!["APPROVED", "REJECTED"].includes(action)) errors.action = "Choose approve or reject";
  if (action === "REJECTED" && !(note || "").trim()) errors.note = "Give a reason for rejecting";
  if ((note || "").length > 500) errors.note = "Note must be under 500 characters";
  if (Object.keys(errors).length) throw { validationErrors: errors };
  const cleanNote = (note || "").trim();
  return { action, ...(cleanNote ? { note: cleanNote } : {}), ...(action === "REJECTED" ? { rejectionReason: cleanNote } : {}) };
};

/** Holiday add / edit. */
export const validateHoliday = ({ date, title, type }) => {
  const errors = {};
  if (!DATE_KEY.test(date || "")) errors.date = "Choose a date";
  if ((title || "").trim().length < 2) errors.title = "Enter a holiday name";
  if (!["PUBLIC", "COMPANY"].includes(type)) errors.type = "Choose a type";
  if (Object.keys(errors).length) throw { validationErrors: errors };
  return { date, title: title.trim(), type };
};
