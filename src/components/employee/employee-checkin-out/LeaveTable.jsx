import React from "react";
import { XCircle } from "lucide-react";
import { LEAVE_STATUS_STYLE, leaveTypeLabel, sessionLabel } from "../../../constants/LeaveConstants";
import { formatDateKey } from "../../../utils/IstTime";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../../ui/StateBlock";
import Pagination from "../../ui/Pagination";

const dateRange = (leave) =>
  leave.toDate !== leave.fromDate
    ? `${formatDateKey(leave.fromDate, { day: "2-digit", month: "short" })} → ${formatDateKey(leave.toDate, { day: "2-digit", month: "short", year: "numeric" })}`
    : formatDateKey(leave.fromDate, { day: "2-digit", month: "short", year: "numeric" });

const TypeCell = ({ leave }) => (
  <div className="flex items-center gap-2">
    <span className="font-bold text-slate-700">{leaveTypeLabel(leave.leaveType)}</span>
    {leave.leaveDuration === "HALF_DAY" && (
      <span className="rounded-md bg-orange-100 px-1.5 py-0.5 text-[11px] font-bold text-orange-700">½ {sessionLabel(leave.halfDaySession)}</span>
    )}
  </div>
);

const PaidCell = ({ leave }) =>
  leave.status === "APPROVED" ? (
    <span className="text-xs font-bold">
      <span className="text-emerald-600">{leave.paidDays ?? 0} paid</span>
      {leave.unpaidDays > 0 && <span className="text-rose-600"> · {leave.unpaidDays} unpaid</span>}
    </span>
  ) : (
    <span className="text-slate-300">-</span>
  );

const StatusBadge = ({ status }) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${LEAVE_STATUS_STYLE[status] || "bg-slate-100 text-slate-600"}`}>{status}</span>
);

const CancelButton = ({ onClick }) => (
  <button type="button" onClick={onClick} className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold text-rose-500 transition-colors hover:bg-rose-50">
    <XCircle size={14} /> Cancel
  </button>
);

/**
 * The employee's leave requests with days (server counted), paid / unpaid, status and cancel
 * for pending ones.
 */
const LeaveTable = ({ data = [], meta, loading, error, onRetry, onCancel, page, setPage }) => {
  if (loading) return <LoadingBlock text="Loading leave" />;
  if (error) return <ErrorBlock message={error} onRetry={onRetry} />;
  if (!data.length) return <EmptyBlock title="No leave requests yet" hint="Your applications will appear here." />;

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Dates</th>
              <th className="px-4 py-3 font-semibold">Days</th>
              <th className="px-4 py-3 font-semibold">Paid</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((leave) => (
              <tr key={leave.approvalId} className="border-t border-slate-100 text-sm transition-colors hover:bg-slate-50/70">
                <td className="px-4 py-3.5"><TypeCell leave={leave} /></td>
                <td className="px-4 py-3.5 text-xs font-semibold text-slate-600">{dateRange(leave)}</td>
                <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-700">{leave.totalDays ?? "-"}</td>
                <td className="px-4 py-3.5"><PaidCell leave={leave} /></td>
                <td className="max-w-[240px] px-4 py-3.5 text-xs text-slate-500" title={leave.leaveReason}>
                  <p className="truncate">{leave.leaveReason}</p>
                  {leave.note && <p className="mt-0.5 truncate text-[11px] text-slate-400">Admin: {leave.note}</p>}
                </td>
                <td className="px-4 py-3.5"><StatusBadge status={leave.status} /></td>
                <td className="px-4 py-3.5 text-right">{leave.status === "PENDING" && <CancelButton onClick={() => onCancel(leave)} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {data.map((leave) => (
          <div key={leave.approvalId} className="rounded-2xl border border-slate-100 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <TypeCell leave={leave} />
                <p className="mt-0.5 text-xs text-slate-500">{dateRange(leave)}</p>
              </div>
              <StatusBadge status={leave.status} />
            </div>
            <p className="mt-3 text-xs text-slate-600">{leave.leaveReason}</p>
            {leave.note && <p className="mt-1 text-[11px] text-slate-400">Admin: {leave.note}</p>}
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
              <span className="text-slate-500">
                <span className="font-bold text-slate-700">{leave.totalDays ?? "-"}</span> day(s) · <PaidCell leave={leave} />
              </span>
              {leave.status === "PENDING" && <CancelButton onClick={() => onCancel(leave)} />}
            </div>
          </div>
        ))}
      </div>

      {meta && <Pagination totalItems={meta.total} itemsPerPage={meta.limit} currentPage={page} setCurrentPage={setPage} />}
    </>
  );
};

export default LeaveTable;