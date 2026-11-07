import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { CheckCircle2, Clock, RotateCcw, Trash2, Wallet } from "lucide-react";
import Modal from "../ui/Modal";
import { Button, SelectInput, TextInput } from "../ui/FormField";
import { PayrollService } from "../../backend/ApiService";
import { PAYMENT_MODES, formatMoney, paymentModeLabel } from "../../constants/PayrollConstants";
import { MONTH_NAMES, formatDateKey, todayIstKey } from "../../utils/IstTime";

const errorText = (error, fallback) => {
  const body = error?.response?.data;
  return body?.error?.details?.[0]?.message || body?.message || fallback;
};

/* ---------------- Pending / Done ---------------- */

/** Salary of a month is paid by this day of the next month (October salary -> by 15 November). */
export const SALARY_PAY_DAY = 15;

/** "2026-11-15" for October 2026. */
export const salaryDueOn = (month, year) => {
  const m = Number(month);
  const y = Number(year);
  if (!m || !y) return null;
  const nextYear = m === 12 ? y + 1 : y;
  const nextMonth = m === 12 ? 1 : m + 1;
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(SALARY_PAY_DAY).padStart(2, "0")}`;
};

/** The row's payment, or a safe "pending" fallback when the API response has none. */
export const paymentOf = (row) => {
  if (row?.payment) return row.payment;
  if (!row || row.hasSalaryProfile === false) return { status: "NO_SALARY", paidAmount: 0, balance: 0 };
  const net = Number(row.netPayable) || 0;
  return { status: net > 0 ? "DUE" : "NOTHING_DUE", paidAmount: 0, balance: net, history: [] };
};

/** Salary is "Done" once HR pressed Done (fully paid) or there is nothing to pay. */
export const isSalaryDone = (payment) =>
  payment?.salaryStatus ? payment.salaryStatus === "DONE" : ["PAID", "NOTHING_DUE"].includes(payment?.status);

/** "DONE" | "PENDING" | "NO_SALARY" */
export const salaryStateOf = (payment) => {
  if (!payment || payment.status === "NO_SALARY") return "NO_SALARY";
  return isSalaryDone(payment) ? "DONE" : "PENDING";
};

/** The Done button shows for every pending salary that has something left to pay. */
export const canMarkDone = (row) => {
  const payment = paymentOf(row);
  return salaryStateOf(payment) === "PENDING" && (Number(payment.balance) || 0) > 0;
};

/** Due date + overdue flag (server values when present, otherwise worked out here). */
export const dueInfoOf = (row) => {
  const payment = paymentOf(row);
  const dueOn = payment.dueOn || salaryDueOn(row?.month, row?.year);
  const isOverdue =
    payment.isOverdue ?? (salaryStateOf(payment) === "PENDING" && Boolean(dueOn) && todayIstKey() > dueOn);
  return { dueOn, isOverdue };
};

const STATE_STYLE = {
  DONE: { badge: "bg-emerald-500 text-white", icon: CheckCircle2, label: "Done" },
  PENDING: { badge: "bg-amber-100 text-amber-800 ring-1 ring-amber-200", icon: Clock, label: "Pending" },
  NO_SALARY: { badge: "bg-slate-100 text-slate-500", icon: null, label: "Salary not set" },
};

/** Pending / Done chip. */
export const PaymentStatusBadge = ({ payment, size = "sm" }) => {
  const style = STATE_STYLE[salaryStateOf(payment)];
  const Icon = style.icon;
  const large = size === "lg";
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full font-bold ${style.badge} ${large ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[11px]"}`}>
      {Icon && <Icon size={large ? 14 : 11} />}
      {style.label}
    </span>
  );
};

/**
 * "Done" button action: asks once, then records the full remaining salary as paid.
 * Returns the updated detail, or null when cancelled / failed.
 */
export const confirmSalaryDone = async ({ row, month, year }) => {
  const balance = paymentOf(row).balance || 0;
  const confirm = await Swal.fire({
    title: "Mark salary as done?",
    html: `<div style="font-size:14px;line-height:1.6">
        <b>${row.name}</b> · ${MONTH_NAMES[(month || 1) - 1]} ${year}<br/>
        <span style="font-size:22px;font-weight:700;font-family:monospace">${formatMoney(balance)}</span>
      </div>
      <div style="margin-top:6px;font-size:12px;color:#64748b">The salary status will change to <b style="color:#059669">Done</b>.</div>`,
    icon: "question",
    input: "text",
    inputPlaceholder: "Reference / UTR (optional)",
    showCancelButton: true,
    confirmButtonText: "Yes, Done",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#059669",
    reverseButtons: true,
  });
  if (!confirm.isConfirmed) return null;
  try {
    // amount left out = the backend pays the whole remaining balance
    const response = await PayrollService.recordPayment({
      employeeId: row.employeeId,
      month,
      year,
      mode: "BANK_TRANSFER",
      reference: (confirm.value || "").trim(),
      paidOn: todayIstKey(),
    });
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: `${row.name} · Salary Done ✓`, showConfirmButton: false, timer: 2200 });
    return response.data || true;
  } catch (error) {
    Swal.fire("Could not mark as done", errorText(error, "Please try again"), "error");
    return null;
  }
};

