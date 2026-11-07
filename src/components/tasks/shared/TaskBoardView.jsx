/**
 * Kanban board without sideways scrolling:
 *   phones   – one column at a time, picked with the status tabs above the board;
 *   tablets  – 2 x 2 grid;
 *   desktop  – 4 columns side by side.
 * Mouse users drag a card to another column; on touch screens (where HTML drag & drop does not
 * work) every card shows a "Move to..." select instead. `canMoveTo(task, status)` decides which
 * columns accept a card, so a forbidden move is never sent to the server.
 */
import { useState } from "react";
import { STATUS_META, STATUS_ORDER } from "../../../constants/TaskConstants";
import { describeDue, DUE_TONE_CLASS } from "../../../utils/TaskFormat";
import { AvatarStack, Icon, PriorityFlag, TagChip } from "./ui";

const BoardCard = ({ task, onOpen, onMove, canMoveTo, onDragStart, onDragEnd, isDragging, showAssignees }) => {
  const due = describeDue(task);
  const targets = onMove ? STATUS_ORDER.filter((status) => status !== task.status && canMoveTo(task, status)) : [];
  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", task.taskId);
        onDragStart(task);
      }}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(task)}
      onKeyDown={(event) => event.key === "Enter" && event.target === event.currentTarget && onOpen(task)}
      className={`min-w-0 cursor-pointer rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:border-brand-200 hover:shadow-md [@media(pointer:fine)]:cursor-grab [@media(pointer:fine)]:active:cursor-grabbing ${
        isDragging ? "rotate-1 opacity-50" : ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-bold text-slate-400">{task.taskId}</span>
        <PriorityFlag priority={task.priority} showLabel={false} />
      </div>
      <p
        className={`break-words text-[13px] font-bold leading-snug [overflow-wrap:anywhere] ${
          task.status === "done" ? "text-slate-400 line-through" : "text-slate-700"
        }`}
      >
        {task.title}
      </p>
      {task.tags?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.tags.slice(0, 3).map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
          {task.tags.length > 3 && <span className="self-center text-[10px] font-bold text-slate-400">+{task.tags.length - 3}</span>}
        </div>
      )}
      {task.checklist?.total > 0 && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(task.checklist.done / task.checklist.total) * 100}%` }} />
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-bold ${DUE_TONE_CLASS[due.tone]}`}>
          <Icon name="calendar" className="h-3.5 w-3.5 opacity-70" />
          {due.label}
        </span>
        <span className="flex items-center gap-2">
          {task.commentCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
              <Icon name="comment" className="h-3.5 w-3.5" />
              {task.commentCount}
            </span>
          )}
          {showAssignees && <AvatarStack people={task.assignees} max={2} />}
        </span>
      </div>

      {/* Touch screens: no drag & drop, so offer a select. Hidden for mouse users. */}
      {targets.length > 0 && (
        <select
          value=""
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          onChange={(event) => {
            event.stopPropagation();
            if (event.target.value) onMove(task, event.target.value);
          }}
          className="mt-3 h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[11px] font-bold text-slate-600 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 [@media(pointer:fine)]:hidden"
          aria-label={`Move ${task.taskId}`}
        >
          <option value="">Move to...</option>
          {targets.map((status) => (
            <option key={status} value={status}>
              {STATUS_META[status].label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export const TaskBoardView = ({ tasks, onOpen, onMove, canMoveTo, showAssignees = false }) => {
  const [dragged, setDragged] = useState(null);
  const [overStatus, setOverStatus] = useState(null);
  const [phoneStatus, setPhoneStatus] = useState(STATUS_ORDER[0]);

  const columns = STATUS_ORDER.map((status) => ({ status, items: tasks.filter((task) => task.status === status) }));

  return (
    <div className="min-w-0 space-y-3">
      {/* Phone: pick which column to show. */}
      <div className="grid grid-cols-4 gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm sm:hidden">
        {columns.map(({ status, items }) => {
          const isActive = phoneStatus === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setPhoneStatus(status)}
              className={`flex min-w-0 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 transition-all ${
                isActive ? "bg-slate-900 text-white" : "text-slate-500"
              }`}
              aria-pressed={isActive}
            >
              <span className="w-full truncate text-center text-[10px] font-bold uppercase leading-tight tracking-wide">{STATUS_META[status].label}</span>
              <span className={`text-xs font-bold ${isActive ? "text-white" : "text-slate-700"}`}>{items.length}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {columns.map(({ status, items }) => {
          const meta = STATUS_META[status];
          const accepts = dragged && dragged.status !== status && canMoveTo(dragged, status);
          const isBlocked = dragged && dragged.status !== status && !accepts;
          return (
            <div
              key={status}
              onDragOver={(event) => {
                if (!accepts) return;
                event.preventDefault();
                setOverStatus(status);
              }}
              onDragLeave={() => setOverStatus((current) => (current === status ? null : current))}
              onDrop={(event) => {
                event.preventDefault();
                if (accepts) onMove(dragged, status);
                setDragged(null);
                setOverStatus(null);
              }}
              className={`${phoneStatus === status ? "flex" : "hidden"} min-w-0 flex-col rounded-2xl border p-2.5 transition-all sm:flex sm:min-h-[320px] sm:p-3 ${
                overStatus === status
                  ? "border-brand-300 bg-brand-50/70"
                  : isBlocked
                    ? "border-slate-200 bg-slate-50 opacity-50"
                    : "border-slate-200 bg-slate-50/70"
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-2 px-1">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: meta.dot }} />
                  <span className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-600">{meta.label}</span>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-slate-400 shadow-sm">{items.length}</span>
              </div>
              <div className="flex flex-1 flex-col gap-2.5">
                {items.map((task) => (
                  <BoardCard
                    key={task.taskId}
                    task={task}
                    onOpen={onOpen}
                    onMove={onMove}
                    canMoveTo={canMoveTo}
                    showAssignees={showAssignees}
                    isDragging={dragged?.taskId === task.taskId}
                    onDragStart={setDragged}
                    onDragEnd={() => {
                      setDragged(null);
                      setOverStatus(null);
                    }}
                  />
                ))}
                {!items.length && (
                  <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-[11px] font-bold text-slate-300">
                    {accepts ? "Drop here" : "No tasks"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};