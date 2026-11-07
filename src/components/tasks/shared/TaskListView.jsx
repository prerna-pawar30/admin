/**
 * Task list grouped by status (collapsible groups). Below the `lg` breakpoint each task is a
 * stacked card; from `lg` up it is a table row. Long titles wrap instead of pushing the page
 * sideways. The admin page passes `selection` to enable checkboxes for bulk actions; both pages
 * pass `renderQuickAction` for the button shown on a row.
 */
import { useState } from "react";
import { STATUS_META, STATUS_ORDER } from "../../../constants/TaskConstants";
import { describeDue, DUE_TONE_CLASS } from "../../../utils/TaskFormat";
import { AssigneeSummary, Icon, PriorityFlag, StatusBadge, TagChip } from "./ui";

const ROW_COLUMNS = "lg:grid-cols-[20px_minmax(0,1fr)_150px_108px_84px_116px]";

const Checkbox = ({ checked, onChange, label, indeterminate = false }) => (
  <input
    type="checkbox"
    aria-label={label}
    checked={checked}
    ref={(element) => element && (element.indeterminate = indeterminate)}
    onChange={onChange}
    onClick={(event) => event.stopPropagation()}
    className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-brand-500"
  />
);

const TaskMeta = ({ task }) => (
  <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5">
    <span className="font-mono text-[10px] font-bold text-slate-400">{task.taskId}</span>
    {task.tags?.slice(0, 3).map((tag) => (
      <TagChip key={tag} tag={tag} />
    ))}
    {task.tags?.length > 3 && <span className="text-[10px] font-bold text-slate-400">+{task.tags.length - 3}</span>}
    {task.checklist?.total > 0 && (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-bold ${task.checklist.done === task.checklist.total ? "text-emerald-600" : "text-slate-400"}`}
      >
        <Icon name="checklist" className="h-3.5 w-3.5" />
        {task.checklist.done}/{task.checklist.total}
      </span>
    )}
    {task.commentCount > 0 && (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
        <Icon name="comment" className="h-3.5 w-3.5" />
        {task.commentCount}
      </span>
    )}
    {task.review?.decision === "changes_requested" && task.status !== "done" && (
      <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-600">Changes requested</span>
    )}
  </div>
);

const TaskRow = ({ task, showAssignees, selection, onOpen, renderQuickAction }) => {
  const due = describeDue(task);
  const isDone = task.status === "done";
  const isSelected = selection?.selected.has(task.taskId);
  const quickAction = renderQuickAction?.(task);

  const leading = selection ? (
    <Checkbox checked={isSelected} onChange={() => selection.toggle(task.taskId)} label={`Select ${task.title}`} />
  ) : (
    <span className="block h-2.5 w-2.5 rounded-full" style={{ background: STATUS_META[task.status].dot }} />
  );

  const titleClass = `text-sm font-bold break-words [overflow-wrap:anywhere] transition-colors ${
    isDone ? "text-slate-400 line-through" : "text-slate-700 group-hover/row:text-brand-600"
  }`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(task)}
      onKeyDown={(event) => event.key === "Enter" && event.target === event.currentTarget && onOpen(task)}
      className={`group/row cursor-pointer transition-colors ${isSelected ? "bg-brand-50/60" : "hover:bg-slate-50/70"}`}
    >
      {/* Phone / tablet: stacked card. */}
      <div className="flex gap-3 px-4 py-3.5 sm:px-5 lg:hidden">
        <div className="flex h-5 shrink-0 items-center">{leading}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={titleClass}>{task.title}</p>
            <span className="mt-0.5">
              <PriorityFlag priority={task.priority} showLabel={false} />
            </span>
          </div>
          <TaskMeta task={task} />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
              {showAssignees && <AssigneeSummary people={task.assignees} />}
              <span className={`inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-bold ${DUE_TONE_CLASS[due.tone]}`}>
                <Icon name="calendar" className="h-3.5 w-3.5 opacity-70" />
                {due.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={task.status} size="sm" />
              {quickAction}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: table row. */}
      <div className={`hidden items-center gap-x-3 px-5 py-3.5 lg:grid ${ROW_COLUMNS}`}>
        <div className="flex items-center">{leading}</div>
        <div className="min-w-0">
          <p className={`${titleClass} truncate`} title={task.title}>
            {task.title}
          </p>
          <TaskMeta task={task} />
        </div>
        <div className="min-w-0">{showAssignees ? <AssigneeSummary people={task.assignees} /> : <StatusBadge status={task.status} size="sm" />}</div>
        <div className={`flex min-w-0 items-center gap-1.5 text-xs font-bold ${DUE_TONE_CLASS[due.tone]}`}>
          <Icon name="calendar" className="h-3.5 w-3.5 shrink-0 opacity-70" />
          <span className="truncate">{due.label}</span>
        </div>
        <div className="min-w-0">
          <PriorityFlag priority={task.priority} />
        </div>
        <div className="flex min-w-0 justify-end">{quickAction || (showAssignees ? <StatusBadge status={task.status} size="sm" /> : null)}</div>
      </div>
    </div>
  );
};

export const TaskListView = ({ tasks, showAssignees = false, selection, onOpen, renderQuickAction }) => {
  const [collapsed, setCollapsed] = useState({});
  const groups = STATUS_ORDER.map((status) => ({ status, items: tasks.filter((task) => task.status === status) })).filter(
    (group) => group.items.length
  );

  return (
    <div className="space-y-6">
      {groups.map(({ status, items }) => {
        const meta = STATUS_META[status];
        const ids = items.map((task) => task.taskId);
        const selectedHere = selection ? ids.filter((id) => selection.selected.has(id)).length : 0;
        const isCollapsed = collapsed[status];
        return (
          <section key={status} className="min-w-0">
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
              <button
                type="button"
                onClick={() => setCollapsed((previous) => ({ ...previous, [status]: !previous[status] }))}
                className="flex min-w-0 items-center gap-2.5"
              >
                <Icon name="chevronDown" className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                <span className="h-5 w-1.5 shrink-0 rounded-full" style={{ background: meta.dot }} />
                <h2 className="truncate text-xs font-bold uppercase tracking-wider text-slate-700">{meta.label}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">{items.length}</span>
              </button>
              {selection && (
                <button
                  type="button"
                  onClick={() => selection.setMany(ids, selectedHere !== ids.length)}
                  className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-400 transition-colors hover:text-brand-600"
                >
                  {selectedHere === ids.length ? "Unselect all" : "Select all"}
                </button>
              )}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div
                  className={`hidden gap-x-3 border-b border-slate-100 bg-slate-50/60 px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 lg:grid ${ROW_COLUMNS}`}
                >
                  <span />
                  <span>Task</span>
                  <span>{showAssignees ? "Assignees" : "Status"}</span>
                  <span>Due</span>
                  <span>Priority</span>
                  <span className="text-right">{showAssignees ? "Status" : ""}</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {items.map((task) => (
                    <TaskRow
                      key={task.taskId}
                      task={task}
                      showAssignees={showAssignees}
                      selection={selection}
                      onOpen={onOpen}
                      renderQuickAction={renderQuickAction}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};