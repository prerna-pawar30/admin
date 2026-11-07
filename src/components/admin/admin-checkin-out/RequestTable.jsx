import React from "react";
import { Check, Scale, X } from "lucide-react";
import { formatDateKey, formatIstTime } from "../../utils/IstTime";
import { leaveTypeLabel, sessionLabel } from "../../constants/LeaveConstants";
import { EmptyBlock } from "./StateBlock";
import { EmployeeCell, SkeletonRows } from "./AttendanceTable";

const STATUS_STYLE = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};

// "18:00" -> "6:00 pm"
const hmTo12h = (hm) => {
  if (!hm || !/^\d{2}:\d{2}$/.test(hm)) return hm;
  const [h, m] = hm.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
};

const requestedOut = (item) =>
  item.requestedPunchOut ? formatIstTime(item.requestedPunchOut) : hmTo12h(item.requestedTime || item.time) || "--:--";

const shortDate = (date, withYear = false) =>
  date ? formatDateKey(String(date).slice(0, 10), { day: "2-digit", month: "short", ...(withYear ? { year: "numeric" } : {}) }) : "-";

const StatusBadge = ({ status }) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${STATUS_STYLE[status] || "bg-slate-100 text-slate-600"}`}>{status}</span>
);

const RequestDetail = ({ item, isLeave }) =>
  isLeave ? (
    <div>
      <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
        {leaveTypeLabel(item.leaveType)}
        {item.leaveDuration === "HALF_DAY" && (
          <span className="rounded-md bg-orange-100 px-1.5 py-0.5 text-[11px] font-bold text-orange-700">½ {sessionLabel(item.halfDaySession)}</span>
        )}
      </p>
      <p className="text-[11px] font-semibold text-slate-500">
        {shortDate(item.fromDate)}
        {item.toDate && item.toDate !== item.fromDate ? ` → ${shortDate(item.toDate, true)}` : ""}
        {item.totalDays != null && <span className="text-slate-400"> · {item.totalDays} day(s)</span>}
      </p>
      {item.status === "APPROVED" && item.paidDays != null && (
        <p className="mt-0.5 text-[11px] font-bold">
          <span className="text-emerald-600">{item.paidDays} paid</span>
          {item.unpaidDays > 0 && <span className="text-rose-600"> · {item.unpaidDays} unpaid</span>}
        </p>
      )}
    </div>
  ) : (
    <div>
      <p className="text-sm font-bold text-slate-700">{shortDate(item.date, true)}</p>
      <p className="text-[11px] font-semibold text-slate-500">
        In {item.punchIn ? formatIstTime(item.punchIn) : "--:--"} → <span className="text-rose-600">Out {requestedOut(item)}</span>
      </p>
    </div>
  );

const Actions = ({ item, isLeave, onAction, onOverridePaid }) => {
  const category = isLeave ? "leave" : "punch";
  if (item.status === "PENDING") {
    return (
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onAction(item, "APPROVED", category)}
          className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-500 hover:text-white"
        >
          <Check size={14} /> Approve
        </button>
        <button
          type="button"
          onClick={() => onAction(item, "REJECTED", category)}
          className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-500 hover:text-white"
        >
          <X size={14} /> Reject
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-end gap-2">
      {isLeave && item.status === "APPROVED" && onOverridePaid && (
        <button
          type="button"
          onClick={() => onOverridePaid(item)}
          className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100"
          title="Override paid / unpaid"
        >
          <Scale size={13} /> Paid
        </button>
      )}
      <StatusBadge status={item.status} />
    </div>
  );
};

/** Admin: leave requests or punch-out corrections, with approve / reject for pending ones. */
const RequestTable = ({ data = [], activeTab, onAction, onOverridePaid, loading }) => {
  const isLeave = activeTab === "leaves";
  if (loading) return <SkeletonRows />;
  if (!data.length) return <EmptyBlock title={isLeave ? "No leave requests" : "No punch-out requests"} hint="Try another filter or search." />;

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3 font-semibold">Employee</th>
              <th className="px-4 py-3 font-semibold">{isLeave ? "Leave" : "Correction"}</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
              <th className="px-4 py-3 text-right font-semibold">{data.some((item) => item.status === "PENDING") ? "Action" : "Status"}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.approvalId || index} className="border-t border-slate-100 transition-colors hover:bg-slate-50/70">
                <td className="px-4 py-3.5"><EmployeeCell employee={item.employee} /></td>
                <td className="px-4 py-3.5"><RequestDetail item={item} isLeave={isLeave} /></td>
                <td className="max-w-[260px] px-4 py-3.5 text-xs text-slate-500" title={item.leaveReason || item.reason}>
                  <p className="line-clamp-2">{item.leaveReason || item.reason || "-"}</p>
                  {item.note && <p className="mt-0.5 truncate text-[11px] text-slate-400">Note: {item.note}</p>}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <Actions item={item} isLeave={isLeave} onAction={onAction} onOverridePaid={onOverridePaid} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="space-y-3 md:hidden">
        {data.map((item, index) => (
          <div key={item.approvalId || index} className="rounded-2xl border border-slate-100 p-4">
            <div className="flex items-start justify-between gap-2">
              <EmployeeCell employee={item.employee} />
              {item.status !== "PENDING" && <StatusBadge status={item.status} />}
            </div>
            <div className="mt-3 rounded-xl bg-slate-50 p-3">
              <RequestDetail item={item} isLeave={isLeave} />
            </div>
            {(item.leaveReason || item.reason) && <p className="mt-3 text-xs text-slate-600">{item.leaveReason || item.reason}</p>}
            {item.note && <p className="mt-1 text-[11px] text-slate-400">Note: {item.note}</p>}
            {(item.status === "PENDING" || (isLeave && item.status === "APPROVED" && onOverridePaid)) && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <Actions item={item} isLeave={isLeave} onAction={onAction} onOverridePaid={onOverridePaid} />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default RequestTable;