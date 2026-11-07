import React from "react";
import { CalendarPlus, Info, Send } from "lucide-react";
import { HALF_DAY_SESSIONS, LEAVE_DURATIONS, LEAVE_TYPES } from "../../../constants/LeaveConstants";
import { SelectInput, TextArea, TextInput } from "../../ui/FormField";
import { MONTH_NAMES } from "../../../utils/IstTime";

/**
 * Leave application. HALF_DAY needs a session and uses one date. The number of days, Sundays /
 * holidays skipped and paid / unpaid are decided by the server.
 */
export const LeaveForm = ({ formData, setFormData, onSubmit, isLoading, errors = {}, balance }) => {
  const isHalfDay = formData.leaveDuration === "HALF_DAY";
  const update = (changes) => setFormData({ ...formData, ...changes });
  const usedPct = balance?.quota ? Math.min(100, (balance.used / balance.quota) * 100) : 0;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            <CalendarPlus size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Apply for leave</h2>
            <p className="text-[11px] text-slate-400">Your admin will approve or reject it</p>
          </div>
        </div>

        {balance && (
          <div className="min-w-[200px] rounded-2xl bg-orange-50 px-4 py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Paid leave · {MONTH_NAMES[balance.month - 1]}</span>
              <span className="text-sm font-bold text-orange-700">
                {balance.remaining}
                <span className="text-xs font-bold text-orange-400"> / {balance.quota} left</span>
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-orange-100">
              <div className="h-full rounded-full bg-orange-500" style={{ width: `${usedPct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4 p-5 sm:p-6" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput
            id="leave-type"
            label="Type"
            options={LEAVE_TYPES}
            value={formData.leaveType}
            error={errors.leaveType}
            onChange={(event) => update({ leaveType: event.target.value })}
          />
          <SelectInput
            id="leave-duration"
            label="Duration"
            options={LEAVE_DURATIONS}
            value={formData.leaveDuration}
            onChange={(event) =>
              update({ leaveDuration: event.target.value, toDate: event.target.value === "HALF_DAY" ? formData.fromDate : formData.toDate })
            }
          />
        </div>

        {isHalfDay && (
          <SelectInput
            id="leave-session"
            label="Session"
            options={HALF_DAY_SESSIONS}
            value={formData.halfDaySession}
            error={errors.halfDaySession}
            hint="On a half-day leave the other half is a 4h 30m working half (3h on Saturday)."
            onChange={(event) => update({ halfDaySession: event.target.value })}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="leave-from"
            type="date"
            label={isHalfDay ? "Date" : "From"}
            value={formData.fromDate}
            error={errors.fromDate}
            onChange={(event) => update({ fromDate: event.target.value, ...(isHalfDay ? { toDate: event.target.value } : {}) })}
          />
          <TextInput
            id="leave-to"
            type="date"
            label="To"
            disabled={isHalfDay}
            min={formData.fromDate || undefined}
            value={isHalfDay ? formData.fromDate : formData.toDate}
            error={errors.toDate}
            onChange={(event) => update({ toDate: event.target.value })}
          />
        </div>

        <TextArea
          id="leave-reason"
          label="Reason"
          required
          rows={3}
          maxLength={1000}
          placeholder="Tell your admin why you need this leave..."
          value={formData.leaveReason}
          error={errors.leaveReason}
          onChange={(event) => update({ leaveReason: event.target.value })}
        />

        <div className="flex items-start gap-2 rounded-2xl bg-slate-50 px-3 py-2.5 text-[11px] leading-relaxed text-slate-500">
          <Info size={13} className="mt-0.5 shrink-0 text-slate-400" />
          <span>
            Sundays and holidays inside the range are not counted.
            {formData.leaveType === "UNPAID"
              ? " Unpaid leave is always deducted."
              : balance
              ? ` ${balance.remaining} paid day(s) left this month; the rest is unpaid.`
              : ""}
          </span>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-orange-600 active:scale-[0.98] disabled:opacity-60"
        >
          <Send size={16} /> {isLoading ? "Submitting..." : "Submit request"}
        </button>
      </form>
    </div>
  );
};