/** Undo "Done" (pressed by mistake): removes this month's payments, salary goes back to Pending. */
export const confirmSalaryPending = async (detail) => {
  const history = detail?.payment?.history || [];
  if (!history.length) return null;
  const confirm = await Swal.fire({
    title: "Move back to Pending?",
    text: "This month's payment entry will be removed (kept in the audit log) and the salary will show as Pending again.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Pending",
    confirmButtonColor: "#d97706",
    reverseButtons: true,
  });
  if (!confirm.isConfirmed) return null;
  try {
    let last = null;
    for (const item of history) last = await PayrollService.voidPayment(item.paymentId, "Moved back to pending");
    return last?.data || true;
  } catch (error) {
    Swal.fire("Could not undo", errorText(error, "Please try again"), "error");
    return null;
  }
};

/**
 * Dialog to record a salary payment for one employee. Amount defaults to the full balance;
 * enter less for a part payment (the rest stays "pending").
 */
export const PayDialog = ({ open, row, period, onClose, onPaid }) => {
  const balance = row?.payment?.balance || 0;
  const [form, setForm] = useState({ amount: "", mode: "BANK_TRANSFER", reference: "", paidOn: todayIstKey(), note: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm({ amount: String(balance || ""), mode: "BANK_TRANSFER", reference: "", paidOn: todayIstKey(), note: "" });
      setError(null);
    }
  }, [open, balance]);

  if (!row) return null;
  const amount = Number(form.amount);
  const isPartial = amount > 0 && amount < balance;
  const isLive = period?.isLive !== false && !period?.isOver;

  const submit = async (event) => {
    event.preventDefault();
    if (!(amount > 0)) return setError("Enter an amount above zero");
    if (amount > balance + 0.009) return setError(`At most ${formatMoney(balance)}`);
    setSaving(true);
    setError(null);
    try {
      const response = await PayrollService.recordPayment({
        employeeId: row.employeeId,
        month: period.month,
        year: period.year,
        amount,
        mode: form.mode,
        reference: form.reference.trim(),
        note: form.note.trim(),
        paidOn: form.paidOn,
      });
      onPaid?.(response.data);
      onClose();
    } catch (saveError) {
      setError(errorText(saveError, "Could not save the payment"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Mark salary as paid"
      subtitle={`${row.name} · ${MONTH_NAMES[(period?.month || 1) - 1]} ${period?.year}`}
      icon={Wallet}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="success" type="submit" form="pay-salary-form" disabled={saving}>
            <CheckCircle2 size={14} /> {saving ? "Saving..." : isPartial ? "Save part payment" : "Mark as paid"}
          </Button>
        </>
      }
    >
      <form id="pay-salary-form" onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Net payable</p>
            <p className="font-mono text-sm font-bold text-slate-800">{formatMoney(row.netPayable)}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Already paid</p>
            <p className="font-mono text-sm font-bold text-emerald-700">{formatMoney(row.payment?.paidAmount)}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Balance</p>
            <p className="font-mono text-sm font-bold text-rose-600">{formatMoney(balance)}</p>
          </div>
        </div>

        {isLive && (
          <p className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800">
            This month is still running - the net amount can still change with attendance. Finalize the month first if you want the figure locked.
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput
            id="pay-amount"
            type="number"
            min="0"
            step="0.01"
            label="Amount (₹)"
            required
            value={form.amount}
            hint={isPartial ? `Part payment - ${formatMoney(balance - amount)} will stay pending` : "Full balance"}
            onChange={(event) => setForm({ ...form, amount: event.target.value })}
          />
          <TextInput id="pay-date" type="date" label="Paid on" required max={todayIstKey()} value={form.paidOn} onChange={(event) => setForm({ ...form, paidOn: event.target.value })} />
          <SelectInput id="pay-mode" label="Mode" options={PAYMENT_MODES} value={form.mode} onChange={(event) => setForm({ ...form, mode: event.target.value })} />
          <TextInput id="pay-ref" label="Reference / UTR" maxLength={100} placeholder="Optional" value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} />
          <TextInput id="pay-note" label="Note" className="sm:col-span-2" maxLength={500} placeholder="Optional" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
        </div>
        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      </form>
    </Modal>
  );
};

/**
 * Salary status box (breakdown drawer and My Salary).
 *  Pending -> amber card with the due date (15th of next month), HR sees a big "Done" button
 *  Done    -> green card with date / amount, HR can "Undo" back to Pending
 */
export const PaymentPanel = ({ detail, canEdit, onPay, onChanged }) => {
  const [busy, setBusy] = useState(false);
  if (!detail) return null;
  const payment = paymentOf(detail);
  const { dueOn, isOverdue } = dueInfoOf(detail);
  const history = payment.history || [];
  const state = salaryStateOf(payment);
  const done = state === "DONE";
  const isPartial = payment.status === "PARTIAL";
  const lastBy = history[history.length - 1]?.paidBy?.name;

  const run = async (action) => {
    setBusy(true);
    try {
      const result = await action();
      if (result) onChanged?.(result === true ? undefined : result);
    } finally {
      setBusy(false);
    }
  };
  const markDone = () =>
    run(() => confirmSalaryDone({ row: { ...detail, payment, name: detail.employee?.name || detail.name }, month: detail.month, year: detail.year }));
  const markPending = () => run(() => confirmSalaryPending({ ...detail, payment }));

  const remove = async (item) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: "Remove this payment?",
      text: `${formatMoney(item.amount)} paid on ${formatDateKey(item.paidOn)} will be undone (kept in the audit log).`,
      input: "text",
      inputPlaceholder: "Reason (optional)",
      showCancelButton: true,
      confirmButtonText: "Remove",
      confirmButtonColor: "#ef4444",
    });
    if (!isConfirmed) return;
    try {
      const response = await PayrollService.voidPayment(item.paymentId, reason || "");
      onChanged?.(response.data);
    } catch (error) {
      Swal.fire("Could not remove", errorText(error, "Please try again"), "error");
    }
  };

  if (state === "NO_SALARY") {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
        Salary not set for this employee.
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl border-2 ${done ? "border-emerald-200" : "border-amber-200"}`}>
      <div className={`flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${done ? "bg-emerald-50" : "bg-amber-50"}`}>
        <div className="flex items-center gap-3">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${done ? "bg-emerald-500 text-white" : "bg-amber-400 text-white"}`}>
            {done ? <CheckCircle2 size={24} /> : <Clock size={24} />}
          </span>
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${done ? "text-emerald-700" : "text-amber-700"}`}>Salary status</p>
            <p className={`text-xl font-bold ${done ? "text-emerald-800" : "text-amber-800"}`}>{done ? "Done ✓" : "Pending"}</p>
            <p className="text-xs text-slate-600">
              {done
                ? payment.lastPaidOn
                  ? `Salary paid on ${formatDateKey(payment.lastPaidOn)}${lastBy ? ` · by ${lastBy}` : ""}`
                  : "Nothing to pay this month"
                : isPartial
                  ? `${formatMoney(payment.paidAmount)} paid · ${formatMoney(payment.balance)} remaining`
                  : canEdit
                    ? "Press Done once the salary is paid"
                    : "Salary not paid yet"}
            </p>
            {!done && dueOn && (
              <p className={`mt-1 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${isOverdue ? "bg-rose-100 text-rose-700" : "bg-white text-slate-600"}`}>
                {isOverdue ? `Overdue · was due by ${formatDateKey(dueOn)}` : `Due by ${formatDateKey(dueOn)}`}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase text-slate-400">{done ? "Paid" : "To pay"}</p>
            <p className={`font-mono text-lg font-bold ${done ? "text-emerald-700" : "text-slate-900"}`}>
              {formatMoney(done ? payment.paidAmount : payment.balance)}
            </p>
          </div>
          {canEdit && canMarkDone(detail) && (
            <div className="flex flex-col items-stretch gap-1">
              <button
                type="button"
                disabled={busy}
                onClick={markDone}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
              >
                <CheckCircle2 size={16} /> {busy ? "Saving..." : "Done"}
              </button>
              {onPay && (
                <button type="button" onClick={onPay} className="text-[11px] font-semibold text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline">
                  Part payment / details
                </button>
              )}
            </div>
          )}
          {canEdit && history.length > 0 && done && (
            <button
              type="button"
              disabled={busy}
              onClick={markPending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-amber-300 hover:text-amber-700 disabled:opacity-60"
            >
              <RotateCcw size={13} /> Undo
            </button>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <ul className="divide-y divide-slate-100 bg-white">
          {history.map((item) => (
            <li key={item.paymentId} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-xs">
              <span className="font-mono font-bold text-slate-800">{formatMoney(item.amount)}</span>
              <span className="text-slate-500">
                {formatDateKey(item.paidOn)} · {paymentModeLabel(item.mode)}
                {item.reference && ` · ${item.reference}`}
                {item.paidBy?.name && ` · by ${item.paidBy.name}`}
              </span>
              {canEdit && (
                <button type="button" onClick={() => remove(item)} className="rounded p-1 text-slate-300 hover:text-rose-500" aria-label="Remove payment">
                  <Trash2 size={13} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
