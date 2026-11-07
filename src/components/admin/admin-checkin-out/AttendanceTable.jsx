import React from "react";
import { Clock, LogIn, LogOut } from "lucide-react";
import { formatDateKey, formatIstTime, minutesToHm } from "../../utils/IstTime";
import { styleForStatus } from "../../constants/AttendanceStatus";
import { EmptyBlock } from "./StateBlock";

const workedOf = (item) =>
  item.workedMinutes ??
  (item.totalWorkedTime ? (item.totalWorkedTime.hours || 0) * 60 + (item.totalWorkedTime.minutes || 0) : null);

const statusOf = (item) => {
  if (item.requiresAdminApproval) return "CORRECTION_PENDING";
  if (item.attendanceStatus === "OPEN") return "IN_PROGRESS";
  return item.attendanceStatus || (Array.isArray(item.status) ? item.status[0] : item.status) || "PRESENT";
};

const isCorrected = (item) => Boolean(item.isCorrected || item.punchOutCorrected || item.punchOutSource === "CORRECTION");

export const EmployeeCell = ({ employee }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xs font-bold text-orange-600">
      {`${employee?.firstName?.[0] || ""}${employee?.lastName?.[0] || ""}`.toUpperCase() || "?"}
    </div>
    <div className="min-w-0">
      <p className="truncate text-sm font-bold text-slate-800">
        {employee?.firstName} {employee?.lastName}
      </p>
      <p className="truncate text-[11px] text-slate-400">{employee?.email?.toLowerCase()}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const style = styleForStatus(status);
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${style.badge || "bg-slate-100 text-slate-600"}`}>{style.label || status}</span>;
};

const PunchTimes = ({ item }) => (
  <div className="flex flex-col gap-1">
    <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-emerald-50 px-2 py-1 font-mono text-[11px] font-bold text-emerald-700">
      <LogIn size={12} /> {item.punchIn ? formatIstTime(item.punchIn) : "--:--"}
      {item.isLate && <span className="rounded bg-purple-100 px-1 font-sans text-[11px] font-bold text-purple-700">LATE</span>}
    </span>
    <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-rose-50 px-2 py-1 font-mono text-[11px] font-bold text-rose-600">
      <LogOut size={12} /> {item.punchOut ? formatIstTime(item.punchOut) : "--:--"}
      {isCorrected(item) && <span className="rounded bg-amber-100 px-1 font-sans text-[11px] font-bold text-amber-700">CORRECTED</span>}
    </span>
  </div>
);

export const SkeletonRows = ({ rows = 6 }) => (
  <div className="space-y-2 p-2">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
    ))}
  </div>
);

/** Admin attendance log (server computed status, IST times). */
const AttendanceTable = ({ data = [], loading }) => {
  if (loading) return <SkeletonRows />;
  if (!data.length) return <EmptyBlock title="No attendance found" hint="Try another filter or search." />;

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3 font-semibold">Employee</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Punch</th>
              <th className="px-4 py-3 font-semibold">Worked</th>
              <th className="px-4 py-3 font-semibold">Extra</th>
              <th className="px-4 py-3 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const worked = workedOf(item);
              return (
                <tr key={item.attendanceId || `${item.employee?.email}-${item.date}-${index}`} className="border-t border-slate-100 transition-colors hover:bg-slate-50/70">
                  <td className="px-4 py-3.5"><EmployeeCell employee={item.employee} /></td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-bold text-slate-700">{formatDateKey(item.date, { day: "2-digit", month: "short", year: "numeric" })}</p>
                    <p className="text-[11px] text-slate-400">{formatDateKey(item.date, { weekday: "long" })}</p>
                  </td>
                  <td className="px-4 py-3.5"><PunchTimes item={item} /></td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700">
                      <Clock size={13} className="text-slate-300" />
                      {item.punchOut && worked != null ? minutesToHm(worked) : <span className="text-slate-300">-</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs font-bold text-violet-700">
                    {item.extraMinutes ? `+${minutesToHm(item.extraMinutes)}` : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="px-4 py-3.5 text-right"><StatusBadge status={statusOf(item)} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="space-y-3 md:hidden">
        {data.map((item, index) => {
          const worked = workedOf(item);
          return (
            <div key={item.attendanceId || `${item.employee?.email}-${item.date}-${index}`} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex items-start justify-between gap-2">
                <EmployeeCell employee={item.employee} />
                <StatusBadge status={statusOf(item)} />
              </div>
              <p className="mt-3 text-xs font-bold text-slate-600">{formatDateKey(item.date)}</p>
              <div className="mt-2 flex items-end justify-between gap-2">
                <PunchTimes item={item} />
                <div className="text-right text-xs">
                  <p className="font-mono font-bold text-slate-700">{item.punchOut && worked != null ? minutesToHm(worked) : "-"}</p>
                  {item.extraMinutes > 0 && <p className="font-mono font-bold text-violet-700">+{minutesToHm(item.extraMinutes)}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default AttendanceTable;