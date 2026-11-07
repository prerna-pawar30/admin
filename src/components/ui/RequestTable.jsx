import React from "react";
import { CheckCircle, IndianRupee, XCircle } from "lucide-react";
import { LEAVE_STATUS_STYLE, leaveTypeLabel, sessionLabel } from "../../constants/LeaveConstants";
import { formatDateKey, formatIstDateTime, formatIstTime } from "../../utils/IstTime";
import { EmptyBlock, LoadingBlock } from "./StateBlock";

/**
 * Admin list of leave or punch-out correction requests with approve / reject. Approved leave can
 * have its paid / unpaid split overridden (when onOverridePaid is given).
 */
const RequestTable = ({ data, loading, activeTab, onAction, onOverridePaid }) => {
  if (loading) return <LoadingBlock text="Loading requests" />;
  if (!data.length) return <EmptyBlock title="No requests" hint="Nothing matches this filter." />;
  const isLeave = activeTab === "leaves";

  return (
    <table className="w-full min-w-[820px] border-collapse text-left">
      <thead>
        <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase text-slate-400">
          <th className="px-5 py-3">Employee</th>
          <th className="px-4 py-3">{isLeave ? "Leave" : "Correction"}</th>
          <th className="px-4 py-3">{isLeave ? "Days / paid" : "Requested punch-out (IST)"}</th>
          <th className="px-4 py-3">Reason</th>
          <th className="px-5 py-3 text-right">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {data.map((item) => (
          <tr key={item.approvalId} className="align-top transition-colors hover:bg-slate-50/30">
            <td className="px-5 py-4">
              <p className="text-sm font-bold text-slate-800">
                {item.employee?.firstName} {item.employee?.lastName}
              </p>
              <p className="text-[11px] font-bold uppercase text-slate-400">{item.employee?.email}</p>
              <p className="mt-1 text-[11px] text-slate-400">Requested {formatIstDateTime(item.createdAt)}</p>
            </td>
            <td className="px-4 py-4 text-xs">
              {isLeave ? (
                <>
                  <p className="font-bold uppercase text-slate-800">
                    {leaveTypeLabel(item.leaveType)}
                    {item.leaveDuration === "HALF_DAY" && <span className="ml-1 rounded bg-orange-100 px-1 text-[11px] text-orange-700">½ {sessionLabel(item.halfDaySession)}</span>}
                  </p>
                  <p className="font-bold text-slate-500">
                    {formatDateKey(item.fromDate, { day: "2-digit", month: "short" })}
                    {item.toDate !== item.fromDate && ` → ${formatDateKey(item.toDate, { day: "2-digit", month: "short", year: "numeric" })}`}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold uppercase text-slate-800">Forgot punch-out</p>
                  <p className="font-bold text-slate-500">{formatDateKey(item.date)}</p>
                  {item.punchIn && <p className="text-slate-400">Punch-in {formatIstTime(item.punchIn)}</p>}
                </>
              )}
            </td>
            <td className="px-4 py-4 font-mono text-xs font-bold text-slate-700">
              {isLeave ? (
                <>
                  {item.totalDays ?? "-"} day(s)
                  {item.status === "APPROVED" && (
                    <p className={item.unpaidDays > 0 ? "text-red-600" : "text-emerald-600"}>
                      {item.paidDays} paid · {item.unpaidDays} unpaid{item.paidOverridden ? " (overridden)" : ""}
                    </p>
                  )}
                </>
              ) : (
                formatIstTime(item.requestedPunchOutAt || item.requestedPunchOut)
              )}
            </td>
            <td className="max-w-[240px] px-4 py-4 text-xs italic text-slate-500">
              <span className="line-clamp-3">{item.leaveReason || item.reason || "-"}</span>
              {item.note && <span className="mt-1 block not-italic text-slate-400">Note: {item.note}</span>}
            </td>
            <td className="px-5 py-4 text-right">
              {item.status === "PENDING" ? (
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    aria-label="Approve"
                    onClick={() => onAction(item, "APPROVED", isLeave ? "leave" : "punch")}
                    className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition-all hover:bg-emerald-500 hover:text-white"
                  >
                    <CheckCircle size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Reject"
                    onClick={() => onAction(item, "REJECTED", isLeave ? "leave" : "punch")}
                    className="rounded-lg bg-rose-50 p-2 text-rose-600 transition-all hover:bg-rose-500 hover:text-white"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${LEAVE_STATUS_STYLE[item.status] || "text-slate-400"}`}>{item.status}</span>
                  {isLeave && item.status === "APPROVED" && onOverridePaid && (
                    <button type="button" onClick={() => onOverridePaid(item)} className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-[#E68736]">
                      <IndianRupee size={11} /> Paid / unpaid
                    </button>
                  )}
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RequestTable;
