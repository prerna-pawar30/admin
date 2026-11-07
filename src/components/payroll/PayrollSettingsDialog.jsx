import React, { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import { Button } from "../ui/FormField";
import { ErrorBlock, LoadingBlock } from "../ui/StateBlock";
import { PayrollService } from "../../backend/ApiService";
import { PAYROLL_SETTING_FIELDS } from "../../constants/PayrollConstants";

const errorText = (error, fallback) => error?.response?.data?.message || fallback;

/**
 * The one payroll-settings document (shift lengths, grace, half-day threshold, extra rules, paid
 * leave quota, windows). Read-only without payroll.settings.update. Changes are audited.
 */
export default function PayrollSettingsDialog({ open, onClose, canEdit, onSaved }) {
  const [state, setState] = useState({ loading: true, error: null });
  const [values, setValues] = useState(null);
  const [initial, setInitial] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setState({ loading: true, error: null });
    setSaveError(null);
    PayrollService.getSettings()
      .then((response) => {
        setValues(response.data.settings);
        setInitial(response.data.settings);
        setState({ loading: false, error: null });
      })
      .catch((error) => setState({ loading: false, error: errorText(error, "Could not load settings") }));
  }, [open]);

  const save = async () => {
    const changes = Object.fromEntries(
      PAYROLL_SETTING_FIELDS.map((field) => [field.key, field.kind === "number" ? Number(values[field.key]) : values[field.key]]).filter(
        ([key, value]) => JSON.stringify(value) !== JSON.stringify(initial[key])
      )
    );
    if (!Object.keys(changes).length) return onClose();
    setSaving(true);
    setSaveError(null);
    try {
      await PayrollService.updateSettings(changes);
      onSaved?.();
      onClose();
    } catch (error) {
      const details = error.response?.data?.error?.details;
      setSaveError(details?.length ? details.map((detail) => detail.message).join("; ") : errorText(error, "Could not save"));
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      widthClass="max-w-2xl"
      title="Payroll & attendance rules"
      subtitle="One settings document used by attendance, leave and payroll."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{canEdit ? "Cancel" : "Close"}</Button>
          {canEdit && <Button onClick={save} disabled={saving || state.loading}>{saving ? "Saving..." : "Save rules"}</Button>}
        </>
      }
    >
      {state.loading ? (
        <LoadingBlock text="Loading rules" />
      ) : state.error ? (
        <ErrorBlock message={state.error} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {PAYROLL_SETTING_FIELDS.map((field) => (
            <label key={field.key} className="flex flex-col gap-1 rounded-xl bg-slate-50 px-3 py-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{field.label}</span>
              {field.kind === "boolean" ? (
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  disabled={!canEdit}
                  checked={Boolean(values[field.key])}
                  onChange={(event) => setValues({ ...values, [field.key]: event.target.checked })}
                />
              ) : (
                <span className="flex items-center gap-2">
                  <input
                    type={field.kind === "time" ? "time" : "number"}
                    min={field.min}
                    max={field.max}
                    step={field.step || 1}
                    disabled={!canEdit}
                    value={values[field.key]}
                    onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}
                    className="w-28 rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-mono text-sm"
                  />
                  {field.unit && <span className="text-[11px] text-slate-400">{field.unit}</span>}
                </span>
              )}
            </label>
          ))}
          <p className="text-[11px] text-slate-400 sm:col-span-2">
            Sunday is the weekly off; holidays come from the Holiday Manager. Paid leave applies to sick and casual leave.
          </p>
          {saveError && <p className="text-xs font-semibold text-red-600 sm:col-span-2">{saveError}</p>}
        </div>
      )}
    </Modal>
  );
}
