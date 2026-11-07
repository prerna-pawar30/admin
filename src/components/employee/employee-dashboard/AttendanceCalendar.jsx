import React from "react";
import { CalendarDays } from "lucide-react";
import MonthPicker from "../../ui/MonthPicker";
import { ErrorBlock } from "../../ui/StateBlock";
import { CALENDAR_LEGEND, DAY_STATUS_STYLE, EXTRA_STYLE, styleForStatus } from "../../../constants/AttendanceStatus";
import { leaveTypeLabel, sessionLabel } from "../../../constants/LeaveConstants";
import { WEEKDAY_SHORT, minutesToHm, monthGrid } from "../../../utils/IstTime";

const pad = (n) => String(n).padStart(2, "0");
const EMPTY_STYLE = { cell: "border-slate-100 bg-white", label: "", dot: "bg-slate-200" };

const dayTitle = (day, style) =>
  [
    day.date,
    day.holidayTitle,
    style.label,
    day.leave &&
      `${leaveTypeLabel(day.leave.leaveType)} leave${day.leave.fraction === 0.5 ? ` (${day.leave.halfDaySession?.toLowerCase()})` : ""}${day.leave.isPending ? " - pending" : ""}`,
    day.workedMinutes ? `Worked ${minutesToHm(day.workedMinutes)}` : null,
    day.extraMinutes ? `Extra ${minutesToHm(day.extraMinutes)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

const SummaryItem = ({ label, value, className = "text-slate-800" }) => (
  <div className="rounded-2xl bg-slate-50 px-4 py-3">
    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
    <p className={`mt-0.5 text-lg font-bold ${className}`}>{value}</p>
  </div>
);

/**
 * Month calendar for the logged-in employee (GET /attendance/my-calendar). Status, holidays and
 * leave are decided by the server; this only displays them.
 */
const AttendanceCalendar = ({ calendar, month, onMonthChange, loading = false, error, onRetry, onDayClick }) => {
  const { daysInMonth, firstWeekday } = monthGrid(month);
  const serverDays = calendar?.days || [];

  // Server ke days na ho tab bhi dates ka grid dikhe
  const days = serverDays.length
    ? serverDays
    : Array.from({ length: daysInMonth }, (_, i) => ({ date: `${month.year}-${pad(month.month)}-${pad(i + 1)}` }));

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            <CalendarDays size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Attendance calendar</h2>
            <p className="text-[11px] text-slate-400">Tap or hover a day for details</p>
          </div>
        </div>
        <MonthPicker value={month} onChange={onMonthChange} />
      </div>

      {error ? (
        <ErrorBlock message={error} onRetry={onRetry} />
      ) : (
        <>
          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {WEEKDAY_SHORT.map((name) => (
              <div key={name} className="pb-1 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {name}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {Array.from({ length: firstWeekday }).map((_, index) => (
              <div key={`blank-${index}`} />
            ))}

            {loading
              ? Array.from({ length: daysInMonth }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-2xl bg-slate-100 sm:h-24" />
                ))
              : days.map((day) => {
                  const style = day.status ? styleForStatus(day.status) : EMPTY_STYLE;
                  const dayNumber = Number(day.date.slice(8, 10));
                  const label = day.holidayTitle || style.label;
                  const Tag = onDayClick ? "button" : "div";

                  return (
                    <Tag
                      key={day.date}
                      type={onDayClick ? "button" : undefined}
                      onClick={onDayClick ? () => onDayClick(day) : undefined}
                      title={dayTitle(day, style)}
                      className={`relative flex h-14 flex-col justify-between overflow-hidden rounded-2xl border p-1.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md sm:h-24 sm:p-2.5 ${style.cell} ${
                        day.leave?.isPending ? "border-dashed" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold sm:h-7 sm:w-7 sm:text-sm ${
                            day.isToday ? "bg-orange-500 text-white shadow-sm" : "text-slate-700"
                          }`}
                        >
                          {dayNumber}
                        </span>
                        {day.leave && (
                          <span
                            className={`rounded-md px-1 py-0.5 text-[11px] font-bold leading-none sm:text-[11px] ${
                              day.leave.isPending ? "border border-dashed border-orange-400 text-orange-600" : "bg-orange-500 text-white"
                            }`}
                          >
                            {day.leave.fraction === 0.5 ? `½ ${sessionLabel(day.leave.halfDaySession)}` : "L"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {label && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot || "bg-slate-300"}`} />}
                        <span className="hidden truncate text-[11px] font-bold uppercase tracking-wide text-slate-600 sm:block">{label}</span>
                        <span className="ml-auto flex gap-0.5">
                          {day.isLate && <span className="h-1.5 w-1.5 rounded-full bg-purple-500" title="Late" />}
                          {day.extraMinutes > 0 && <span className={`h-1.5 w-1.5 rounded-full ${EXTRA_STYLE.dot}`} title="Extra" />}
                        </span>
                      </div>
                    </Tag>
                  );
                })}
          </div>

          {/* Legend */}
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-4" aria-label="Legend">
            {CALENDAR_LEGEND.map((key) => (
              <li key={key} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${DAY_STATUS_STYLE[key].dot}`} />
                <span className="text-[11px] font-semibold text-slate-500">{DAY_STATUS_STYLE[key].label}</span>
              </li>
            ))}
            <li className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${EXTRA_STYLE.dot}`} />
              <span className="text-[11px] font-semibold text-slate-500">{EXTRA_STYLE.label}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
              <span className="text-[11px] font-semibold text-slate-500">Late</span>
            </li>
          </ul>

          {/* Month summary */}
          {calendar?.summary && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              <SummaryItem label="Working days" value={calendar.summary.workingDays} />
              <SummaryItem label="Present" value={calendar.summary.present} className="text-emerald-600" />
              <SummaryItem label="Half days" value={calendar.summary.halfDay} className="text-amber-600" />
              <SummaryItem label="Absent" value={calendar.summary.absent} className="text-rose-600" />
              <SummaryItem label="Leave" value={calendar.summary.leave} className="text-orange-600" />
              <SummaryItem label="Extra" value={minutesToHm(calendar.summary.extraMinutes)} className="text-violet-600" />
              {calendar.summary.pending > 0 && <SummaryItem label="Pending" value={calendar.summary.pending} className="text-yellow-600" />}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceCalendar;