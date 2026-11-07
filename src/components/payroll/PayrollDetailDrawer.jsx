import React, { useMemo, useState } from "react";
import { AlertTriangle, CalendarOff, Clock, FileDown, FileSpreadsheet, Info, MinusCircle, PlusCircle, Wallet } from "lucide-react";
import Modal from "../ui/Modal";
import { Button } from "../ui/FormField";
import { ErrorBlock, LoadingBlock } from "../ui/StateBlock";
import SalaryProfilePanel from "./SalaryProfilePanel";
import { PaymentPanel } from "./SalaryPayment";
import { formatMoney } from "../../constants/PayrollConstants";
import { styleForStatus } from "../../constants/AttendanceStatus";
import { leaveTypeLabel, sessionLabel } from "../../constants/LeaveConstants";
import { MONTH_NAMES, formatDateKey, formatIstTime, minutesToHm } from "../../utils/IstTime";
import { exportPayrollDetailExcel, exportPayrollDetailPdf } from "../../utils/PayrollExport";

/* ---------------- helpers (display only - every number comes from the server) ---------------- */

const num = (value) => Number(value) || 0;

const isUnpaidLeave = (day) => day.leave && !day.leave.isPending && !(day.leave.paidFraction > 0);

/** Why money was cut on this day, in plain words. */
const deductionReason = (day) => {
  if (!(day.deduction > 0)) return null;
  if (isUnpaidLeave(day)) return day.leave.fraction === 0.5 ? "Unpaid half-day leave" : "Unpaid leave";
  if (day.status === "ABSENT") return "Absent · full day cut";
  if (day.status === "HALF_DAY") return "Half day · ½ day cut";
  return "Worked less than required";
};

const offDayLabel = (day) => {
  if (day.holidayTitle) return day.holidayTitle;
  if (day.dayKind === "WEEKLY_OFF") return "Sunday · weekly off";
  return null;
};

const FILTERS = [
  { key: "all", label: "All days" },
  { key: "deduction", label: "Deductions", test: (day) => day.deduction > 0 },
  { key: "extra", label: "Extra time", test: (day) => day.extraMinutes > 0 },
  { key: "leave", label: "Leave", test: (day) => Boolean(day.leave) },
  { key: "off", label: "Off days", test: (day) => day.dayKind !== "WORKING" },
];

/* ---------------- small building blocks ---------------- */

const FormulaPart = ({ label, value, tone = "text-white" }) => (
  <div className="rounded-xl bg-white/10 px-3 py-2">
    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
    <p className={`font-mono text-sm font-bold ${tone}`}>{value}</p>
  </div>
);

const Operator = ({ children }) => <span className="font-mono text-lg font-bold text-slate-500">{children}</span>;

const StepCard = ({ icon: Icon, tone, title, children }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-4">
    <div className="mb-3 flex items-center gap-2">
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
        <Icon size={15} />
      </span>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-700">{title}</p>
    </div>
    {children}
  </div>
);

const Line = ({ label, hint, value, tone = "text-slate-800", strong }) => (
  <div className={`flex items-start justify-between gap-3 py-1.5 ${strong ? "mt-1 border-t border-slate-100 pt-2.5" : ""}`}>
    <div>
      <p className={`text-xs ${strong ? "font-bold text-slate-800" : "font-semibold text-slate-600"}`}>{label}</p>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
    <p className={`shrink-0 font-mono text-sm ${strong ? "font-bold" : "font-bold"} ${tone}`}>{value}</p>
  </div>
);

const CountChip = ({ label, value, tone }) => (
  <div className={`rounded-xl px-3 py-2 ${tone}`}>
    <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">{label}</p>
    <p className="font-mono text-lg font-bold">{value}</p>
  </div>
);

