/**
 * Punch-out correction request checks run before calling the API. The server repeats them with
 * its own clock (same IST day as the punch-in, after it, not in the future, within the window).
 * Throws { validationErrors } like AuthValidator.
 */
import { istTimeInputValue, todayIstKey } from "../utils/IstTime";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * @param {{ date: string, time: string, reason: string, punchIn: string }} data
 * @returns {{ date: string, time: string, reason: string }} payload for POST /attendance/punch-out/request
 */
export const validatePunchOutRequest = ({ date, time, reason, punchIn }) => {
  const errors = {};
  if (!date) errors.date = "Missing date";
  if (!TIME.test(time || "")) errors.time = "Enter the time you left (HH:mm)";
  if (!errors.time && punchIn && time <= istTimeInputValue(punchIn)) errors.time = "Punch-out must be after your punch-in";
  if (!errors.time && date === todayIstKey() && time > istTimeInputValue(new Date())) errors.time = "Time cannot be in the future";
  const cleanReason = (reason || "").trim();
  if (cleanReason.length < 3) errors.reason = "Please give a reason";
  if (cleanReason.length > 500) errors.reason = "Reason must be under 500 characters";
  if (Object.keys(errors).length) throw { validationErrors: errors };
  return { date, time, reason: cleanReason };
};
