import React, { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { CalendarPlus, Pencil, Trash2 } from "lucide-react";
import PageShell from "../../ui/PageShell";
import Modal from "../../ui/Modal";
import { Button, SelectInput, TextInput } from "../../ui/FormField";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../../ui/StateBlock";
import Pagination from "../../ui/Pagination";
import { AdminAttendanceService } from "../../../backend/ApiService";
import { validateHoliday } from "../../../validators/LeaveValidator";
import { currentIstMonth, formatDateKey, todayIstKey } from "../../../utils/IstTime";

const PAGE_SIZE = 25;
const HOLIDAY_TYPE_OPTIONS = [
  { value: "PUBLIC", label: "Public holiday" },
  { value: "COMPANY", label: "Company holiday" },
];
const EMPTY_FORM = { date: "", title: "", type: "PUBLIC" };
const errorText = (error, fallback) => error?.response?.data?.message || fallback;

/** Admin Holiday Manager: list a year's holidays and add / edit / delete them (date is unique). */
export default function HolidayManager() {
  const [year, setYear] = useState(currentIstMonth().year);
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ items: [], meta: null, loading: true, error: null });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const today = todayIstKey();

  const load = useCallback(async () => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const response = await AdminAttendanceService.listHolidays({ year, page, limit: PAGE_SIZE });
      setState({ items: response.data || [], meta: response.meta, loading: false, error: null });
    } catch (error) {
      setState((previous) => ({ ...previous, loading: false, error: errorText(error, "Could not load holidays") }));
    }
  }, [year, page]);

  useEffect(() => {
    load();
  }, [load]);

  const openForm = (holiday = null) => {
    setEditing(holiday || { isNew: true });
    setForm(holiday ? { date: holiday.date, title: holiday.title, type: holiday.type } : { ...EMPTY_FORM });
    setErrors({});
  };

  const save = async (event) => {
    event.preventDefault();
    let payload;
    try {
      payload = validateHoliday(form);
    } catch (validation) {
      setErrors(validation.validationErrors || {});
      return;
    }
    setSaving(true);
    try {
      if (editing.isNew) await AdminAttendanceService.addHoliday(payload);
      else await AdminAttendanceService.updateHoliday(editing._id, payload);
      setEditing(null);
      Swal.fire("Saved", `${payload.title} on ${formatDateKey(payload.date)}`, "success");
      load();
    } catch (error) {
      Swal.fire("Could not save", errorText(error, "Please try again"), "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (holiday) => {
    const confirm = await Swal.fire({
      title: `Delete ${holiday.title}?`,
      text: `${formatDateKey(holiday.date)} becomes a normal working day.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
    });
    if (!confirm.isConfirmed) return;
    try {
      await AdminAttendanceService.deleteHoliday(holiday._id);
      load();
    } catch (error) {
      Swal.fire("Could not delete", errorText(error, "Please try again"), "error");
    }
  };

  return (
    <div>
      <PageShell
        title="Holiday Manager"
        description="Public and company holidays. They are skipped in leave counts and payroll working days; time worked on them is extra."
        actions={
          <>
            <select
              aria-label="Year"
              value={year}
              onChange={(event) => {
                setYear(Number(event.target.value));
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold"
            >
              {[year - 1, year, year + 1].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <Button onClick={() => openForm()}>
              <CalendarPlus size={15} /> Add holiday
            </Button>
          </>
        }
      >
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          {state.loading ? (
            <LoadingBlock text="Loading holidays" />
          ) : state.error ? (
            <ErrorBlock message={state.error} onRetry={load} />
          ) : !state.items.length ? (
            <EmptyBlock title={`No holidays in ${year}`} hint="Add the public and company holidays for the year." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400">
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Holiday</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {state.items.map((holiday) => (
                      <tr key={holiday._id} className={holiday.date < today ? "text-slate-400" : "text-slate-700"}>
                        <td className="px-5 py-3 text-sm font-bold">{formatDateKey(holiday.date)}</td>
                        <td className="px-5 py-3 text-sm font-semibold">{holiday.title}</td>
                        <td className="px-5 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${holiday.type === "PUBLIC" ? "bg-rose-100 text-rose-700" : "bg-sky-100 text-sky-700"}`}>
                            {holiday.type}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button type="button" aria-label={`Edit ${holiday.title}`} onClick={() => openForm(holiday)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                            <Pencil size={15} />
                          </button>
                          <button type="button" aria-label={`Delete ${holiday.title}`} onClick={() => remove(holiday)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {state.meta && <Pagination totalItems={state.meta.total} itemsPerPage={state.meta.limit} currentPage={page} setCurrentPage={setPage} />}
            </>
          )}
        </div>
      </PageShell>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.isNew ? "Add holiday" : "Edit holiday"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" form="holiday-form" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </>
        }
      >
        <form id="holiday-form" onSubmit={save} className="space-y-4" noValidate>
          <TextInput id="holiday-date" type="date" label="Date" required value={form.date} error={errors.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
          <TextInput id="holiday-title" label="Name" required maxLength={120} value={form.title} error={errors.title} placeholder="e.g. Diwali" onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <SelectInput id="holiday-type" label="Type" options={HOLIDAY_TYPE_OPTIONS} value={form.type} error={errors.type} onChange={(event) => setForm({ ...form, type: event.target.value })} />
        </form>
      </Modal>
    </div>
  );
}
