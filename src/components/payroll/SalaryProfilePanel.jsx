import React, { useCallback, useEffect, useState } from "react";
import { History } from "lucide-react";
import { PayrollService } from "../../backend/ApiService";
import { Button, TextInput } from "../ui/FormField";
import { ErrorBlock, LoadingBlock } from "../ui/StateBlock";
import { formatMoney } from "../../constants/PayrollConstants";
import { formatDateKey, formatIstDateTime } from "../../utils/IstTime";
import { validateSalaryRevision } from "../../validators/EmployeeValidator";

const errorText = (error, fallback) => error?.response?.data?.message || fallback;

/**
 * Salary profile of one employee: current monthly base, revision history and (with
 * payroll.salary.update) a form to add a revision with an effective date.
 */
export default function SalaryProfilePanel({ employeeId, canEdit, onSaved }) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [form, setForm] = useState({ baseSalary: "", effectiveFrom: "", note: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const load = useCallback(async () => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const response = await PayrollService.getSalaryProfile(employeeId);
      setState({ data: response.data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: errorText(error, "Could not load the salary profile") });
    }
  }, [employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (event) => {
    event.preventDefault();
    let payload;
    try {
      payload = validateSalaryRevision(form);
      setErrors({});
    } catch (validation) {
      setErrors(validation.validationErrors || {});
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const response = await PayrollService.addSalaryRevision(employeeId, payload);
      setState({ data: response.data, loading: false, error: null });
      setForm({ baseSalary: "", effectiveFrom: "", note: "" });
      onSaved?.();
    } catch (error) {
      setSaveError(errorText(error, "Could not save the salary"));
    } finally {
      setSaving(false);
    }
  };

  if (state.loading) return <LoadingBlock text="Loading salary" />;
  if (state.error) return <ErrorBlock message={state.error} onRetry={load} />;
  const { currentBaseSalary, revisions } = state.data;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current monthly base</p>
        <p className="font-mono text-2xl font-bold text-slate-800">{currentBaseSalary === null ? "Not set" : formatMoney(currentBaseSalary)}</p>
      </div>

      {canEdit && (
        <form onSubmit={save} className="grid gap-3 rounded-2xl border border-orange-100 p-4 sm:grid-cols-2" noValidate>
          <TextInput id="salary-amount" type="number" min="0" step="0.01" label="New monthly base (₹)" required value={form.baseSalary} error={errors.baseSalary} onChange={(event) => setForm({ ...form, baseSalary: event.target.value })} />
          <TextInput id="salary-from" type="date" label="Effective from" required value={form.effectiveFrom} error={errors.effectiveFrom} onChange={(event) => setForm({ ...form, effectiveFrom: event.target.value })} />
          <TextInput id="salary-note" label="Note" className="sm:col-span-2" maxLength={500} placeholder="e.g. Annual appraisal" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
          {saveError && <p className="text-xs font-semibold text-red-600 sm:col-span-2">{saveError}</p>}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Add revision"}</Button>
          </div>
          <p className="text-[11px] text-slate-400 sm:col-span-2">A finalized month keeps its snapshot; re-open it to apply a back-dated revision.</p>
        </form>
      )}

      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <History size={13} /> Revision history
        </p>
        {!revisions.length ? (
          <p className="text-sm text-slate-400">No revisions yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
            {revisions.map((revision) => (
              <li key={revision.revisionId} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <span className="font-mono font-bold text-slate-800">{formatMoney(revision.baseSalary)}</span>
                <span className="text-xs text-slate-500">from {formatDateKey(revision.effectiveFrom)}</span>
                <span className="w-full text-[11px] text-slate-400">
                  {revision.note && `${revision.note} · `}by {revision.changedBy?.firstName || "-"} on {formatIstDateTime(revision.changedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
