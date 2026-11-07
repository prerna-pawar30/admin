import React, { useEffect, useState } from "react";
import Modal from "../../ui/Modal";
import { Button, TextArea } from "../../ui/FormField";
import { validatePunchOutRequest } from "../../../validators/PunchOutRequestValidator";
import { AttendanceService } from "../../../backend/ApiService";
import { formatDateKey, formatIstTime } from "../../../utils/IstTime";

const pad = (n) => String(n).padStart(2, "0");
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1)); // 1..12
const MINUTES = Array.from({ length: 60 }, (_, i) => pad(i)); // 00..59

// IST "HH:mm" (24h) from an ISO time
const toIstHm = (iso) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));

// hour "6", minute "00", period "PM"  ->  "18:00"
const to24h = (hour, minute, period) => {
  if (!hour || !minute) return "";
  let h = Number(hour) % 12;
  if (period === "PM") h += 12;
  return `${pad(h)}:${minute}`;
};

const EMPTY = { hour: "", minute: "", period: "PM", reason: "" };

const selectClass =
  "w-full rounded-2xl border-2 bg-white px-3 py-3 text-base font-semibold text-slate-700 outline-none focus:border-orange-400";

/**
 * "Request punch-out correction" for a day with a punch-in but no punch-out. The time is the IST
 * time the employee actually left on THAT date; the server checks it again.
 */
export default function PunchOutCorrectionDialog({ day, onClose, onSubmitted, onError }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Reset whenever a new day opens; default AM/PM = punch-in ka AM/PM
  useEffect(() => {
    const punchInHour = day ? Number(toIstHm(day.punchIn).slice(0, 2)) : 12;
    setForm({ ...EMPTY, period: punchInHour >= 12 ? "PM" : "AM" });
    setErrors({});
  }, [day]);

  const time = to24h(form.hour, form.minute, form.period); // e.g. "18:00"
  const update = (changes) => setForm((previous) => ({ ...previous, ...changes }));

  const submit = async (event) => {
    event.preventDefault();
    let payload;
    try {
      payload = validatePunchOutRequest({ time, reason: form.reason, date: day.date, punchIn: day.punchIn });
    } catch (validation) {
      setErrors(validation.validationErrors || {});
      return;
    }
    setSubmitting(true);
    try {
      await AttendanceService.submitPunchOutRequest(payload);
      onSubmitted();
    } catch (error) {
      onError(error.response?.data?.message || "Could not send the request");
    } finally {
      setSubmitting(false);
    }
  };

  const borderClass = errors.time ? "border-red-300" : "border-orange-100";

  return (
    <Modal
      open={Boolean(day)}
      onClose={onClose}
      title="Request punch-out correction"
      subtitle={day ? `${formatDateKey(day.date)} · punched in at ${formatIstTime(day.punchIn)} IST` : ""}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="punch-out-correction" disabled={submitting}>
            {submitting ? "Sending..." : "Send request"}
          </Button>
        </>
      }
    >
      <form id="punch-out-correction" onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Time you left (IST) <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <select
              aria-label="Hour"
              className={`${selectClass} ${borderClass}`}
              value={form.hour}
              onChange={(e) => update({ hour: e.target.value })}
            >
              <option value="">Hour</option>
              {HOURS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <select
              aria-label="Minute"
              className={`${selectClass} ${borderClass}`}
              value={form.minute}
              onChange={(e) => update({ minute: e.target.value })}
            >
              <option value="">Min</option>
              {MINUTES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              aria-label="AM or PM"
              className={`${selectClass} ${borderClass}`}
              value={form.period}
              onChange={(e) => update({ period: e.target.value })}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
          {errors.time ? (
            <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.time}</p>
          ) : (
            <p className="mt-1.5 text-xs text-slate-400">Same day as the punch-in. An admin will approve it.</p>
          )}
        </div>

        <TextArea
          id="correction-reason"
          label="Reason"
          required
          maxLength={500}
          value={form.reason}
          error={errors.reason}
          placeholder="e.g. Forgot to punch out before leaving"
          onChange={(e) => update({ reason: e.target.value })}
        />
      </form>
    </Modal>
  );
}