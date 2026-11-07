import React from "react";
import { AlertTriangle, Coffee, LogIn, LogOut, PartyPopper, Plane, TimerReset } from "lucide-react";
import { PUNCH_STATE } from "../../../constants/AttendanceStatus";
import { formatDateKey, formatIstTime, minutesToHm, msToClock } from "../../../utils/IstTime";
import { sessionLabel } from "../../../constants/LeaveConstants";

const RING_SIZE = 176;
const RING_STROKE = 14;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

// Office timing: Mon–Fri 9:00 AM – 6:00 PM (9h), Saturday 9:00 AM – 3:00 PM (6h)
const SHIFT_MINUTES = { WEEKDAY: 540, SATURDAY: 360 };
const SHIFT_LABEL = { WEEKDAY: "9:00 AM – 6:00 PM", SATURDAY: "9:00 AM – 3:00 PM" };

/**
 * Worked time so far vs. the day's expected time (9h, 6h on Saturday, half on a half-day leave).
 * Display only: the server records the punches with its own clock and decides the status.
 */
export const PunchCard = ({ today, nowMs, isBusy, onPunchIn, onPunchOut }) => {
  if (!today) return null;
  const attendance = today.attendance;

  const isSaturday = new Date(`${today.date}T00:00:00Z`).getUTCDay() === 6;
  const isOffDay = today.dayKind !== "WORKING";
  const fullShiftMinutes = isSaturday ? SHIFT_MINUTES.SATURDAY : SHIFT_MINUTES.WEEKDAY;
  const expectedMinutes =
    isOffDay || today.state === PUNCH_STATE.ON_LEAVE
      ? 0
      : today.leave?.fraction === 0.5
      ? fullShiftMinutes / 2 // half-day: 4h 30m (Sat 3h)
      : fullShiftMinutes; // 9h (Sat 6h)

  const punchIn = attendance?.punchIn ? new Date(attendance.punchIn).getTime() : null;
  const punchOut = attendance?.punchOut ? new Date(attendance.punchOut).getTime() : null;
  const workedMs = punchIn ? Math.max(0, (punchOut || nowMs) - punchIn) : 0;
  const workedMinutes = Math.floor(workedMs / 60000);
  const remainingMinutes = Math.max(0, expectedMinutes - workedMinutes);
  const extraMinutes = expectedMinutes > 0 ? Math.max(0, workedMinutes - expectedMinutes) : workedMinutes;
  const extraCounts = expectedMinutes === 0 ? extraMinutes > 0 : extraMinutes >= (today.rules?.extraMinimumMinutes ?? 30);
  const progress = expectedMinutes > 0 ? Math.min(1, workedMinutes / expectedMinutes) : punchIn ? 1 : 0;
  const isIn = today.state === PUNCH_STATE.IN;
  const ringColor = extraCounts ? "#8b5cf6" : progress >= 1 ? "#10b981" : "#f97316";

  const banner = (() => {
    if (today.state === PUNCH_STATE.ON_LEAVE) return { icon: Plane, text: `On ${today.leave?.leaveType?.toLowerCase()} leave today` };
    if (today.holiday) return { icon: PartyPopper, text: `${today.holiday.title} · time worked today is extra` };
    if (today.dayKind === "WEEKLY_OFF") return { icon: Coffee, text: "Sunday · time worked today is extra" };
    if (today.leave?.fraction === 0.5) return { icon: Plane, text: `Half-day leave (${sessionLabel(today.leave.halfDaySession)}) · ${minutesToHm(expectedMinutes)} expected` };
    return null;
  })();

  const statusPill = isIn
    ? { text: "Working", className: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500 animate-pulse" }
    : today.state === PUNCH_STATE.DONE
    ? { text: "Day complete", className: "bg-slate-100 text-slate-600", dot: "bg-slate-400" }
    : today.state === PUNCH_STATE.ON_LEAVE
    ? { text: "On leave", className: "bg-orange-50 text-orange-700", dot: "bg-orange-500" }
    : { text: "Not punched in", className: "bg-slate-100 text-slate-500", dot: "bg-slate-300" };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      {/* Top: clock + status */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">{formatIstTime(new Date(nowMs))}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
            {formatDateKey(today.date, { weekday: "long", day: "numeric", month: "long" })} · IST
          </p>
          {!isOffDay && (
            <p className="text-[11px] font-semibold text-slate-400">
              Shift: {isSaturday ? SHIFT_LABEL.SATURDAY : SHIFT_LABEL.WEEKDAY}
            </p>
          )}
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusPill.className}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${statusPill.dot}`} />
          {statusPill.text}
        </span>
      </div>

      {banner && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">
          <banner.icon size={14} /> {banner.text}
        </div>
      )}

      {/* Ring */}
      <div className="relative mx-auto my-6" style={{ width: RING_SIZE, height: RING_SIZE }}>
        <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90" aria-hidden="true">
          <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS} fill="none" stroke="#f1f5f9" strokeWidth={RING_STROKE} />
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={RING_LENGTH * (1 - progress)}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-bold text-slate-800">{msToClock(workedMs)}</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">worked</span>
          {expectedMinutes > 0 && <span className="mt-1 text-[11px] font-bold" style={{ color: ringColor }}>{Math.round(progress * 100)}%</span>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Target" value={isOffDay ? "Off day" : minutesToHm(expectedMinutes)} />
        <Stat label="Remaining" value={isOffDay ? "-" : minutesToHm(remainingMinutes)} tone={!isOffDay && remainingMinutes > 0 && isIn ? "orange" : "slate"} />
        <Stat label="Extra" value={minutesToHm(extraMinutes)} tone={extraCounts ? "violet" : "slate"} />
      </div>

      {/* In / Out */}
      {attendance && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-100 px-3 py-2">
            <LogIn size={14} className="text-emerald-500" />
            <span className="text-slate-400">In</span>
            <span className="ml-auto font-mono font-bold text-slate-700">{formatIstTime(attendance.punchIn)}</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-100 px-3 py-2">
            <LogOut size={14} className="text-rose-500" />
            <span className="text-slate-400">Out</span>
            <span className="ml-auto font-mono font-bold text-slate-700">{attendance.punchOut ? formatIstTime(attendance.punchOut) : "--:--"}</span>
          </div>
        </div>
      )}

      {/* Action */}
      <div className="mt-auto pt-5">
        {isIn ? (
          <button
            type="button"
            onClick={onPunchOut}
            disabled={isBusy || !today.canPunchOut}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 py-4 text-base font-bold uppercase tracking-wider text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-600 active:scale-[0.98] disabled:opacity-60"
          >
            <LogOut size={18} /> {isBusy ? "Processing..." : "Punch out"}
          </button>
        ) : today.state === PUNCH_STATE.DONE ? (
          <div className="w-full rounded-2xl bg-slate-100 py-4 text-center text-sm font-bold uppercase tracking-wider text-slate-500">Day complete</div>
        ) : (
          <button
            type="button"
            onClick={onPunchIn}
            disabled={isBusy || !today.canPunchIn}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-base font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            <LogIn size={18} />
            {isBusy ? "Processing..." : today.state === PUNCH_STATE.ON_LEAVE ? "On leave" : "Punch in"}
          </button>
        )}

        {extraMinutes > 0 && !extraCounts && expectedMinutes > 0 && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <TimerReset size={12} /> Extra time counts from {today.rules?.extraMinimumMinutes ?? 30} min
          </p>
        )}
        {today.missingPunchOuts?.some((day) => day.canRequestCorrection) && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-amber-700">
            <AlertTriangle size={12} /> You have a missing punch-out to correct above
          </p>
        )}
      </div>
    </div>
  );
};

const STAT_TONE = {
  slate: "bg-slate-50 text-slate-700",
  orange: "bg-orange-50 text-orange-700",
  violet: "bg-violet-50 text-violet-700",
};

const Stat = ({ label, value, tone = "slate" }) => (
  <div className={`rounded-2xl px-3 py-2.5 ${STAT_TONE[tone]}`}>
    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
    <p className="mt-0.5 font-mono text-sm font-bold">{value}</p>
  </div>
);