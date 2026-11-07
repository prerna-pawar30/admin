import React, { useCallback, useEffect, useMemo, useState } from "react";
import PageShell from "../../ui/PageShell";
import MonthPicker from "../../ui/MonthPicker";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../../ui/StateBlock";
import { AdminAttendanceService } from "../../../backend/ApiService";
import { leaveTypeLabel, sessionLabel } from "../../../constants/LeaveConstants";
import { WEEKDAY_SHORT, currentIstMonth, formatDateKey, monthGrid } from "../../../utils/IstTime";

const pad = (value) => String(value).padStart(2, "0");
const errorText = (error, fallback) => error?.response?.data?.message || fallback;

/**
 * Admin team leave calendar: approved (optionally pending) leave of all employees for a month,
 * plus holidays. A list per day on a month grid, and a per-employee list underneath.
 */
export default function TeamLeaveCalendar() {
  const [month, setMonth] = useState(currentIstMonth());
  const [includePending, setIncludePending] = useState(false);
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [selectedDate, setSelectedDate] = useState(null);

  const load = useCallback(async () => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const response = await AdminAttendanceService.getTeamLeaves({ ...month, includePending });
      setState({ data: response.data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: errorText(error, "Could not load team leave") });
    }
  }, [month, includePending]);

  useEffect(() => {
    load();
  }, [load]);

  const byDate = useMemo(() => {
    const map = new Map();
    for (const leave of state.data?.leaves || []) {
      for (const day of leave.days) {
        if (!map.has(day.date)) map.set(day.date, []);
        map.get(day.date).push({ ...leave, fraction: day.fraction });
      }
    }
    return map;
  }, [state.data]);
  const holidayByDate = useMemo(() => new Map((state.data?.holidays || []).map((holiday) => [holiday.date, holiday])), [state.data]);
  const { daysInMonth, firstWeekday } = monthGrid(month);
  const dateKey = (day) => `${month.year}-${pad(month.month)}-${pad(day)}`;
  const selected = selectedDate ? byDate.get(selectedDate) || [] : null;

  return (
    <div>
      <PageShell
        title="Team Leave Calendar"
        description="Who is on leave each day of the month."
        actions={
          <>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <input type="checkbox" checked={includePending} onChange={(event) => setIncludePending(event.target.checked)} />
              Include pending
            </label>
            <MonthPicker value={month} onChange={setMonth} />
          </>
        }
      >
        <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:p-5">
          {state.loading ? (
            <LoadingBlock text="Loading team leave" />
          ) : state.error ? (
            <ErrorBlock message={state.error} onRetry={load} />
          ) : (
            <>
              <div className="mb-2 grid grid-cols-7">
                {WEEKDAY_SHORT.map((name) => (
                  <div key={name} className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {name}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {Array.from({ length: firstWeekday }).map((_, index) => (
                  <div key={`blank-${index}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const date = dateKey(index + 1);
                  const leaves = byDate.get(date) || [];
                  const holiday = holidayByDate.get(date);
                  const isSunday = (firstWeekday + index) % 7 === 0;
                  return (
                    <button
                      type="button"
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`flex min-h-[70px] flex-col items-start gap-0.5 overflow-hidden rounded-xl border p-1.5 text-left sm:min-h-[92px] ${
                        holiday ? "border-rose-200 bg-rose-50" : isSunday ? "border-slate-100 bg-slate-50" : "border-slate-100 bg-white hover:border-orange-200"
                      } ${selectedDate === date ? "ring-2 ring-[#E68736]" : ""}`}
                    >
                      <span className="text-xs font-bold text-slate-700">{index + 1}</span>
                      {holiday && <span className="w-full truncate text-[11px] font-bold text-rose-600">{holiday.title}</span>}
                      {leaves.slice(0, 2).map((leave) => (
                        <span
                          key={leave.approvalId}
                          className={`w-full truncate rounded px-1 text-[11px] font-bold ${leave.status === "PENDING" ? "border border-dashed border-orange-300 text-orange-600" : "bg-orange-100 text-orange-800"}`}
                        >
                          {leave.employee.firstName}
                          {leave.fraction === 0.5 ? ` ½${sessionLabel(leave.halfDaySession)}` : ""}
                        </span>
                      ))}
                      {leaves.length > 2 && <span className="text-[11px] font-bold text-slate-400">+{leaves.length - 2} more</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {selected && (
          <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-slate-800">
              {formatDateKey(selectedDate)}
              {holidayByDate.get(selectedDate) && <span className="ml-2 text-rose-600">· {holidayByDate.get(selectedDate).title}</span>}
            </h2>
            {!selected.length ? (
              <p className="text-sm text-slate-400">Nobody is on leave.</p>
            ) : (
              <ul className="divide-y divide-slate-50">
                {selected.map((leave) => (
                  <li key={leave.approvalId} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                    <span className="font-bold text-slate-700">
                      {leave.employee.firstName} {leave.employee.lastName}
                    </span>
                    <span className="text-xs text-slate-500">
                      {leaveTypeLabel(leave.leaveType)} · {leave.fraction === 0.5 ? `half day (${leave.halfDaySession?.toLowerCase()})` : "full day"} ·{" "}
                      {formatDateKey(leave.fromDate, { day: "2-digit", month: "short" })} → {formatDateKey(leave.toDate, { day: "2-digit", month: "short" })}
                      {leave.status === "PENDING" && <span className="ml-1 font-bold text-orange-600">(pending)</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {!state.loading && !state.error && !state.data?.leaves?.length && <EmptyBlock className="mt-4" title="No leave this month" />}
      </PageShell>
    </div>
  );
}
