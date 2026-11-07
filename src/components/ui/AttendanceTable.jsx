import React from "react";
import { ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react";
import { formatDateKey, formatIstTime, minutesToHm } from "../../utils/IstTime";
import { styleForStatus } from "../../constants/AttendanceStatus";
import { EmptyBlock, LoadingBlock } from "./StateBlock";

/** Admin attendance list (one row per employee per day). Times shown in IST. */
const AttendanceTable = ({ data, loading }) => {
  if (loading) return <LoadingBlock text="Loading attendance" />;
  if (!data.length) return <EmptyBlock title="No attendance found" hint="Try another date range or search." />;

  return (
    <table className="w-full min-w-[760px] border-collapse text-left">
      <thead>
        <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase text-slate-400">
          <th className="px-5 py-3">Employee</th>
          <th className="px-4 py-3">Date</th>
          <th className="px-4 py-3">Punch (IST)</th>
          <th className="px-4 py-3">Worked</th>
          <th className="px-4 py-3">Extra</th>
          <th className="px-5 py-3 text-right">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {data.map((item) => {
          const status = item.requiresAdminApproval ? "CORRECTION_PENDING" : item.attendanceStatus === "OPEN" ? "IN_PROGRESS" : item.attendanceStatus;
          const style = styleForStatus(status);
          return (
            <tr key={item.attendanceId || `${item.employee?._id}-${item.date}`} className="transition-colors hover:bg-slate-50/30">
              <td className="px-5 py-4">
                <p className="text-sm font-bold text-slate-800">
                  {item.employee?.firstName} {item.employee?.lastName}
                </p>
                <p className="text-[11px] font-bold uppercase text-slate-400">{item.employee?.email}</p>
              </td>
              <td className="px-4 py-4 text-xs font-bold text-slate-600">{formatDateKey(item.date)}</td>
              <td className="px-4 py-4">
                <div className="flex flex-col gap-1">
                  <span className="flex w-fit items-center gap-2 rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-600">
                    <ArrowDownLeft size={12} /> {formatIstTime(item.punchIn)}
                    {item.isLate && <span className="text-purple-600">LATE</span>}
                  </span>
                  <span className="flex w-fit items-center gap-2 rounded-md bg-rose-50 px-2 py-0.5 font-mono text-[11px] font-bold text-rose-500">
                    <ArrowUpRight size={12} /> {item.punchOut ? formatIstTime(item.punchOut) : "--:--"}
                    {item.punchOutSource === "CORRECTION" && <span className="text-slate-400">corrected</span>}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-300" /> {item.punchOut ? minutesToHm(item.workedMinutes) : "-"}
                </span>
              </td>
              <td className="px-4 py-4 font-mono text-xs font-bold text-violet-700">{item.extraMinutes ? minutesToHm(item.extraMinutes) : "-"}</td>
              <td className="px-5 py-4 text-right">
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${style.badge}`}>{style.label || status}</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default AttendanceTable;
