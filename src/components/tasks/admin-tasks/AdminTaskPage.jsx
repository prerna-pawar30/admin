/**
 * Admin task management: dashboard counts, team workload, review queue, filterable list (grouped
 * by status, with bulk actions) or board (drag to change status), create / edit drawer and the
 * detail drawer with approve / request changes.
 *
 * Layout (no sideways scrolling anywhere):
 *   < 2xl : review queue + workload sit in a row above the tasks, so the list / board get the
 *           full content width;
 *   2xl+  : they move to a 300px sidebar on the right.
 *
 * Route: /workforce/tasks-assign (AppRoutes.jsx, behind PermissionRoute task.manage.read).
 * API: AdminTaskService (backend/ApiService.js) -> /api/v1/task/admin/...
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { ClipboardList } from "lucide-react";
import PageShell from "../../ui/PageShell";
import { AdminTaskService } from "../../../backend/ApiService";
import { TaskBoardView } from "../shared/TaskBoardView";
import { TaskDetailDrawer } from "../shared/TaskDetailDrawer";
import { TaskFormDrawer } from "./TaskFormDrawer";
import { TaskListView } from "../shared/TaskListView";
import { TaskStats, WorkloadPanel } from "../shared/TaskStats";
import { Pagination, TaskToolbar, ViewTabs } from "../shared/TaskToolbar";
import { AvatarStack, Button, EmptyState, ErrorBanner, Icon, Portal, SkeletonRows } from "../shared/ui";
import { useDebouncedValue, useTaskList, useTaskSummary } from "../../../hooks/useTaskData";
import { BOARD_PAGE_SIZE, PAGE_SIZE, PRIORITY_META, PRIORITY_ORDER, STATUS_META, STATUS_ORDER, VIEWS } from "../../../constants/TaskConstants";
import { describeDue, DUE_TONE_CLASS } from "../../../utils/TaskFormat";
import { confirmDanger, toastError, toastSuccess } from "../shared/notify";
import { adminCanMoveTo, readPreference, writePreference } from "../../../utils/TaskWorkflow";

const LAYOUT_KEY = "tasks.admin.layout";
const INITIAL_FILTERS = { view: "all", search: "", status: "", priority: "", tag: "", assignee: "", sortBy: "dueDate", order: "asc", page: 1 };

const ReviewQueue = ({ tasks, onOpen }) => (
  <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="mb-3 flex items-center justify-between gap-2">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Waiting for your review</p>
      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-600">{tasks.length}</span>
    </div>
    {tasks.length === 0 ? (
      <p className="py-3 text-xs font-semibold text-slate-400">Nothing to review. Nice.</p>
    ) : (
      <ul className="space-y-1">
        {tasks.map((task) => {
          const due = describeDue(task);
          return (
            <li key={task.taskId}>
              <button type="button" onClick={() => onOpen(task)} className="w-full rounded-lg px-2 py-2 text-left hover:bg-slate-50">
                <p className="truncate text-xs font-bold text-slate-700" title={task.title}>
                  {task.title}
                </p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <AvatarStack people={task.assignees} max={3} />
                  <span className={`shrink-0 text-[11px] font-bold ${DUE_TONE_CLASS[due.tone]}`}>{due.label}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

const bulkSelectClass = "h-9 min-w-0 flex-1 rounded-lg border-0 bg-slate-800 px-3 text-xs font-bold text-white outline-none sm:flex-none";

const BulkBar = ({ count, onStatus, onPriority, onDelete, onClear, isBusy }) => (
  <Portal>
  <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[160] flex justify-center px-3 sm:bottom-6 sm:px-4 [&>*]:pointer-events-auto">
    <div className="flex w-full max-w-xl flex-wrap items-center gap-2 rounded-2xl bg-slate-900 p-3 text-white shadow-2xl sm:w-auto sm:max-w-none sm:flex-nowrap sm:px-4">
      <div className="flex w-full items-center justify-between sm:mr-2 sm:w-auto">
        <span className="whitespace-nowrap text-xs font-bold">{count} selected</span>
        <button type="button" onClick={onClear} className="flex h-8 items-center rounded-lg px-2 text-slate-400 hover:text-white sm:hidden" aria-label="Clear selection">
          <Icon name="close" className="h-4 w-4" />
        </button>
      </div>
      <select
        disabled={isBusy}
        value=""
        onChange={(event) => event.target.value && onStatus(event.target.value)}
        className={bulkSelectClass}
        aria-label="Set status"
      >
        <option value="">Set status...</option>
        {STATUS_ORDER.map((status) => (
          <option key={status} value={status}>
            {STATUS_META[status].label}
          </option>
        ))}
      </select>
      <select
        disabled={isBusy}
        value=""
        onChange={(event) => event.target.value && onPriority(event.target.value)}
        className={bulkSelectClass}
        aria-label="Set priority"
      >
        <option value="">Set priority...</option>
        {PRIORITY_ORDER.map((priority) => (
          <option key={priority} value={priority}>
            {PRIORITY_META[priority].label}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={isBusy}
        onClick={onDelete}
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-rose-300 hover:bg-slate-800"
        aria-label="Delete selected"
      >
        <Icon name="trash" className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Delete</span>
      </button>
      <button
        type="button"
        onClick={onClear}
        className="hidden h-9 items-center rounded-lg px-3 text-xs font-bold text-slate-400 hover:text-white sm:flex"
        aria-label="Clear selection"
      >
        <Icon name="close" className="h-4 w-4" />
      </button>
    </div>
  </div>
  </Portal>
);

export default function AdminTaskPage() {
  const currentEmployeeId = useSelector((state) => state.auth.user?._id);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [layout, setLayout] = useState(() => readPreference(LAYOUT_KEY, "list"));
  const [openTaskId, setOpenTaskId] = useState(null);
  const [form, setForm] = useState({ isOpen: false, task: null });
  const [selected, setSelected] = useState(() => new Set());
  const [isBulkBusy, setIsBulkBusy] = useState(false);
  const [assigneeOptions, setAssigneeOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [reviewQueue, setReviewQueue] = useState([]);

  const search = useDebouncedValue(filters.search);
  const query = useMemo(
    () => ({
      ...filters,
      search,
      ...(layout === "board" ? { page: 1, limit: BOARD_PAGE_SIZE } : { limit: PAGE_SIZE }),
    }),
    [filters, search, layout]
  );
  const list = useTaskList(AdminTaskService.list, query);
  const { summary, reload: reloadSummary } = useTaskSummary(AdminTaskService.summary);

  const loadSideData = useCallback(() => {
    AdminTaskService.tags().then(setTagOptions).catch(() => setTagOptions([]));
    AdminTaskService
      .list({ view: "in_review", sortBy: "updatedAt", order: "asc", limit: 6 })
      .then(({ items }) => setReviewQueue(items))
      .catch(() => setReviewQueue([]));
  }, []);

  useEffect(() => {
    loadSideData();
    AdminTaskService.assignees("").then(setAssigneeOptions).catch(() => setAssigneeOptions([]));
  }, [loadSideData]);

  useEffect(() => setSelected(new Set()), [query]);

  const refreshAll = useCallback(() => {
    list.reload({ silent: true });
    reloadSummary();
    loadSideData();
  }, [list, reloadSummary, loadSideData]);

  const changeLayout = (next) => {
    setLayout(next);
    writePreference(LAYOUT_KEY, next);
  };

  const selection = {
    selected,
    toggle: (taskId) =>
      setSelected((previous) => {
        const next = new Set(previous);
        if (next.has(taskId)) next.delete(taskId);
        else next.add(taskId);
        return next;
      }),
    setMany: (taskIds, isSelected) =>
      setSelected((previous) => {
        const next = new Set(previous);
        taskIds.forEach((taskId) => (isSelected ? next.add(taskId) : next.delete(taskId)));
        return next;
      }),
  };

  const runBulk = async (action, value) => {
    const taskIds = [...selected];
    if (action === "delete") {
      const isConfirmed = await confirmDanger({ title: `Delete ${taskIds.length} task(s)?`, text: "They disappear for everyone." });
      if (!isConfirmed) return;
    }
    setIsBulkBusy(true);
    try {
      const result = await AdminTaskService.bulk(taskIds, action, value);
      toastSuccess(`${result.modified} task(s) updated`);
      setSelected(new Set());
      refreshAll();
    } catch (error) {
      toastError(error.message);
    } finally {
      setIsBulkBusy(false);
    }
  };

  const moveOnBoard = async (task, status) => {
    list.patchItem({ ...task, status });
    try {
      const updated = await AdminTaskService.changeStatus(task.taskId, status);
      list.patchItem(updated);
      toastSuccess(`${task.taskId} moved to ${STATUS_META[status].label}`);
      reloadSummary();
      loadSideData();
    } catch (error) {
      list.patchItem(task);
      toastError(error.message);
    }
  };

  const openTask = (task) => setOpenTaskId(task.taskId);
  const setView = (view) => setFilters((previous) => ({ ...previous, view, page: 1 }));

  const hasFilters = filters.search || filters.status || filters.priority || filters.tag || filters.assignee || filters.view !== "all";
  const showBulkBar = selected.size > 0 && layout === "list";

  return (
    <PageShell
      title="Task Management"
      description="Assign work, track progress and review what your team delivers."
      icon={ClipboardList}
      badge={summary ? `${summary.total} tasks` : undefined}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" icon="refresh" onClick={refreshAll} aria-label="Refresh">
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="primary" icon="plus" onClick={() => setForm({ isOpen: true, task: null })}>
            New task
          </Button>
        </div>
      }
    >
      <div className={`min-w-0 max-w-full overflow-x-clip ${showBulkBar ? "pb-36 sm:pb-24" : ""}`}>
        <TaskStats summary={summary} mode="admin" activeView={filters.view} onSelectView={setView} />

        <div className="mt-6 grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_300px]">
          <aside className="grid min-w-0 grid-cols-1 content-start gap-4 md:grid-cols-2 2xl:order-last 2xl:grid-cols-1">
            <ReviewQueue tasks={reviewQueue} onOpen={openTask} />
            <WorkloadPanel
              workload={summary?.workload}
              selectedAssignee={filters.assignee}
              onSelectAssignee={(assignee) => setFilters((previous) => ({ ...previous, assignee, page: 1 }))}
            />
          </aside>

          <main className="min-w-0 space-y-4">
            <ViewTabs views={VIEWS.ADMIN} value={filters.view} onChange={setView} />
            <TaskToolbar
              filters={filters}
              onChange={setFilters}
              layout={layout}
              onLayoutChange={changeLayout}
              assigneeOptions={assigneeOptions}
              tagOptions={tagOptions}
            />

            {list.error && <ErrorBanner error={list.error} onRetry={list.reload} />}

            {list.isLoading && !list.items.length ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <SkeletonRows />
              </div>
            ) : !list.items.length && !list.error ? (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                {hasFilters ? (
                  <EmptyState
                    icon="filter"
                    title="No tasks match these filters"
                    text="Try another view or clear the filters."
                    action={
                      <Button variant="secondary" onClick={() => setFilters(INITIAL_FILTERS)}>
                        Clear filters
                      </Button>
                    }
                  />
                ) : (
                  <EmptyState
                    title="No tasks yet"
                    text="Create the first task and assign it to your team."
                    action={
                      <Button variant="brand" icon="plus" onClick={() => setForm({ isOpen: true, task: null })}>
                        Create task
                      </Button>
                    }
                  />
                )}
              </div>
            ) : layout === "board" ? (
              <TaskBoardView tasks={list.items} onOpen={openTask} onMove={moveOnBoard} canMoveTo={adminCanMoveTo} showAssignees />
            ) : (
              <>
                <div className={list.isLoading ? "pointer-events-none opacity-60 transition-opacity" : "transition-opacity"}>
                  <TaskListView
                    tasks={list.items}
                    showAssignees
                    selection={selection}
                    onOpen={openTask}
                    renderQuickAction={(task) =>
                      task.status === "in_review" ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openTask(task);
                          }}
                          className="whitespace-nowrap rounded-lg bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 hover:bg-amber-100"
                        >
                          Review
                        </button>
                      ) : null
                    }
                  />
                </div>
                <Pagination meta={list.meta} onPage={(page) => setFilters((previous) => ({ ...previous, page }))} />
              </>
            )}
          </main>
        </div>
      </div>

      {showBulkBar && (
        <BulkBar
          count={selected.size}
          isBusy={isBulkBusy}
          onStatus={(status) => runBulk("status", status)}
          onPriority={(priority) => runBulk("priority", priority)}
          onDelete={() => runBulk("delete")}
          onClear={() => setSelected(new Set())}
        />
      )}

      <TaskDetailDrawer
        taskId={openTaskId}
        mode="admin"
        currentEmployeeId={currentEmployeeId}
        onClose={() => setOpenTaskId(null)}
        onChanged={(task) => {
          list.patchItem(task);
          reloadSummary();
          loadSideData();
        }}
        onEdit={(task) => {
          setOpenTaskId(null);
          setForm({ isOpen: true, task });
        }}
        onDeleted={() => {
          setOpenTaskId(null);
          refreshAll();
        }}
      />

      <TaskFormDrawer
        isOpen={form.isOpen}
        task={form.task}
        tagSuggestions={tagOptions}
        onClose={() => setForm({ isOpen: false, task: null })}
        onSaved={(task) => {
          setForm({ isOpen: false, task: null });
          refreshAll();
          setOpenTaskId(task.taskId);
        }}
      />
    </PageShell>
  );
}