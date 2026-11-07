/**
 * Task module constants shared by the admin and employee screens. Values match the backend
 * (src/constants/task.constants.js); labels and colours are UI only.
 */

export const STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  IN_REVIEW: "in_review",
  DONE: "done",
};

export const STATUS_META = {
  todo: { label: "To Do", dot: "#94a3b8", text: "#475569", bg: "#f1f5f9" },
  in_progress: { label: "In Progress", dot: "#3b82f6", text: "#1d4ed8", bg: "#eff6ff" },
  in_review: { label: "In Review", dot: "#f59e0b", text: "#b45309", bg: "#fffbeb" },
  done: { label: "Done", dot: "#22c55e", text: "#15803d", bg: "#f0fdf4" },
};
export const STATUS_ORDER = [STATUS.TODO, STATUS.IN_PROGRESS, STATUS.IN_REVIEW, STATUS.DONE];

export const PRIORITY_META = {
  urgent: { label: "Urgent", color: "#dc2626", bg: "#fef2f2" },
  high: { label: "High", color: "#ea580c", bg: "#fff7ed" },
  normal: { label: "Normal", color: "#2563eb", bg: "#eff6ff" },
  low: { label: "Low", color: "#64748b", bg: "#f8fafc" },
};
export const PRIORITY_ORDER = ["urgent", "high", "normal", "low"];

export const VIEWS = {
  ADMIN: [
    { key: "all", label: "All tasks" },
    { key: "open", label: "Open" },
    { key: "due_today", label: "Due today" },
    { key: "overdue", label: "Overdue" },
    { key: "in_review", label: "Needs review" },
    { key: "completed", label: "Completed" },
  ],
  EMPLOYEE: [
    { key: "open", label: "Open" },
    { key: "due_today", label: "Today" },
    { key: "upcoming", label: "Next 7 days" },
    { key: "overdue", label: "Overdue" },
    { key: "in_review", label: "In review" },
    { key: "completed", label: "Completed" },
  ],
};

export const SORT_OPTIONS = [
  { key: "dueDate:asc", label: "Due date" },
  { key: "priority:asc", label: "Priority" },
  { key: "createdAt:desc", label: "Newest" },
  { key: "updatedAt:desc", label: "Recently updated" },
  { key: "title:asc", label: "Title (A-Z)" },
];

export const PAGE_SIZE = 25;
// The board shows every open task at once, so it asks for the largest page the API allows.
export const BOARD_PAGE_SIZE = 100;

export const LIMITS = {
  TITLE_MAX: 200,
  DESCRIPTION_MAX: 5000,
  TAGS_MAX: 10,
  TAG_MAX_LENGTH: 30,
  SUBTASKS_MAX: 50,
  COMMENT_MAX: 2000,
  NOTE_MAX: 1000,
};

// Fixed palette so a tag or a person always gets the same colour on every screen.
export const ACCENT_COLORS = ["#f97316", "#0ea5e9", "#8b5cf6", "#10b981", "#e11d48", "#0f766e", "#ca8a04", "#4f46e5"];

/** Backend permission names for the admin task screens (Super Admin / Admin always pass). */
export const TASK_PERMISSIONS = Object.freeze({
  READ: "task.manage.read",
  CREATE: "task.manage.create",
  UPDATE: "task.manage.update",
  DELETE: "task.manage.delete",
});