const StatusBadge = ({ day }) => {
  const style = styleForStatus(day.status);
  if (!style.label && !day.status) return <span className="text-slate-300">-</span>;
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${style.badge || "bg-slate-100 text-slate-600"}`}>{style.label || day.status}</span>;
};

const LeaveText = ({ leave }) =>
  leave ? (
    <span>
      {leaveTypeLabel(leave.leaveType)}
      {leave.fraction === 0.5 && ` ½ ${sessionLabel(leave.halfDaySession)}`}
      {leave.isPending ? (
        <span className="text-orange-600"> · pending</span>
      ) : (
        <span className={leave.paidFraction > 0 ? "text-emerald-600" : "text-rose-600"}> · {leave.paidFraction > 0 ? "paid" : "unpaid"}</span>
      )}
    </span>
  ) : (
    <span className="text-slate-300">-</span>
  );

const ExtraCell = ({ day, onApproveExtra }) => {
  if (!(day.extraMinutes > 0)) return <span className="text-slate-300">-</span>;
  return (
    <span className="text-violet-700">
      +{minutesToHm(day.extraMinutes)}
      {day.extraCounted ? (
        <span className="block text-[11px] font-bold">{formatMoney(day.extraPay)}</span>
      ) : onApproveExtra && day.attendanceId ? (
        <button type="button" onClick={() => onApproveExtra(day)} className="mt-0.5 block rounded bg-violet-100 px-1.5 text-[11px] font-bold">
          Approve
        </button>
      ) : (
        <span className="block text-[11px] text-slate-400">not approved</span>
      )}
    </span>
  );
};

/* ---------------- final salary ---------------- */

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
const twoDigits = (n) => (n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ""}`);
const threeDigits = (n) =>
  [Math.floor(n / 100) ? `${ONES[Math.floor(n / 100)]} Hundred` : "", n % 100 ? twoDigits(n % 100) : ""].filter(Boolean).join(" ");

