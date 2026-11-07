/**
 * Task detail drawer, shared by both sides.
 *   mode "admin":    edit, delete, change status, approve / request changes when in review.
 *   mode "employee": start, submit for review (with a note), mark done when no review is needed,
 *                    withdraw a submission, tick checklist items.
 * Both sides read and write comments and see the activity log.
 */
import { useState } from "react";
import { AdminTaskService, MyTaskService } from "../../../backend/ApiService";
import { useTaskDetail } from "../../../hooks/useTaskData";
import { LIMITS, STATUS_META, STATUS_ORDER } from "../../../constants/TaskConstants";
import { describeDue, DUE_TONE_CLASS, formatDateKey, formatMinutes, timeAgo } from "../../../utils/TaskFormat";
import { confirmDanger, toastError, toastSuccess } from "./notify";
import { Avatar, Button, Drawer, EmptyState, Icon, Modal, PriorityFlag, SectionLabel, StatusBadge, TagChip } from "./ui";

const DetailRow = ({ icon, label, children }) => (
  <div className="flex items-start gap-3 py-2.5">
    <Icon name={icon} className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-0.5 text-xs font-bold text-slate-700">{children}</div>
    </div>
  </div>
);

const Banner = ({ tone, icon, title, children }) => {
  const tones = {
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    rose: "border-rose-200 bg-rose-50 text-rose-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };
  return (
    <div className={`flex gap-3 rounded-xl border px-4 py-3 ${tones[tone]}`}>
      <Icon name={icon} className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 text-xs">
        <p className="font-bold">{title}</p>
        {children && <div className="mt-0.5 whitespace-pre-wrap font-medium opacity-90">{children}</div>}
      </div>
    </div>
  );
};

const NoteModal = ({ config, onClose, onSubmit }) => {
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  if (!config) return null;
  const submit = async () => {
    if (config.isRequired && !note.trim()) return;
    setIsSaving(true);
    try {
      await onSubmit(note.trim());
      setNote("");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={config.title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={config.variant || "brand"} onClick={submit} isLoading={isSaving} disabled={config.isRequired && !note.trim()}>
            {config.confirmText}
          </Button>
        </>
      }
    >
      <p className="mb-3 text-xs font-medium text-slate-500">{config.text}</p>
      <textarea
        autoFocus
        value={note}
        maxLength={LIMITS.NOTE_MAX}
        onChange={(event) => setNote(event.target.value)}
        placeholder={config.placeholder}
        className="min-h-[110px] w-full resize-y rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
      />
    </Modal>
  );
};

const Checklist = ({ task, canToggle, onToggle, busyId }) => {
  const items = task.subtasks || [];
  if (!items.length) return null;
  const done = items.filter((item) => item.isDone).length;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <SectionLabel className="mb-0">Checklist</SectionLabel>
        <span className="text-[11px] font-bold text-slate-400">
          {done}/{items.length}
        </span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(done / items.length) * 100}%` }} />
      </div>
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
        {items.map((item) => (
          <li key={item.subtaskId}>
            <label className={`flex items-center gap-3 px-4 py-2.5 ${canToggle ? "cursor-pointer hover:bg-slate-50" : ""}`}>
              <input
                type="checkbox"
                checked={item.isDone}
                disabled={!canToggle || busyId === item.subtaskId}
                onChange={() => onToggle(item.subtaskId)}
                className="h-4 w-4 rounded accent-emerald-600"
              />
              <span className={`min-w-0 flex-1 break-words text-xs font-medium [overflow-wrap:anywhere] ${item.isDone ? "text-slate-400 line-through" : "text-slate-700"}`}>{item.title}</span>
              {item.isDone && item.doneBy?.name && (
                <span className="hidden text-[10px] font-semibold text-slate-400 sm:inline">
                  {item.doneBy.name} · {timeAgo(item.doneAt)}
                </span>
              )}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Comments = ({ comments, currentEmployeeId, isAdmin, onAdd, onRemove }) => {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const send = async () => {
    if (!text.trim()) return;
    setIsSending(true);
    try {
      await onAdd(text.trim());
      setText("");
    } finally {
      setIsSending(false);
    }
  };
  return (
    <div>
      {comments.length === 0 ? (
        <p className="py-6 text-center text-xs font-semibold text-slate-400">No comments yet. Start the conversation.</p>
      ) : (
        <ul className="mb-4 space-y-4">
          {comments.map((comment) => {
            const isMine = String(comment.author.employeeId) === String(currentEmployeeId);
            return (
              <li key={comment.commentId} className="group flex gap-3">
                <Avatar name={comment.author.name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="min-w-0 truncate text-xs font-bold text-slate-800">{comment.author.name}</span>
                    {comment.isFromAdmin && (
                      <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">Admin</span>
                    )}
                    <span className="text-[11px] font-medium text-slate-400">{timeAgo(comment.createdAt)}</span>
                    {(isMine || isAdmin) && (
                      <button
                        type="button"
                        onClick={() => onRemove(comment)}
                        className="ml-auto p-1 text-slate-300 transition-opacity hover:text-rose-500 [@media(pointer:fine)]:opacity-0 [@media(pointer:fine)]:group-hover:opacity-100"
                        aria-label="Delete comment"
                      >
                        <Icon name="trash" className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere] rounded-xl rounded-tl-sm bg-slate-50 px-3.5 py-2.5 text-[13px] text-slate-700">{comment.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div className="rounded-xl border border-slate-200 bg-white focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100">
        <textarea
          value={text}
          maxLength={LIMITS.COMMENT_MAX}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) send();
          }}
          placeholder="Write a comment... (Ctrl + Enter to send)"
          className="min-h-[72px] w-full resize-none rounded-xl bg-transparent px-3.5 pt-3 text-sm outline-none"
        />
        <div className="flex justify-end px-2 pb-2">
          <Button variant="primary" icon="send" onClick={send} isLoading={isSending} disabled={!text.trim()} className="px-3 py-2">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

const ACTIVITY_ICONS = {
  created: "plus",
  status_changed: "refresh",
  assignees_changed: "user",
  subtask_toggled: "checklist",
  submitted_for_review: "send",
  approved: "check",
  changes_requested: "undo",
  commented: "comment",
  updated: "edit",
  deleted: "trash",
};

const ActivityLog = ({ activity = [] }) =>
  activity.length === 0 ? (
    <p className="py-6 text-center text-xs font-semibold text-slate-400">No activity yet.</p>
  ) : (
    <ol className="relative space-y-4 border-l border-slate-200 pl-6">
      {activity.map((entry, index) => (
        <li key={`${entry.at}-${index}`} className="relative">
          <span className="absolute -left-[33px] flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
            <Icon name={ACTIVITY_ICONS[entry.action] || "activity"} className="h-3 w-3" />
          </span>
          <p className="break-words text-xs text-slate-600 [overflow-wrap:anywhere]">
            <span className="font-bold text-slate-800">{entry.by?.name || "System"}</span> {entry.message}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-400">{timeAgo(entry.at)}</p>
        </li>
      ))}
    </ol>
  );

/** "E-mail sent ✓ · 5m ago" / "E-mail failed" / "No e-mail yet" + Resend, under each assignee (admin). */
const EmailStatus = ({ status, busy, onResend }) => {
  const sent = status?.status === "SENT";
  const failed = status?.status === "FAILED";
  return (
    <span className="mt-1 flex flex-wrap items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
          sent ? "bg-emerald-50 text-emerald-700" : failed ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-500"
        }`}
        title={status?.email ? `To ${status.email}` : undefined}
      >
        <Icon name={sent ? "check" : failed ? "alert" : "send"} className="h-3 w-3" />
        {sent ? `E-mail sent · ${timeAgo(status.at)}` : failed ? "E-mail failed" : "No e-mail sent"}
      </span>
      <button
        type="button"
        onClick={onResend}
        disabled={busy}
        className="text-[10px] font-bold text-brand-600 hover:underline disabled:opacity-50"
      >
        {busy ? "Sending..." : sent ? "Resend" : "Send e-mail"}
      </button>
    </span>
  );
};

