import React from "react";
import { Wrench } from "lucide-react";
import { formatDateKey, formatIstTime, minutesToHm } from "../../../utils/IstTime";
import { styleForStatus } from "../../../constants/AttendanceStatus";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../../ui/StateBlock";
import Pagination from "../../ui/Pagination";

const statusOf = (day) =>
  day.requiresAdminApproval ? "CORRECTION_PENDING" : day.attendanceStatus === "OPEN" ? "IN_PROGRESS" : day.attendanceStatus;

const DateCell = ({ date }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-50">
      <span className="text-sm font-bold leading-none text-slate-800">{date.slice(8, 10)}</span>
      <span className="text-[11px] font-bold uppercase text-slate-400">{formatDateKey(date, { month: "short" })}</span>
    </div>
    <div>
      <p className="text-sm font-bold text-slate-700">{formatDateKey(date, { weekday: "long" })}</p>
      <p className="text-[11px] text-slate-400">{formatDateKey(date, { year: "numeric" })}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const style = styleForStatus(status);
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${style.badge}`}>{style.label || status}</span>;
};

const LateTag = () => <span className="ml-1.5 rounded-md bg-purple-100 px-1.5 py-0.5 text-[11px] font-bold text-purple-700">LATE</span>;

const CorrectionButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-200"
  >
    <Wrench size={13} /> Request correction
  </button>
);

/**
 * The employee's attendance days (IST times). Days missing a punch-out get a
 * "Request correction" button while they are inside the correction window.
 */
export const HistoryTable = ({ data = [], meta, loading, error, onRetry, page, setPage, correctableDates = new Set(), onRequestCorrection }) => {
  if (loading) return <LoadingBlock text="Loading attendance" />;
  if (error) return <ErrorBlock message={error} onRetry={onRetry} />;
  if (!data.length) return <EmptyBlock title="No attendance yet" hint="Punch in to start your first day." />;

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">In</th>
              <th className="px-4 py-3 font-semibold">Out</th>
              <th className="px-4 py-3 font-semibold">Worked</th>
              <th className="px-4 py-3 font-semibold">Extra</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((day) => (
              <tr key={day.attendanceId || day.date} className="border-t border-slate-100 text-sm transition-colors hover:bg-slate-50/70">
                <td className="px-4 py-3"><DateCell date={day.date} /></td>
                <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">
                  {formatIstTime(day.punchIn)}
                  {day.isLate && <LateTag />}
                </td>
                <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">
                  {day.punchOut ? formatIstTime(day.punchOut) : <span className="text-slate-300">--:--</span>}
                </td>
                <td className="px-4 py-3 font-mono text-xs font-bold text-slate-800">
                  {day.punchOut ? minutesToHm(day.workedMinutes) : <span className="text-slate-300">-</span>}
                </td>
                <td className="px-4 py-3 font-mono text-xs font-bold text-violet-700">
                  {day.extraMinutes ? `+${minutesToHm(day.extraMinutes)}` : <span className="text-slate-300">-</span>}
                </td>
                <td className="px-4 py-3"><StatusBadge status={statusOf(day)} /></td>
                <td className="px-4 py-3 text-right">
                  {correctableDates.has(day.date) && <CorrectionButton onClick={() => onRequestCorrection(day)} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {data.map((day) => (
          <div key={day.attendanceId || day.date} className="rounded-2xl border border-slate-100 p-4">
            <div className="flex items-start justify-between gap-2">
              <DateCell date={day.date} />
              <StatusBadge status={statusOf(day)} />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              {[
                ["In", formatIstTime(day.punchIn)],
                ["Out", day.punchOut ? formatIstTime(day.punchOut) : "--:--"],
                ["Worked", day.punchOut ? minutesToHm(day.workedMinutes) : "-"],
                ["Extra", day.extraMinutes ? minutesToHm(day.extraMinutes) : "-"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 px-1 py-2">
                  <p className="text-[11px] font-bold uppercase text-slate-400">{label}</p>
                  <p className="font-mono text-[11px] font-bold text-slate-700">{value}</p>
                </div>
              ))}
            </div>
            {(day.isLate || correctableDates.has(day.date)) && (
              <div className="mt-3 flex items-center justify-between gap-2">
                {day.isLate ? <LateTag /> : <span />}
                {correctableDates.has(day.date) && <CorrectionButton onClick={() => onRequestCorrection(day)} />}
              </div>
            )}
          </div>
        ))}
      </div>

      {meta && <Pagination totalItems={meta.total} itemsPerPage={meta.limit} currentPage={page} setCurrentPage={setPage} />}
    </>
  );
};