import React from "react";
import { AlertTriangle, CheckCircle2, ChevronRight, Clock } from "lucide-react";
import { formatMoney } from "../../constants/PayrollConstants";
import { formatDateKey } from "../../utils/IstTime";
import { EmptyBlock, LoadingBlock } from "../ui/StateBlock";
import { canMarkDone, dueInfoOf, paymentOf, salaryStateOf } from "./SalaryPayment";

/**
 * One row per employee with the server-computed payroll. Clicking a row opens the breakdown.
 * The last column is the salary status:
 *   Pending -> amber "Pending" + green "Done" button (stays Pending until Done is pressed)
 *   Done    -> green "Done" with amount and date (row is tinted green)
 * The checkbox column selects pending employees for "Mark selected as Done".
 */

const num = (value) => Number(value) || 0;

const Chip = ({ tone, label, value }) => (
  <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${tone}`}>
    {label} <span className="font-mono font-bold">{value}</span>
  </span>
);

const AttendanceChips = ({ row }) => (
  <div className="flex flex-wrap gap-1">
    <Chip tone="bg-emerald-50 text-emerald-700" label="Present" value={num(row.presentDays)} />
    <Chip tone="bg-amber-50 text-amber-700" label="Half" value={num(row.halfDays)} />
    <Chip tone={num(row.absentDays) > 0 ? "bg-rose-50 text-rose-700" : "bg-slate-50 text-slate-500"} label="Absent" value={num(row.absentDays)} />
  </div>
);

const LeaveChips = ({ row }) => (
  <div className="flex flex-wrap gap-1">
    <Chip tone="bg-orange-50 text-orange-700" label="Paid" value={num(row.paidLeaveDays)} />
    <Chip tone={num(row.unpaidLeaveDays) > 0 ? "bg-rose-50 text-rose-700" : "bg-slate-50 text-slate-500"} label="Unpaid" value={num(row.unpaidLeaveDays)} />
  </div>
);

const Badges = ({ row }) =>
  !row.hasSalaryProfile || row.pendingDays > 0 ? (
    <div className="mt-1 flex flex-wrap gap-1">
      {!row.hasSalaryProfile && <span className="rounded bg-red-100 px-1.5 text-[11px] font-bold text-red-700">No salary set</span>}
      {row.pendingDays > 0 && (
        <span className="inline-flex items-center gap-1 rounded bg-yellow-100 px-1.5 text-[11px] font-bold text-yellow-800">
          <AlertTriangle size={10} /> {row.pendingDays} pending
        </span>
      )}
    </div>
  ) : null;

const Money = ({ value, tone = "text-slate-700", sign = "" }) => (
  <span className={`whitespace-nowrap font-mono text-xs font-bold ${num(value) > 0 ? tone : "text-slate-300"}`}>
    {num(value) > 0 && sign}
    {formatMoney(value)}
  </span>
);

const stop = (handler) => (event) => {
  event.stopPropagation();
  handler?.(event);
};

/** Pending / Done + the Done button. */
export const PaymentCell = ({ row, onDone }) => {
  const payment = paymentOf(row);
  const state = salaryStateOf(payment);
  const { dueOn, isOverdue } = dueInfoOf(row);

  if (state === "NO_SALARY") return <span className="text-[11px] font-semibold text-slate-400">Salary not set</span>;

  if (state === "DONE") {
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
          <CheckCircle2 size={14} /> Done
        </span>
        <span className="text-[11px] font-semibold text-emerald-700">
          {payment.paidAmount > 0 ? formatMoney(payment.paidAmount) : "Nothing to pay"}
          {payment.lastPaidOn && ` · ${formatDateKey(payment.lastPaidOn, { day: "2-digit", month: "short" })}`}
        </span>
      </div>
    );
  }

  const partial = payment.status === "PARTIAL";
  return (
    <div className="flex flex-col items-start gap-1.5">
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ring-1 ${
          isOverdue ? "bg-rose-100 text-rose-700 ring-rose-200" : "bg-amber-100 text-amber-800 ring-amber-200"
        }`}
      >
        <Clock size={13} /> {isOverdue ? "Overdue" : "Pending"}
      </span>
      {partial && <span className="font-mono text-[11px] font-bold text-amber-700">{formatMoney(payment.balance)} remaining</span>}
      {dueOn && (
        <span className={`text-[11px] font-semibold ${isOverdue ? "text-rose-600" : "text-slate-500"}`}>
          {isOverdue ? "was due" : "due by"} {formatDateKey(dueOn, { day: "2-digit", month: "short" })}
        </span>
      )}
      {onDone && canMarkDone(row) && (
        <button
          type="button"
          onClick={stop(() => onDone(row))}
          onKeyDown={(event) => event.stopPropagation()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          <CheckCircle2 size={13} /> Done
        </button>
      )}
    </div>
  );
};

const SelectBox = ({ row, selected, onToggle }) =>
  canMarkDone(row) ? (
    <input
      type="checkbox"
      checked={selected.has(row.employeeId)}
      onChange={() => onToggle(row)}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      className="h-4 w-4 cursor-pointer rounded accent-emerald-600"
      aria-label={`Select ${row.name}`}
    />
  ) : salaryStateOf(paymentOf(row)) === "DONE" ? (
    <CheckCircle2 size={16} className="text-emerald-500" aria-label="Done" />
  ) : null;

