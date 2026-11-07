/**
 * Row of stat cards from the summary endpoint. Each card is a shortcut: clicking it switches the
 * list to that quick view. 2 per row on phones, 3 on tablets, 5 on wide screens.
 */
import { useState } from "react";
import { Icon } from "./ui";

const CARD_TONES = {
  slate: "text-slate-700 bg-slate-100",
  orange: "text-brand-600 bg-brand-50",
  rose: "text-rose-600 bg-rose-50",
  amber: "text-amber-600 bg-amber-50",
  emerald: "text-emerald-600 bg-emerald-50",
  blue: "text-blue-600 bg-blue-50",
};

const StatCard = ({ label, value, hint, icon, tone, isActive, onClick, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex min-w-0 items-center gap-3 rounded-2xl border bg-white p-3 text-left shadow-sm transition-all hover:shadow-md sm:p-4 ${
      isActive ? "border-brand-300 ring-2 ring-brand-100" : "border-slate-200"
    } ${className}`}
  >
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${CARD_TONES[tone]}`}>
      <Icon name={icon} className="h-4 w-4 sm:h-5 sm:w-5" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-[11px]">{label}</span>
      <span className="flex min-w-0 items-baseline gap-1.5">
        <span className="text-lg font-bold text-slate-900 sm:text-xl">{value ?? "–"}</span>
        {hint && <span className="truncate text-[11px] font-semibold text-slate-400">{hint}</span>}
      </span>
    </span>
  </button>
);

export const TaskStats = ({ summary, activeView, onSelectView, mode }) => {
  const isAdmin = mode === "admin";
  const cards = [
    { key: "open", label: "Open", value: summary?.open, icon: "checklist", tone: "slate", hint: summary ? `of ${summary.total}` : null },
    { key: "due_today", label: "Due today", value: summary?.dueToday, icon: "calendar", tone: "orange" },
    { key: "overdue", label: "Overdue", value: summary?.overdue, icon: "alert", tone: "rose" },
    {
      key: "in_review",
      label: isAdmin ? "Needs review" : "In review",
      value: summary?.inReview,
      icon: "review",
      tone: "amber",
    },
    {
      key: "completed",
      label: "Done · 7 days",
      value: summary?.completedLast7Days,
      icon: "check",
      tone: "emerald",
      hint: summary ? `${summary.completionRate}% overall` : null,
      // Odd card out on a 2-column phone grid: let it fill the row.
      className: "col-span-2 sm:col-span-1",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <StatCard
          key={card.key}
          {...card}
          isActive={activeView === card.key}
          onClick={() => onSelectView(activeView === card.key ? (isAdmin ? "all" : "open") : card.key)}
        />
      ))}
    </div>
  );
};

const WORKLOAD_VISIBLE = 5;

/** Admin only: who has how much open work. */
export const WorkloadPanel = ({ workload = [], onSelectAssignee, selectedAssignee }) => {
  const [showAll, setShowAll] = useState(false);
  if (!workload.length) return null;
  const max = Math.max(...workload.map((row) => row.open), 1);
  const rows = showAll ? workload : workload.slice(0, WORKLOAD_VISIBLE);
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Team workload</p>
        <p className="text-[11px] font-semibold text-slate-400">open tasks</p>
      </div>
      <ul className="space-y-1.5">
        {rows.map((row) => {
          const isSelected = selectedAssignee === String(row.employeeId);
          return (
            <li key={row.employeeId}>
              <button
                type="button"
                onClick={() => onSelectAssignee(isSelected ? "" : String(row.employeeId))}
                className={`w-full rounded-lg px-2 py-1.5 text-left transition-colors ${isSelected ? "bg-brand-50" : "hover:bg-slate-50"}`}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-xs font-bold text-slate-700">{row.name}</span>
                  <span className="shrink-0 text-[11px] font-bold text-slate-500">
                    {row.open}
                    {row.overdue > 0 && <span className="ml-2 text-rose-500">{row.overdue} overdue</span>}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-400" style={{ width: `${(row.open / max) * 100}%` }} />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      {workload.length > WORKLOAD_VISIBLE && (
        <button
          type="button"
          onClick={() => setShowAll((previous) => !previous)}
          className="mt-2 w-full rounded-lg py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-50 hover:text-brand-600"
        >
          {showAll ? "Show less" : `Show all (${workload.length})`}
        </button>
      )}
    </div>
  );
};