/** 24125.5 -> "Twenty Four Thousand One Hundred Twenty Five Rupees and Fifty Paise Only" (Indian system). */
const rupeesInWords = (amount) => {
  const totalPaise = Math.round(num(amount) * 100);
  let rupees = Math.floor(totalPaise / 100);
  const paise = totalPaise % 100;
  if (!rupees && !paise) return "Zero Rupees Only";
  const parts = [];
  const crore = Math.floor(rupees / 1e7);
  rupees %= 1e7;
  const lakh = Math.floor(rupees / 1e5);
  rupees %= 1e5;
  const thousand = Math.floor(rupees / 1000);
  rupees %= 1000;
  if (crore) parts.push(`${threeDigits(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (rupees) parts.push(threeDigits(rupees));
  let words = parts.length ? `${parts.join(" ")} Rupees` : "";
  if (paise) words += `${words ? " and " : ""}${twoDigits(paise)} Paise`;
  return `${words} Only`;
};

/** Salary-slip style statement at the end: base, each cut, extra, and the final amount to pay. */
const FinalSalary = ({ detail }) => {
  const lines = [
    { label: "Base salary", value: num(detail.baseSalary), sign: "" },
    { label: `Absent (${num(detail.absentDays) + num(detail.notJoinedDays)} day)`, value: num(detail.absentDeduction), sign: "−" },
    { label: `Unpaid leave (${num(detail.unpaidLeaveDays)} day)`, value: num(detail.leaveDeduction), sign: "−" },
    { label: `Half days / short hours (${num(detail.halfDays)} day)`, value: num(detail.shortHoursDeduction), sign: "−" },
    { label: `Extra pay (${num(detail.extraHoursCounted)} h approved)`, value: num(detail.extraPay), sign: "+" },
  ];
  const isLive = detail.period?.isLive !== false;

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-emerald-200">
      <div className="bg-emerald-50 px-5 py-3">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Final salary statement</p>
      </div>
      <div className="divide-y divide-slate-100 bg-white px-5">
        {lines.map((line) => (
          <div key={line.label} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <span className="font-semibold text-slate-600">{line.label}</span>
            <span
              className={`font-mono font-bold ${
                line.sign === "−" ? (line.value > 0 ? "text-rose-600" : "text-slate-300") : line.sign === "+" ? (line.value > 0 ? "text-violet-700" : "text-slate-300") : "text-slate-800"
              }`}
            >
              {line.sign && `${line.sign} `}
              {formatMoney(line.value)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1 bg-emerald-600 px-5 py-4 text-white sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">Total salary to pay</p>
          <p className="text-[11px] font-semibold text-emerald-50">{rupeesInWords(detail.netPayable)}</p>
        </div>
        <p className="font-mono text-3xl font-bold">{formatMoney(detail.netPayable)}</p>
      </div>
      {(isLive || detail.pendingDays > 0) && (
        <p className="bg-white px-5 py-2.5 text-[11px] text-slate-500">
          {isLive ? "This month is not finalized yet - the amount can change until payroll is finalized." : ""}
          {detail.pendingDays > 0 ? ` ${detail.pendingDays} pending day(s) are not included yet.` : ""}
        </p>
      )}
    </div>
  );
};

/* ---------------- breakdown ---------------- */

/** Explains one employee's month: the formula, each deduction, the counts and every day. */
export const PayrollBreakdown = ({ detail, onApproveExtra }) => {
  const [filter, setFilter] = useState("all");
  const days = detail.days || [];

  const offDays = useMemo(() => days.filter((day) => day.dayKind && day.dayKind !== "WORKING"), [days]);
  const sundays = offDays.filter((day) => day.dayKind === "WEEKLY_OFF").length;
  const holidays = offDays.filter((day) => day.holidayTitle).length;

  const activeFilter = FILTERS.find((item) => item.key === filter);
  const visibleDays = activeFilter?.test ? days.filter(activeFilter.test) : days;
  const pendingExtraHours = Math.max(0, num(detail.extraHours) - num(detail.extraHoursCounted));

  return (
    <div className="space-y-5">
      {/* 1. Net payable + formula */}
      <div className="rounded-2xl bg-slate-900 p-5 text-white">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Net payable this month</p>
        <p className="font-mono text-3xl font-bold sm:text-4xl">{formatMoney(detail.netPayable)}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <FormulaPart label="Base salary" value={formatMoney(detail.baseSalary)} />
          <Operator>−</Operator>
          <FormulaPart label="Deductions" value={formatMoney(detail.totalDeductions)} tone="text-rose-300" />
          <Operator>+</Operator>
          <FormulaPart label="Extra pay" value={formatMoney(detail.extraPay)} tone="text-violet-300" />
          <Operator>=</Operator>
          <FormulaPart label="Net" value={formatMoney(detail.netPayable)} tone="text-emerald-300" />
        </div>
      </div>

      {/* Alerts */}
      {detail.pendingDays > 0 && (
        <p className="flex items-start gap-2 rounded-xl bg-yellow-50 px-3 py-2 text-xs font-semibold text-yellow-800">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          {detail.pendingDays} day(s) are pending (missing punch-out or leave awaiting approval). They are not counted until resolved.
        </p>
      )}
      {pendingExtraHours > 0 && (
        <p className="flex items-start gap-2 rounded-xl bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-800">
          <Clock size={14} className="mt-0.5 shrink-0" />
          {pendingExtraHours} extra hour(s) are waiting for approval and are not paid yet.
        </p>
      )}

      {/* 2. How it was calculated */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">How this salary was calculated</p>
        <div className="grid gap-3 lg:grid-cols-3">
          <StepCard icon={Wallet} tone="bg-sky-50 text-sky-600" title="1 · Daily rate">
            <Line label="Base salary" value={formatMoney(detail.baseSalary)} />
            <Line
              label="Working days"
              hint={`Days in month − ${sundays} Sunday(s) − ${holidays} holiday(s)`}
              value={detail.workingDays}
            />
            <Line label="Per day" hint="Base ÷ working days" value={formatMoney(detail.perDay)} strong />
            <Line label="Per hour" hint="Used for extra time" value={formatMoney(detail.perHour)} />
          </StepCard>

          <StepCard icon={MinusCircle} tone="bg-rose-50 text-rose-600" title="2 · Deductions">
            <Line
              label="Absent days"
              hint={`${num(detail.absentDays)} day(s) × ${formatMoney(detail.perDay)}`}
              value={formatMoney(detail.absentDeduction)}
              tone="text-rose-600"
            />
            <Line
              label="Unpaid leave"
              hint={`${num(detail.unpaidLeaveDays)} day(s) beyond paid quota`}
              value={formatMoney(detail.leaveDeduction)}
              tone="text-rose-600"
            />
            <Line label="Half days & short hours" hint="Days worked less than required" value={formatMoney(detail.shortHoursDeduction)} tone="text-rose-600" />
            <Line label="Total deductions" value={formatMoney(detail.totalDeductions)} tone="text-rose-600" strong />
          </StepCard>

          <StepCard icon={PlusCircle} tone="bg-violet-50 text-violet-600" title="3 · Extra pay">
            <Line label="Extra time worked" value={`${num(detail.extraHours)} h`} />
            <Line label="Approved & counted" value={`${num(detail.extraHoursCounted)} h`} />
            <Line label="Rate" hint="Per hour" value={formatMoney(detail.perHour)} />
            <Line label="Extra pay" value={formatMoney(detail.extraPay)} tone="text-violet-700" strong />
          </StepCard>
        </div>
      </div>

      {/* 3. Day counts */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Attendance this month</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          <CountChip label="Working days" value={detail.workingDays} tone="bg-slate-100 text-slate-800" />
          <CountChip label="Present" value={num(detail.presentDays)} tone="bg-emerald-50 text-emerald-700" />
          <CountChip label="Half day" value={num(detail.halfDays)} tone="bg-amber-50 text-amber-700" />
          <CountChip label="Paid leave" value={num(detail.paidLeaveDays)} tone="bg-orange-50 text-orange-700" />
          <CountChip label="Unpaid leave" value={num(detail.unpaidLeaveDays)} tone="bg-rose-50 text-rose-700" />
          <CountChip label="Absent" value={num(detail.absentDays)} tone="bg-rose-100 text-rose-700" />
          <CountChip label="Sun + holidays" value={offDays.length} tone="bg-slate-50 text-slate-500" />
          <CountChip label="Hours worked" value={num(detail.totalWorkedHours)} tone="bg-sky-50 text-sky-700" />
        </div>
        {detail.notJoinedDays > 0 && (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
            <Info size={12} /> {detail.notJoinedDays} day(s) before the joining date are not counted.
          </p>
        )}
      </div>

      {/* 4. Day by day */}
      <div>
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Day by day</p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter days">
            {FILTERS.map((item) => {
              const count = item.test ? days.filter(item.test).length : days.length;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                    filter === item.key ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item.label} <span className="opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {!visibleDays.length ? (
          <p className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">No days in this filter.</p>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto rounded-2xl border border-slate-100 md:block">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="bg-slate-50">
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">In → Out</th>
                    <th className="px-3 py-2">Worked</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Leave</th>
                    <th className="px-3 py-2 text-right">Deduction</th>
                    <th className="px-3 py-2 text-right">Extra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {visibleDays.map((day) => {
                    const off = offDayLabel(day);
                    const reason = deductionReason(day);
                    return (
                      <tr
                        key={day.date}
                        className={`${off ? "bg-slate-50/70 text-slate-500" : ""} ${reason ? "border-l-2 border-l-rose-300" : "border-l-2 border-l-transparent"}`}
                      >
                        <td className="whitespace-nowrap px-3 py-2">
                          <span className="font-bold text-slate-700">{formatDateKey(day.date, { weekday: "short", day: "2-digit", month: "short" })}</span>
                          {off && (
                            <span className={`mt-0.5 flex items-center gap-1 text-[11px] font-semibold ${day.holidayTitle ? "text-rose-600" : "text-slate-400"}`}>
                              <CalendarOff size={10} /> {off}
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 font-mono">
                          {day.punchIn ? formatIstTime(day.punchIn) : "--:--"} → {day.punchOut ? formatIstTime(day.punchOut) : "--:--"}
                        </td>
                        <td className="px-3 py-2 font-mono">{day.workedMinutes ? minutesToHm(day.workedMinutes) : "-"}</td>
                        <td className="px-3 py-2"><StatusBadge day={day} /></td>
                        <td className="px-3 py-2"><LeaveText leave={day.leave} /></td>
                        <td className="px-3 py-2 text-right">
                          {reason ? (
                            <>
                              <span className="font-mono font-bold text-rose-600">−{formatMoney(day.deduction)}</span>
                              <span className="block text-[11px] text-slate-400">{reason}</span>
                            </>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-mono"><ExtraCell day={day} onApproveExtra={onApproveExtra} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="space-y-2 md:hidden">
              {visibleDays.map((day) => {
                const off = offDayLabel(day);
                const reason = deductionReason(day);
                return (
                  <div key={day.date} className={`rounded-2xl border p-3 ${reason ? "border-rose-200" : "border-slate-100"} ${off ? "bg-slate-50" : "bg-white"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-700">{formatDateKey(day.date, { weekday: "short", day: "2-digit", month: "short" })}</p>
                        {off && <p className={`text-[11px] font-semibold ${day.holidayTitle ? "text-rose-600" : "text-slate-400"}`}>{off}</p>}
                      </div>
                      <StatusBadge day={day} />
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="rounded-lg bg-slate-50 py-1.5">
                        <p className="text-[11px] font-bold uppercase text-slate-400">In</p>
                        <p className="font-mono font-bold">{day.punchIn ? formatIstTime(day.punchIn) : "--:--"}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 py-1.5">
                        <p className="text-[11px] font-bold uppercase text-slate-400">Out</p>
                        <p className="font-mono font-bold">{day.punchOut ? formatIstTime(day.punchOut) : "--:--"}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 py-1.5">
                        <p className="text-[11px] font-bold uppercase text-slate-400">Worked</p>
                        <p className="font-mono font-bold">{day.workedMinutes ? minutesToHm(day.workedMinutes) : "-"}</p>
                      </div>
                    </div>
                    {day.leave && <p className="mt-2 text-[11px] text-slate-600"><LeaveText leave={day.leave} /></p>}
                    {(reason || day.extraMinutes > 0) && (
                      <div className="mt-2 flex items-end justify-between gap-2 border-t border-slate-100 pt-2 text-xs">
                        {reason ? (
                          <span>
                            <span className="font-mono font-bold text-rose-600">−{formatMoney(day.deduction)}</span>
                            <span className="block text-[11px] text-slate-400">{reason}</span>
                          </span>
                        ) : (
                          <span />
                        )}
                        <span className="text-right font-mono"><ExtraCell day={day} onApproveExtra={onApproveExtra} /></span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 5. Final amount */}
      <FinalSalary detail={detail} />
    </div>
  );
};

/**
 * Drawer opened from a payroll row: breakdown tab and salary profile tab, plus exports.
 */
export default function PayrollDetailDrawer({ open, detail, loading, error, onRetry, onClose, employeeId, canEditSalary, onSalarySaved, onApproveExtra, canPay, onPay, onPaymentChanged }) {
  const [tab, setTab] = useState("breakdown");
  const title = detail?.employee?.name || "Payroll breakdown";
  const subtitle = detail ? `${MONTH_NAMES[detail.month - 1]} ${detail.year} · ${detail.period?.isLive ? "live" : `finalized v${detail.period?.version}`}` : "";

  return (
    <Modal
      open={open}
      side="right"
      widthClass="max-w-5xl"
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      footer={
        detail && tab === "breakdown" ? (
          <>
            <Button variant="secondary" onClick={() => exportPayrollDetailExcel(detail)}>
              <FileSpreadsheet size={14} /> Excel
            </Button>
            <Button variant="secondary" onClick={() => exportPayrollDetailPdf(detail)}>
              <FileDown size={14} /> PDF
            </Button>
          </>
        ) : null
      }
    >
      <div className="mb-4 flex gap-2" role="tablist">
        {[
          ["breakdown", "Breakdown"],
          ["salary", "Salary profile"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider ${tab === key ? "bg-[#E68736] text-white" : "bg-slate-100 text-slate-500"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "salary" ? (
        <SalaryProfilePanel employeeId={employeeId} canEdit={canEditSalary} onSaved={onSalarySaved} />
      ) : loading ? (
        <LoadingBlock text="Loading breakdown" />
      ) : error ? (
        <ErrorBlock message={error} onRetry={onRetry} />
      ) : detail ? (
        <div className="space-y-5">
          <PaymentPanel detail={detail} canEdit={canPay} onPay={() => onPay?.(detail)} onChanged={onPaymentChanged} />
          <PayrollBreakdown detail={detail} onApproveExtra={detail.period?.isLive ? onApproveExtra : undefined} />
        </div>
      ) : null}
    </Modal>
  );
}