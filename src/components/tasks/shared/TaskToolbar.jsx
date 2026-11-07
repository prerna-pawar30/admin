/**
 * Quick-view tabs, search, filters (status, priority, tag, and assignee on the admin side),
 * sort and the list / board switch. Nothing here scrolls sideways: tabs and filters wrap, and on
 * phones the filters fold behind a "Filters" button.
 */
import { useState } from "react";
import { PRIORITY_META, PRIORITY_ORDER, SORT_OPTIONS, STATUS_META, STATUS_ORDER } from "../../../constants/TaskConstants";
import { Icon } from "./ui";

const selectClass =
  "h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 pr-8 text-xs font-bold text-slate-600 outline-none transition-all focus:border-brand-300 focus:ring-2 focus:ring-brand-100 sm:w-auto sm:max-w-[200px]";

export const ViewTabs = ({ views, value, onChange }) => (
  <div className="flex flex-wrap gap-1.5">
    {views.map((view) => (
      <button
        key={view.key}
        type="button"
        onClick={() => onChange(view.key)}
        className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition-all ${
          value === view.key ? "bg-slate-900 text-white shadow-sm" : "bg-white/60 text-slate-500 hover:bg-white hover:text-slate-800"
        }`}
      >
        {view.label}
      </button>
    ))}
  </div>
);

const LayoutSwitch = ({ layout, onLayoutChange }) => (
  <div className="flex h-10 shrink-0 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
    {[
      { key: "list", icon: "list", label: "List" },
      { key: "board", icon: "board", label: "Board" },
    ].map((option) => (
      <button
        key={option.key}
        type="button"
        onClick={() => onLayoutChange(option.key)}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition-all sm:px-3 ${
          layout === option.key ? "bg-brand-50 text-brand-600" : "text-slate-400 hover:text-slate-600"
        }`}
        aria-pressed={layout === option.key}
        aria-label={option.label}
      >
        <Icon name={option.icon} className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{option.label}</span>
      </button>
    ))}
  </div>
);

export const TaskToolbar = ({ filters, onChange, layout, onLayoutChange, assigneeOptions, tagOptions = [], showStatusFilter = true }) => {
  const [showFilters, setShowFilters] = useState(false);
  const set = (patch) => onChange({ ...filters, ...patch, page: 1 });
  const activeCount = [filters.status, filters.priority, filters.tag, filters.assignee].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="relative min-w-0 flex-1">
          <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search}
            onChange={(event) => set({ search: event.target.value })}
            placeholder="Search title, TSK id, tag or person..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        {/* Phone only: fold the filters away. */}
        <button
          type="button"
          onClick={() => setShowFilters((previous) => !previous)}
          className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm sm:hidden ${
            showFilters || activeCount ? "border-brand-200 bg-brand-50 text-brand-600" : "border-slate-200 bg-white text-slate-500"
          }`}
          aria-expanded={showFilters}
          aria-label="Filters"
        >
          <Icon name="filter" className="h-4 w-4" />
          {activeCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>

        <LayoutSwitch layout={layout} onLayoutChange={onLayoutChange} />
      </div>

      <div className={`${showFilters ? "grid" : "hidden"} grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center`}>
        {showStatusFilter && (
          <select className={selectClass} value={filters.status} onChange={(event) => set({ status: event.target.value })} aria-label="Status">
            <option value="">All statuses</option>
            {STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {STATUS_META[status].label}
              </option>
            ))}
          </select>
        )}
        <select className={selectClass} value={filters.priority} onChange={(event) => set({ priority: event.target.value })} aria-label="Priority">
          <option value="">All priorities</option>
          {PRIORITY_ORDER.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_META[priority].label}
            </option>
          ))}
        </select>
        {assigneeOptions && (
          <select className={selectClass} value={filters.assignee} onChange={(event) => set({ assignee: event.target.value })} aria-label="Assignee">
            <option value="">Everyone</option>
            {assigneeOptions.map((person) => (
              <option key={person._id} value={person._id}>
                {person.name}
              </option>
            ))}
          </select>
        )}
        {tagOptions.length > 0 && (
          <select className={selectClass} value={filters.tag} onChange={(event) => set({ tag: event.target.value })} aria-label="Tag">
            <option value="">All tags</option>
            {tagOptions.map((row) => (
              <option key={row.tag} value={row.tag}>
                {row.tag}
              </option>
            ))}
          </select>
        )}
        <select
          className={selectClass}
          value={`${filters.sortBy}:${filters.order}`}
          onChange={(event) => {
            const [sortBy, order] = event.target.value.split(":");
            set({ sortBy, order });
          }}
          aria-label="Sort"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.key} value={option.key}>
              Sort: {option.label}
            </option>
          ))}
        </select>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => set({ status: "", priority: "", tag: "", assignee: "" })}
            className="col-span-2 h-10 rounded-xl px-3 text-xs font-bold text-brand-600 hover:bg-brand-50"
          >
            Clear filters ({activeCount})
          </button>
        )}
      </div>
    </div>
  );
};

export const Pagination = ({ meta, onPage }) => {
  if (!meta || meta.totalPages <= 1) return null;
  const from = (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-1 pt-4">
      <p className="text-xs font-semibold text-slate-400">
        {from}–{to} of {meta.total}
      </p>
      <div className="flex gap-1">
        <button
          type="button"
          disabled={!meta.hasPrev}
          onClick={() => onPage(meta.page - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40"
          aria-label="Previous page"
        >
          <Icon name="chevronLeft" />
        </button>
        <span className="flex h-9 items-center px-3 text-xs font-bold text-slate-600">
          {meta.page} / {meta.totalPages}
        </span>
        <button
          type="button"
          disabled={!meta.hasNext}
          onClick={() => onPage(meta.page + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40"
          aria-label="Next page"
        >
          <Icon name="chevronRight" />
        </button>
      </div>
    </div>
  );
};