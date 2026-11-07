/**
 * Employee "My Tasks": my counts, quick views (today, next 7 days, overdue ...), list or board of
 * the tasks assigned to me, one-click Start / Submit / Done, and the detail drawer with checklist
 * and comments. Only needs a login on the backend.
 *
 * Route: /workforce/my-tasks (AppRoutes.jsx). API: MyTaskService -> /api/v1/task/my/...
 */
import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { ClipboardCheck } from "lucide-react";
import PageShell from "../../ui/PageShell";
import { MyTaskService } from "../../../backend/ApiService";
import { TaskBoardView } from "../shared/TaskBoardView";
import { TaskDetailDrawer } from "../shared/TaskDetailDrawer";
import { TaskListView } from "../shared/TaskListView";
import { TaskStats } from "../shared/TaskStats";
import { Pagination, TaskToolbar, ViewTabs } from "../shared/TaskToolbar";
import { Button, EmptyState, ErrorBanner, SkeletonRows } from "../shared/ui";
import { useDebouncedValue, useTaskList, useTaskSummary } from "../../../hooks/useTaskData";
import { BOARD_PAGE_SIZE, PAGE_SIZE, STATUS_META, VIEWS } from "../../../constants/TaskConstants";
import { confirmAction, toastError, toastSuccess } from "../shared/notify";
import { employeeCanMoveTo, readPreference, writePreference } from "../../../utils/TaskWorkflow";

const LAYOUT_KEY = "tasks.my.layout";
const BOARD_STATUS_VIEWS = ["open", "in_review", "completed"];
const INITIAL_FILTERS = { view: "open", search: "", status: "", priority: "", tag: "", sortBy: "dueDate", order: "asc", page: 1 };

const EMPTY_TEXT = {
  open: ["You're all caught up", "No open tasks assigned to you right now."],
  due_today: ["Nothing due today", "Check the next 7 days to plan ahead."],
  upcoming: ["Nothing due this week", "No open tasks are due in the next 7 days."],
  overdue: ["No overdue tasks", "Everything is on schedule."],
  in_review: ["Nothing waiting for review", "Tasks you submit appear here until an admin reviews them."],
  completed: ["No completed tasks yet", "Finished tasks will show up here."],
};

const QuickAction = ({ task, onMove }) => {
  const stop = (handler) => (event) => {
    event.stopPropagation();
    handler();
  };
  const base = "rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all";
  if (task.status === "todo") {
    return (
      <button type="button" onClick={stop(() => onMove(task, "in_progress"))} className={`${base} bg-slate-100 text-slate-600 hover:bg-brand-500 hover:text-white`}>
        Start
      </button>
    );
  }
  if (task.status === "in_progress") {
    const needsReview = task.requiresReview !== false;
    return (
      <button
        type="button"
        onClick={stop(() => onMove(task, needsReview ? "in_review" : "done"))}
        className={`${base} ${needsReview ? "bg-brand-50 text-brand-600 hover:bg-brand-500 hover:text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white"}`}
      >
        {needsReview ? "Submit" : "Done"}
      </button>
    );
  }
  if (task.status === "in_review") return <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Awaiting review</span>;
  return null;
};