export const TaskDetailDrawer = ({ taskId, mode, currentEmployeeId, onClose, onChanged, onEdit, onDeleted }) => {
  const isAdmin = mode === "admin";
  const api = isAdmin ? AdminTaskService : MyTaskService;
  const { task, setTask, comments, setComments, error, isLoading } = useTaskDetail(api, taskId);
  const [tab, setTab] = useState("comments");
  const [busy, setBusy] = useState(null);
  const [noteConfig, setNoteConfig] = useState(null);

  const apply = (updated, message) => {
    setTask(updated);
    onChanged?.(updated);
    if (message) toastSuccess(message);
  };

  const run = async (key, work, message) => {
    setBusy(key);
    try {
      apply(await work(), message);
    } catch (runError) {
      toastError(runError.message);
    } finally {
      setBusy(null);
    }
  };

  const changeStatus = (status, note) =>
    run(status, () => (isAdmin ? AdminTaskService.changeStatus(taskId, status) : MyTaskService.changeStatus(taskId, status, note)), `Moved to ${STATUS_META[status].label}`);

  const remove = async () => {
    const isConfirmed = await confirmDanger({ title: `Delete ${taskId}?`, text: "The task disappears for everyone. This cannot be undone from the app." });
    if (!isConfirmed) return;
    try {
      await AdminTaskService.remove(taskId);
      toastSuccess(`${taskId} deleted`);
      onDeleted?.(taskId);
    } catch (removeError) {
      toastError(removeError.message);
    }
  };

  const addComment = async (body) => {
    try {
      const comment = await api.addComment(taskId, body);
      setComments((previous) => [...previous, comment]);
      onChanged?.({ ...task, commentCount: (task.commentCount || 0) + 1 });
      setTask((previous) => ({ ...previous, commentCount: (previous.commentCount || 0) + 1 }));
    } catch (commentError) {
      toastError(commentError.message);
      throw commentError;
    }
  };

  const removeComment = async (comment) => {
    const isConfirmed = await confirmDanger({ title: "Delete this comment?", confirmText: "Delete" });
    if (!isConfirmed) return;
    try {
      await api.removeComment(taskId, comment.commentId);
      setComments((previous) => previous.filter((item) => item.commentId !== comment.commentId));
    } catch (commentError) {
      toastError(commentError.message);
    }
  };

  const due = task ? describeDue(task) : null;
  const needsReview = task?.requiresReview !== false;
  const changesRequested = task?.review?.decision === "changes_requested" && task?.status !== "done";

  const renderEmployeeActions = () => {
    if (!task) return null;
    if (task.status === "todo") {
      return (
        <Button variant="brand" icon="play" isLoading={busy === "in_progress"} onClick={() => changeStatus("in_progress")}>
          Start task
        </Button>
      );
    }
    if (task.status === "in_progress") {
      return (
        <>
          <Button variant="ghost" isLoading={busy === "todo"} onClick={() => changeStatus("todo")}>
            Move to To Do
          </Button>
          {needsReview ? (
            <Button
              variant="brand"
              icon="send"
              onClick={() =>
                setNoteConfig({
                  title: "Submit for review",
                  text: "Tell the reviewer what you did (optional). They will approve it or ask for changes.",
                  placeholder: "e.g. Report uploaded to the shared drive, numbers checked against October payroll.",
                  confirmText: "Submit",
                  onSubmit: (note) => changeStatus("in_review", note),
                })
              }
            >
              Submit for review
            </Button>
          ) : (
            <Button variant="success" icon="check" isLoading={busy === "done"} onClick={() => changeStatus("done")}>
              Mark as done
            </Button>
          )}
        </>
      );
    }
    if (task.status === "in_review") {
      return (
        <Button variant="secondary" icon="undo" isLoading={busy === "in_progress"} onClick={() => changeStatus("in_progress")}>
          Withdraw submission
        </Button>
      );
    }
    return null;
  };

  const renderAdminActions = () => {
    if (!task) return null;
    return (
      <>
        <Button variant="danger" icon="trash" onClick={remove} className="sm:mr-auto" aria-label="Delete task">
          <span className="hidden sm:inline">Delete</span>
        </Button>
        <Button variant="secondary" icon="edit" onClick={() => onEdit(task)} className="flex-1 sm:flex-none">
          Edit
        </Button>
        {task.status === "in_review" ? (
          <>
            <Button
              variant="secondary"
              icon="undo"
              className="flex-1 sm:flex-none"
              onClick={() =>
                setNoteConfig({
                  title: "Request changes",
                  text: "The task goes back to In Progress and the assignee sees your note.",
                  placeholder: "What needs to change?",
                  confirmText: "Send back",
                  variant: "primary",
                  isRequired: true,
                  onSubmit: (note) => run("review", () => AdminTaskService.review(taskId, "changes_requested", note), "Sent back with your note"),
                })
              }
            >
              Request changes
            </Button>
            <Button variant="success" icon="check" className="w-full sm:w-auto" isLoading={busy === "review"} onClick={() => run("review", () => AdminTaskService.review(taskId, "approve"), "Task approved")}>
              Approve
            </Button>
          </>
        ) : (
          <select
            value={task.status}
            disabled={Boolean(busy)}
            onChange={(event) => changeStatus(event.target.value)}
            className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold sm:flex-none text-slate-700 outline-none focus:ring-2 focus:ring-brand-100"
            aria-label="Change status"
          >
            {STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {STATUS_META[status].label}
              </option>
            ))}
          </select>
        )}
      </>
    );
  };

  return (
    <Drawer isOpen={Boolean(taskId)} onClose={onClose} label="Task details">
      <div className="shrink-0 border-b border-slate-100 bg-white px-4 py-3.5 sm:px-6 sm:py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="font-mono text-xs font-bold text-slate-400">{taskId}</span>
            {task && <StatusBadge status={task.status} />}
            {task && <PriorityFlag priority={task.priority} />}
          </div>
          <button type="button" onClick={onClose} className="-mr-1.5 -mt-1 shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        {task && (
          <h2 className="mt-2 break-words text-lg font-bold leading-snug text-slate-900 [overflow-wrap:anywhere] sm:text-xl">{task.title}</h2>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {isLoading && !task && (
          <div className="animate-pulse space-y-4 p-6">
            <div className="h-6 w-2/3 rounded bg-slate-100" />
            <div className="h-24 rounded-xl bg-slate-100" />
            <div className="h-40 rounded-xl bg-slate-100" />
          </div>
        )}
        {error && <EmptyState icon="alert" title="Could not open this task" text={error.message} />}
        {task && (
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_240px]">
            <div className="min-w-0 space-y-6 p-4 sm:p-6">
              {changesRequested && (
                <Banner tone="rose" icon="undo" title={`Changes requested by ${task.review.reviewedBy?.name || "admin"}`}>
                  {task.review.note}
                </Banner>
              )}
              {task.status === "in_review" && (
                <Banner tone="amber" icon="review" title={isAdmin ? `${task.review?.submittedBy?.name || "Assignee"} submitted this for review` : "Waiting for review"}>
                  {task.review?.note || (isAdmin ? "No note added." : "An admin will approve it or ask for changes.")}
                </Banner>
              )}
              {task.status === "done" && (
                <Banner
                  tone="emerald"
                  icon="check"
                  title={task.review?.decision === "approve" ? `Approved by ${task.review.reviewedBy?.name}` : "Completed"}
                >
                  {task.completedAt ? `Closed ${timeAgo(task.completedAt)}` : null}
                </Banner>
              )}

              <div>
                <SectionLabel>Description</SectionLabel>
                {task.description ? (
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed [overflow-wrap:anywhere] text-slate-600">{task.description}</p>
                ) : (
                  <p className="text-sm italic text-slate-400">No description.</p>
                )}
              </div>

              {task.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((tag) => (
                    <TagChip key={tag} tag={tag} />
                  ))}
                </div>
              )}

              <Checklist
                task={task}
                canToggle={!isAdmin && task.status !== "done"}
                busyId={busy}
                onToggle={(subtaskId) => run(subtaskId, () => MyTaskService.toggleSubtask(taskId, subtaskId))}
              />

              <div>
                <div className="mb-4 flex gap-5 border-b border-slate-100">
                  {[
                    { key: "comments", label: `Comments${comments.length ? ` (${comments.length})` : ""}` },
                    { key: "activity", label: "Activity" },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => setTab(item.key)}
                      className={`-mb-px border-b-2 pb-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                        tab === item.key ? "border-brand-500 text-slate-800" : "border-transparent text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                {tab === "comments" ? (
                  <Comments comments={comments} currentEmployeeId={currentEmployeeId} isAdmin={isAdmin} onAdd={addComment} onRemove={removeComment} />
                ) : (
                  <ActivityLog activity={task.activity} />
                )}
              </div>
            </div>

            <aside className="grid min-w-0 grid-cols-1 gap-x-4 border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:grid-cols-2 sm:px-6 md:block md:border-l md:border-t-0 md:px-5">
              <DetailRow icon="user" label="Assignees">
                {task.assignees?.length ? (
                  <ul className="mt-1 space-y-1.5">
                    {task.assignees.map((person) => (
                      <li key={person.employeeId} className="flex items-start gap-2">
                        <Avatar name={person.name} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{person.name}</span>
                          {person.email && <span className="block truncate text-[11px] font-medium text-slate-400">{person.email}</span>}
                          {isAdmin && (
                            <EmailStatus
                              status={person.emailStatus}
                              busy={busy === `mail-${person.employeeId}`}
                              onResend={() =>
                                run(`mail-${person.employeeId}`, () => AdminTaskService.resendEmail(taskId, person.employeeId), `E-mail sent again to ${person.email}`)
                              }
                            />
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-slate-400">Unassigned</span>
                )}
              </DetailRow>
              <DetailRow icon="calendar" label="Due date">
                <span className={DUE_TONE_CLASS[due.tone]}>{task.dueDate ? `${formatDateKey(task.dueDate)} · ${due.label}` : "No due date"}</span>
              </DetailRow>
              {task.startDate && (
                <DetailRow icon="play" label="Start date">
                  {formatDateKey(task.startDate)}
                </DetailRow>
              )}
              <DetailRow icon="clock" label="Estimate">
                {formatMinutes(task.estimateMinutes) || <span className="text-slate-400">Not set</span>}
              </DetailRow>
              <DetailRow icon="review" label="Approval">
                {needsReview ? "Admin approval needed" : "No approval needed"}
              </DetailRow>
              <DetailRow icon="edit" label="Created">
                {task.createdBy?.name || "–"}
                <span className="block text-[11px] font-medium text-slate-400">{timeAgo(task.createdAt)}</span>
              </DetailRow>
            </aside>
          </div>
        )}
      </div>

      {task && (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
          {isAdmin ? renderAdminActions() : renderEmployeeActions()}
        </div>
      )}

      <NoteModal
        config={noteConfig}
        onClose={() => setNoteConfig(null)}
        onSubmit={async (note) => {
          await noteConfig.onSubmit(note);
          setNoteConfig(null);
        }}
      />
    </Drawer>
  );
};