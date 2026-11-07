/**
 * Mirror of the backend workflow rules (services/task/taskrules.js -> employeeStatusChangeError),
 * used to enable / disable board columns and buttons. The server still checks every move.
 */

/** Can an assignee move this task to `status`? */
export const employeeCanMoveTo = (task, status) => {
  if (task.status === status) return false;
  if (task.status === "done") return false;
  const needsReview = task.requiresReview !== false;
  if (status === "done") return !needsReview;
  if (status === "in_review") return needsReview;
  return true;
};

/** Admins can move a task anywhere. */
export const adminCanMoveTo = (task, status) => task.status !== status;

/** Remembered per browser (list / board), never required. */
export const readPreference = (key, fallback) => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};

export const writePreference = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: the preference just is not remembered.
  }
};