export default function TaskDashboard() {
  const currentEmployeeId = useSelector((state) => state.auth.user?._id);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [layout, setLayout] = useState(() => readPreference(LAYOUT_KEY, "list"));
  const [openTaskId, setOpenTaskId] = useState(null);

  const search = useDebouncedValue(filters.search);
  const query = useMemo(() => {
    if (layout !== "board") return { ...filters, search, limit: PAGE_SIZE };
    // The board already splits tasks by status, so status-like views show the whole board;
    // date views (today, next 7 days, overdue) still narrow it.
    const view = BOARD_STATUS_VIEWS.includes(filters.view) ? "all" : filters.view;
    return { ...filters, search, view, page: 1, limit: BOARD_PAGE_SIZE };
  }, [filters, search, layout]);
  const list = useTaskList(MyTaskService.list, query);
  const { summary, reload: reloadSummary } = useTaskSummary(MyTaskService.summary);

  const refreshAll = useCallback(() => {
    list.reload({ silent: true });
    reloadSummary();
  }, [list, reloadSummary]);

  const changeLayout = (next) => {
    setLayout(next);
    writePreference(LAYOUT_KEY, next);
  };

  const move = async (task, status) => {
    if (status === "in_review") {
      const isConfirmed = await confirmAction({
        title: "Submit for review?",
        text: "An admin will approve it or send it back. Open the task to add a note for the reviewer.",
        confirmText: "Submit",
      });
      if (!isConfirmed) return;
    }
    list.patchItem({ ...task, status });
    try {
      const updated = await MyTaskService.changeStatus(task.taskId, status);
      list.patchItem(updated);
      toastSuccess(status === "in_review" ? "Submitted for review" : `Moved to ${STATUS_META[status].label}`);
      // A task that left the current view (e.g. submitted from "Open") disappears on refresh.
      refreshAll();
    } catch (error) {
      list.patchItem(task);
      toastError(error.message);
    }
  };

  const [emptyTitle, emptyText] = EMPTY_TEXT[filters.view] || ["No tasks found", "Try another view or clear the search."];
  const isFiltered = filters.search || filters.status || filters.priority;

  return (
    <PageShell
      title="My Tasks"
      description="Everything assigned to you, in one place."
      icon={ClipboardCheck}
      badge={summary ? `${summary.open} open` : undefined}
      actions={
        <Button variant="secondary" icon="refresh" onClick={refreshAll}>
          Refresh
        </Button>
      }
    >

        <TaskStats summary={summary} mode="employee" activeView={filters.view} onSelectView={(view) => setFilters((previous) => ({ ...previous, view, page: 1 }))} />

        <div className="mt-6 space-y-4">
          <ViewTabs views={VIEWS.EMPLOYEE} value={filters.view} onChange={(view) => setFilters((previous) => ({ ...previous, view, page: 1 }))} />
          <TaskToolbar filters={filters} onChange={setFilters} layout={layout} onLayoutChange={changeLayout} />

          {list.error && <ErrorBanner error={list.error} onRetry={list.reload} />}

          {list.isLoading && !list.items.length ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SkeletonRows />
            </div>
          ) : !list.items.length && !list.error ? (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <EmptyState
                icon={isFiltered ? "filter" : "check"}
                title={isFiltered ? "No tasks match your search" : emptyTitle}
                text={isFiltered ? "Try a different search or clear the filters." : emptyText}
                action={
                  isFiltered ? (
                    <Button variant="secondary" onClick={() => setFilters({ ...INITIAL_FILTERS, view: filters.view })}>
                      Clear filters
                    </Button>
                  ) : null
                }
              />
            </div>
          ) : layout === "board" ? (
            <TaskBoardView tasks={list.items} onOpen={(task) => setOpenTaskId(task.taskId)} onMove={move} canMoveTo={employeeCanMoveTo} />
          ) : (
            <>
              <div className={list.isLoading ? "pointer-events-none opacity-60 transition-opacity" : "transition-opacity"}>
                <TaskListView tasks={list.items} onOpen={(task) => setOpenTaskId(task.taskId)} renderQuickAction={(task) => <QuickAction task={task} onMove={move} />} />
              </div>
              <Pagination meta={list.meta} onPage={(page) => setFilters((previous) => ({ ...previous, page }))} />
            </>
          )}
        </div>

      <TaskDetailDrawer
        taskId={openTaskId}
        mode="employee"
        currentEmployeeId={currentEmployeeId}
        onClose={() => setOpenTaskId(null)}
        onChanged={(task) => {
          list.patchItem(task);
          reloadSummary();
        }}
      />
    </PageShell>
  );
}
