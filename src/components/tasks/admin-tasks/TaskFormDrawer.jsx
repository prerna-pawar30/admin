/**
 * Admin create / edit form in a side drawer. Same layout as the original AdminTaskPage (title,
 * status pills, description, priority, tags on the left; assignees, dates, estimate and a summary
 * on the right), wired to the API: assignees come from /admin/assignees, tags suggest from
 * /admin/tags, and server validation errors show under the matching field.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminTaskService } from "../../../backend/ApiService";
import { useDebouncedValue } from "../../../hooks/useTaskData";
import { LIMITS, PRIORITY_META, PRIORITY_ORDER, STATUS_META, STATUS_ORDER } from "../../../constants/TaskConstants";
import { formatMinutes, parseEstimate } from "../../../utils/TaskFormat";
import { toastError, toastSuccess } from "../shared/notify";
import { Avatar, Button, Drawer, Icon, SectionLabel, TagChip } from "../shared/ui";

const EMPTY_FORM = {
  title: "",
  description: "",
  status: "todo",
  priority: "normal",
  tags: [],
  assignees: [],
  startDate: "",
  dueDate: "",
  estimate: "",
  requiresReview: true,
  subtasks: [],
};

const fromTask = (task) => ({
  title: task.title,
  description: task.description || "",
  status: task.status,
  priority: task.priority,
  tags: task.tags || [],
  assignees: (task.assignees || []).map((person) => ({ _id: String(person.employeeId), name: person.name, email: person.email })),
  startDate: task.startDate || "",
  dueDate: task.dueDate || "",
  estimate: formatMinutes(task.estimateMinutes),
  requiresReview: task.requiresReview !== false,
  subtasks: (task.subtasks || []).map((item) => ({ subtaskId: item.subtaskId, title: item.title, isDone: item.isDone })),
});

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100";

const FieldError = ({ message }) => (message ? <p className="mt-1.5 text-[11px] font-bold text-rose-600">{message}</p> : null);

const AssigneePicker = ({ value, onChange, error }) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounced = useDebouncedValue(search, 250);

  useEffect(() => {
    if (!isOpen) return undefined;
    let isCurrent = true;
    setIsLoading(true);
    AdminTaskService
      .assignees(debounced)
      .then((rows) => isCurrent && setOptions(rows))
      .catch(() => isCurrent && setOptions([]))
      .finally(() => isCurrent && setIsLoading(false));
    return () => {
      isCurrent = false;
    };
  }, [debounced, isOpen]);

  const chosen = new Set(value.map((person) => person._id));
  const available = options.filter((person) => !chosen.has(String(person._id)));

  return (
    <div>
      {value.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {value.map((person) => (
            <span key={person._id} className="flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2.5 shadow-sm">
              <Avatar name={person.name} size="sm" />
              <span className="min-w-0 truncate text-[11px] font-bold text-slate-700" title={person.email}>
                {person.name}
                {person.email && <span className="ml-1 font-medium text-slate-400">· {person.email}</span>}
              </span>
              <button
                type="button"
                onClick={() => onChange(value.filter((item) => item._id !== person._id))}
                className="text-slate-400 hover:text-rose-500"
                aria-label={`Remove ${person.name}`}
              >
                <Icon name="close" className="h-3.5 w-3.5" strokeWidth={2.6} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <Icon name="user" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className={`${inputClass} pl-10`}
          placeholder="Search people by name or email..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        />
        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-100 bg-white p-1.5 shadow-2xl">
            {isLoading && <p className="px-3 py-2 text-xs font-semibold text-slate-400">Searching...</p>}
            {!isLoading && !available.length && <p className="px-3 py-2 text-xs font-semibold text-slate-400">No matching employees</p>}
            {!isLoading &&
              available.map((person) => (
                <button
                  type="button"
                  key={person._id}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange([...value, { _id: String(person._id), name: person.name, email: person.email }]);
                    setSearch("");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-brand-50"
                >
                  <Avatar name={person.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-slate-700">{person.name}</span>
                    <span className="block truncate text-[11px] text-slate-400">{person.email}</span>
                  </span>
                  {person.employeeId && <span className="hidden shrink-0 font-mono sm:inline text-[10px] font-bold text-slate-300">{person.employeeId}</span>}
                </button>
              ))}
          </div>
        )}
      </div>
      <FieldError message={error} />
    </div>
  );
};

const TagInput = ({ value, onChange, suggestions, error }) => {
  const [text, setText] = useState("");
  const add = (raw) => {
    const tag = raw.trim().slice(0, LIMITS.TAG_MAX_LENGTH);
    if (!tag || value.some((item) => item.toLowerCase() === tag.toLowerCase()) || value.length >= LIMITS.TAGS_MAX) return;
    onChange([...value, tag]);
    setText("");
  };
  const unused = suggestions.filter((row) => !value.includes(row.tag)).slice(0, 8);
  return (
    <div>
      <div className={`${inputClass} flex flex-wrap items-center gap-1.5 py-2`}>
        {value.map((tag) => (
          <TagChip key={tag} tag={tag} onRemove={() => onChange(value.filter((item) => item !== tag))} />
        ))}
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              add(text);
            }
            if (event.key === "Backspace" && !text && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={() => add(text)}
          placeholder={value.length ? "" : "Type a tag and press Enter"}
          className="min-w-[100px] flex-1 bg-transparent py-0.5 text-xs outline-none placeholder:text-slate-400"
        />
      </div>
      {unused.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {unused.map((row) => (
            <button
              type="button"
              key={row.tag}
              onClick={() => add(row.tag)}
              className="rounded-md border border-dashed border-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:border-brand-300 hover:text-brand-600"
            >
              + {row.tag}
            </button>
          ))}
        </div>
      )}
      <FieldError message={error} />
    </div>
  );
};

const ChecklistEditor = ({ value, onChange, error }) => {
  const [text, setText] = useState("");
  const inputRef = useRef(null);
  const add = () => {
    const title = text.trim();
    if (!title || value.length >= LIMITS.SUBTASKS_MAX) return;
    onChange([...value, { title, isDone: false }]);
    setText("");
    inputRef.current?.focus();
  };
  const update = (index, patch) => onChange(value.map((item, position) => (position === index ? { ...item, ...patch } : item)));
  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-2 divide-y divide-slate-100 rounded-xl border border-slate-200">
          {value.map((item, index) => (
            <li key={item.subtaskId || `new-${index}`} className="group flex items-center gap-3 px-3.5 py-2">
              <input
                type="checkbox"
                checked={item.isDone}
                onChange={(event) => update(index, { isDone: event.target.checked })}
                className="h-4 w-4 rounded accent-brand-500"
                aria-label="Done"
              />
              <input
                value={item.title}
                onChange={(event) => update(index, { title: event.target.value })}
                className={`min-w-0 flex-1 bg-transparent text-xs font-medium outline-none ${item.isDone ? "text-slate-400 line-through" : "text-slate-700"}`}
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, position) => position !== index))}
                className="shrink-0 p-1 text-slate-300 transition-opacity hover:text-rose-500 [@media(pointer:fine)]:opacity-0 [@media(pointer:fine)]:group-hover:opacity-100"
                aria-label="Remove item"
              >
                <Icon name="trash" className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          placeholder="Add a checklist item..."
          className={inputClass}
        />
        <Button variant="secondary" icon="plus" onClick={add} disabled={!text.trim()}>
          Add
        </Button>
      </div>
      <FieldError message={error} />
    </div>
  );
};

export const TaskFormDrawer = ({ isOpen, task, onClose, onSaved, tagSuggestions = [] }) => {
  const isEdit = Boolean(task);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(task ? fromTask(task) : EMPTY_FORM);
      setErrors({});
    }
  }, [isOpen, task]);

  const set = (patch) => {
    setForm((previous) => ({ ...previous, ...patch }));
    setErrors((previous) => {
      const next = { ...previous };
      Object.keys(patch).forEach((key) => delete next[key]);
      return next;
    });
  };

  const estimateMinutes = useMemo(() => parseEstimate(form.estimate), [form.estimate]);

  const validate = () => {
    const found = {};
    if (!form.title.trim()) found.title = "Give the task a name";
    if (estimateMinutes === undefined) found.estimate = "Use a format like 4h, 1h 30m or 45m";
    if (form.startDate && form.dueDate && form.dueDate < form.startDate) found.dueDate = "Due date cannot be before the start date";
    if (form.subtasks.some((item) => !item.title.trim())) found.subtasks = "Checklist items cannot be empty";
    return found;
  };

  const submit = async (event) => {
    event?.preventDefault();
    const found = validate();
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      tags: form.tags,
      assigneeIds: form.assignees.map((person) => person._id),
      startDate: form.startDate || null,
      dueDate: form.dueDate || null,
      estimateMinutes: estimateMinutes ?? null,
      requiresReview: form.requiresReview,
      subtasks: form.subtasks.map((item) => ({ ...(item.subtaskId ? { subtaskId: item.subtaskId } : {}), title: item.title.trim(), isDone: item.isDone })),
    };
    setIsSaving(true);
    try {
      const saved = isEdit ? await AdminTaskService.update(task.taskId, payload) : await AdminTaskService.create(payload);
      toastSuccess(isEdit ? `${saved.taskId} updated` : `${saved.taskId} created`);
      // Tell the admin who got the "new task" e-mail (and who did not).
      const before = new Set(isEdit ? (task.assignees || []).map((person) => String(person.employeeId)) : []);
      const mailed = (saved.assignees || []).filter((person) => !before.has(String(person.employeeId)) && person.emailStatus);
      const sentTo = mailed.filter((person) => person.emailStatus.status === "SENT").map((person) => person.email);
      const failedTo = mailed.filter((person) => person.emailStatus.status === "FAILED").map((person) => person.email);
      if (sentTo.length) toastSuccess(`E-mail sent to ${sentTo.join(", ")}`);
      if (failedTo.length) toastError(`E-mail could not be sent to ${failedTo.join(", ")} - open the task and press "Send e-mail"`);
      onSaved(saved, { isNew: !isEdit });
    } catch (error) {
      setErrors({ ...error.fields, estimate: error.fields?.estimateMinutes, assignees: error.fields?.assigneeIds });
      toastError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const priority = PRIORITY_META[form.priority];

  return (
    <Drawer isOpen={isOpen} onClose={onClose} width="max-w-5xl" label={isEdit ? "Edit task" : "Create task"}>
      <form onSubmit={submit} className="flex h-full flex-col">
        <div className="border-b border-slate-100 px-4 pb-4 pt-4 sm:px-8 sm:pb-5 sm:pt-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-500">
                {isEdit ? `Edit ${task.taskId}` : "Create new task"}
              </span>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>
          <input
            autoFocus
            type="text"
            maxLength={LIMITS.TITLE_MAX}
            placeholder="Task name..."
            className="w-full min-w-0 border-b-2 border-transparent pb-2 text-xl font-semibold sm:text-2xl text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-slate-200"
            value={form.title}
            onChange={(event) => set({ title: event.target.value })}
          />
          <FieldError message={errors.title} />
          <div className="mt-4 flex flex-wrap gap-2">
            {STATUS_ORDER.map((status) => (
              <button
                type="button"
                key={status}
                onClick={() => set({ status })}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs sm:px-4 font-bold transition-all ${
                  form.status === status
                    ? "border-brand-200 bg-brand-50 text-brand-600 shadow-sm"
                    : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_META[status].dot }} />
                {STATUS_META[status].label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto overflow-x-hidden lg:grid-cols-12">
          <div className="min-w-0 space-y-6 p-4 sm:space-y-7 sm:p-8 lg:col-span-7 lg:border-r lg:border-slate-100">
            <div>
              <SectionLabel>Description</SectionLabel>
              <textarea
                placeholder="Add task details, links or acceptance criteria..."
                maxLength={LIMITS.DESCRIPTION_MAX}
                className={`${inputClass} min-h-[140px] resize-y p-4 text-sm`}
                value={form.description}
                onChange={(event) => set({ description: event.target.value })}
              />
              <FieldError message={errors.description} />
            </div>
            <div>
              <SectionLabel>Priority</SectionLabel>
              <div className="flex flex-wrap gap-2.5">
                {PRIORITY_ORDER.map((key) => {
                  const meta = PRIORITY_META[key];
                  const isSelected = form.priority === key;
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => set({ priority: key })}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs sm:px-4 font-bold transition-all ${isSelected ? "shadow-md" : "hover:border-slate-300"}`}
                      style={{
                        borderColor: isSelected ? meta.color : "#e2e8f0",
                        background: isSelected ? meta.bg : "white",
                        color: isSelected ? meta.color : "#64748b",
                      }}
                    >
                      <Icon name="flag" className="h-3.5 w-3.5" strokeWidth={2.4} />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <SectionLabel>Labels / Tags</SectionLabel>
              <TagInput value={form.tags} onChange={(tags) => set({ tags })} suggestions={tagSuggestions} error={errors.tags} />
            </div>
            <div>
              <SectionLabel>Checklist</SectionLabel>
              <ChecklistEditor value={form.subtasks} onChange={(subtasks) => set({ subtasks })} error={errors.subtasks} />
            </div>
          </div>

          <div className="min-w-0 space-y-6 bg-slate-50/60 p-4 sm:space-y-7 sm:p-8 lg:col-span-5">
            <div>
              <SectionLabel>Assignees</SectionLabel>
              <AssigneePicker value={form.assignees} onChange={(assignees) => set({ assignees })} error={errors.assignees} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="min-w-0">
                <SectionLabel>Start date</SectionLabel>
                <input type="date" className={inputClass} value={form.startDate} onChange={(event) => set({ startDate: event.target.value })} />
              </div>
              <div className="min-w-0">
                <SectionLabel>Due date</SectionLabel>
                <input
                  type="date"
                  className={inputClass}
                  value={form.dueDate}
                  min={form.startDate || undefined}
                  onChange={(event) => set({ dueDate: event.target.value })}
                />
                <FieldError message={errors.dueDate} />
              </div>
            </div>
            <div>
              <SectionLabel>Time estimate</SectionLabel>
              <input className={inputClass} placeholder="e.g. 4h or 1h 30m" value={form.estimate} onChange={(event) => set({ estimate: event.target.value })} />
              <FieldError message={errors.estimate} />
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded accent-brand-500"
                checked={form.requiresReview}
                onChange={(event) => set({ requiresReview: event.target.checked })}
              />
              <span>
                <span className="block text-xs font-bold text-slate-700">Require admin approval</span>
                <span className="mt-0.5 block text-[11px] font-medium text-slate-400">
                  The assignee submits the task for review and an admin marks it done. Turn off for small tasks.
                </span>
              </span>
            </label>

            <div className="rounded-2xl bg-slate-800 p-5 text-white shadow-lg">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Summary</p>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Priority</span>
                  <span className="font-bold" style={{ color: priority.color === "#64748b" ? "#cbd5e1" : priority.color }}>
                    {priority.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="font-bold text-brand-400">{STATUS_META[form.status].label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimate</span>
                  <span className="font-bold">{estimateMinutes ? formatMinutes(estimateMinutes) : "–"}</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-3">
                  <span className="text-slate-400">Assignees</span>
                  <span className="font-bold">{form.assignees.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-4 py-3 sm:px-8 sm:py-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="brand" isLoading={isSaving} className="flex-1 uppercase tracking-wider sm:min-w-[140px] sm:flex-none">
            {isEdit ? "Save changes" : "Create task"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
};