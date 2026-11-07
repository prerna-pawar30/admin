import React from "react";
import { CheckCircle2, Timer, Pill, Coffee } from "lucide-react";

// 5.32 (hours) -> "5h 19m"
const hoursToHm = (hours) => {
  const total = Math.round((Number(hours) || 0) * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
};

const cards = [
  { key: "present", label: "Present days", sub: "This month", icon: CheckCircle2, tone: "emerald" },
  { key: "hours", label: "Hours worked", sub: "This month", icon: Timer, tone: "sky" },
  { key: "casual", label: "Casual leave", sub: "Max 2d / month", icon: Coffee, tone: "orange", total: 18 },
  { key: "sick", label: "Sick leave", sub: "Max 1d / month", icon: Pill, tone: "rose", total: 6 },
];

const TONES = {
  emerald: { icon: "bg-emerald-50 text-emerald-600", bar: "bg-emerald-500" },
  sky: { icon: "bg-sky-50 text-sky-600", bar: "bg-sky-500" },
  orange: { icon: "bg-orange-50 text-orange-600", bar: "bg-orange-500" },
  rose: { icon: "bg-rose-50 text-rose-600", bar: "bg-rose-500" },
};

const StatCard = ({ card, value, loading }) => {
  const Icon = card.icon;
  const tone = TONES[card.tone];
  const used = Number(value) || 0;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone.icon}`}>
          <Icon size={17} />
        </div>
      </div>

      {loading ? (
        <div className="mt-3 h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
      ) : (
        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-800">
          {card.key === "hours" ? hoursToHm(value) : used}
          {card.total ? <span className="ml-1 text-sm font-bold text-slate-400">/ {card.total}d</span> : null}
          {card.key === "present" ? <span className="ml-1 text-sm font-bold text-slate-400">days</span> : null}
        </p>
      )}

      {card.total ? (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${Math.min(100, (used / card.total) * 100)}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400">
            {Math.max(0, card.total - used)}d left this year · {card.sub}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-[11px] text-slate-400">{card.sub}</p>
      )}
    </div>
  );
};

const StatGroup = ({ stats, loading }) => {
  const values = {
    present: stats?.presentDays || 0,
    hours: stats?.totalHoursWorked || 0,
    casual: stats?.leaveTypeCount?.CASUAL || 0,
    sick: stats?.leaveTypeCount?.SICK || 0,
  };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.key} card={card} value={values[card.key]} loading={loading} />
      ))}
    </div>
  );
};

export default StatGroup;