export default function PayrollTable({ rows, loading, onSelect, onDone, selected = new Set(), onToggle, onToggleAll }) {
  if (loading) return <LoadingBlock text="Calculating payroll" />;
  if (!rows.length) return <EmptyBlock title="No employees match" hint="Change the search, filter or month." />;

  const selectable = rows.filter(canMarkDone);
  const allSelected = selectable.length > 0 && selectable.every((row) => selected.has(row.employeeId));
  const someSelected = selectable.some((row) => selected.has(row.employeeId));
  const withSelection = Boolean(onToggle);

  const open = (row) => onSelect(row);
  const onKey = (event, row) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open(row);
    }
  };
  const rowTone = (row) =>
    salaryStateOf(paymentOf(row)) === "DONE" ? "bg-emerald-50/60" : selected.has(row.employeeId) ? "bg-emerald-50/30" : "";

  return (
    <>
      {/* Desktop: fits the width, no horizontal scroll */}
      <table className="hidden w-full table-fixed text-left lg:table">
        <colgroup>
          {withSelection && <col className="w-[3%]" />}
          <col className="w-[15%]" />
          <col className="w-[8%]" />
          <col className="w-[16%]" />
          <col className="w-[10%]" />
          <col className="w-[8%]" />
          <col className="w-[8%]" />
          <col className="w-[6%]" />
          <col className="w-[9%]" />
          <col className="w-[15%]" />
          <col className="w-[2%]" />
        </colgroup>
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {withSelection && (
              <th className="py-3 pl-4">
                {selectable.length > 0 && (
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={() => onToggleAll(selectable, !allSelected)}
                    className="h-4 w-4 cursor-pointer rounded accent-emerald-600"
                    aria-label="Select all pending"
                    title="Select all pending"
                  />
                )}
              </th>
            )}
            <th className="py-3 pl-3 pr-2">Employee</th>
            <th className="px-2 py-3 text-right">Base</th>
            <th className="px-2 py-3">Attendance</th>
            <th className="px-2 py-3">Leave</th>
            <th className="px-2 py-3">Hours</th>
            <th className="px-2 py-3 text-right">Deductions</th>
            <th className="px-2 py-3 text-right">Extra</th>
            <th className="px-2 py-3 text-right">Net payable</th>
            <th className="px-3 py-3">Salary status</th>
            <th className="py-3 pr-3" aria-label="Open" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row) => (
            <tr
              key={row.employeeId}
              tabIndex={0}
              onClick={() => open(row)}
              onKeyDown={(event) => onKey(event, row)}
              className={`cursor-pointer align-top text-sm transition-colors hover:bg-orange-50/40 focus:bg-orange-50/60 focus:outline-none ${rowTone(row)}`}
            >
              {withSelection && (
                <td className="py-3.5 pl-4">
                  <SelectBox row={row} selected={selected} onToggle={onToggle} />
                </td>
              )}
              <td className="py-3 pl-3 pr-2">
                <p className="truncate font-bold text-slate-800" title={row.name}>{row.name}</p>
                <p className="truncate text-[11px] text-slate-400" title={row.email}>{row.email}</p>
                <Badges row={row} />
              </td>
              <td className="px-2 py-3 text-right">
                <Money value={row.baseSalary} />
              </td>
              <td className="px-2 py-3">
                <AttendanceChips row={row} />
                <p className="mt-1 text-[11px] text-slate-400">of {row.workingDays} working days</p>
              </td>
              <td className="px-2 py-3">
                <LeaveChips row={row} />
              </td>
              <td className="px-2 py-3 font-mono text-xs">
                <p className="font-bold text-slate-700">{num(row.totalWorkedHours)} h</p>
                <p className={num(row.extraHours) > 0 ? "font-bold text-violet-700" : "text-slate-300"}>+{num(row.extraHours)} h extra</p>
              </td>
              <td className="px-2 py-3 text-right">
                <Money value={row.totalDeductions} tone="text-rose-600" sign="− " />
              </td>
              <td className="px-2 py-3 text-right">
                <Money value={row.extraPay} tone="text-violet-700" sign="+ " />
              </td>
              <td className="px-2 py-3 text-right">
                <span className="whitespace-nowrap font-mono text-sm font-bold text-slate-900">{formatMoney(row.netPayable)}</span>
              </td>
              <td className="px-3 py-3">
                <PaymentCell row={row} onDone={onDone} />
              </td>
              <td className="py-3 pr-3 text-slate-300">
                <ChevronRight size={16} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tablet / mobile: cards */}
      <div className="space-y-3 p-3 lg:hidden">
        {withSelection && selectable.length > 0 && (
          <label className="flex items-center gap-2 px-1 text-xs font-bold text-slate-600">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => onToggleAll(selectable, !allSelected)}
              className="h-4 w-4 rounded accent-emerald-600"
            />
            Select all pending ({selectable.length})
          </label>
        )}
        {rows.map((row) => (
          <div
            key={row.employeeId}
            role="button"
            tabIndex={0}
            onClick={() => open(row)}
            onKeyDown={(event) => onKey(event, row)}
            className={`cursor-pointer rounded-2xl border p-4 transition-colors hover:bg-orange-50/40 focus:bg-orange-50/60 focus:outline-none ${
              salaryStateOf(paymentOf(row)) === "DONE" ? "border-emerald-200 bg-emerald-50/50" : "border-slate-100"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                {withSelection && (
                  <span className="pt-0.5">
                    <SelectBox row={row} selected={selected} onToggle={onToggle} />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-800">{row.name}</p>
                  <p className="truncate text-[11px] text-slate-400">{row.email}</p>
                  <Badges row={row} />
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Net payable</p>
                <p className="font-mono text-base font-bold text-slate-900">{formatMoney(row.netPayable)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
              <div className="space-y-1.5">
                <AttendanceChips row={row} />
                <LeaveChips row={row} />
              </div>
              <PaymentCell row={row} onDone={onDone} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
