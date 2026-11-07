import React, { useCallback, useEffect, useState } from "react";
import { CalendarCheck, CheckCircle2, Clock, FileDown, IndianRupee, Wallet } from "lucide-react";
import PageShell from "../ui/PageShell";
import MonthPicker from "../ui/MonthPicker";
import { Button } from "../ui/FormField";
import { ErrorBlock, LoadingBlock } from "../ui/StateBlock";
import { PayrollBreakdown } from "./PayrollDetailDrawer";
import { dueInfoOf, paymentOf, salaryStateOf } from "./SalaryPayment";
import { PayrollService } from "../../backend/ApiService";
import { formatMoney, paymentModeLabel } from "../../constants/PayrollConstants";
import { MONTH_NAMES, currentIstMonth, formatDateKey } from "../../utils/IstTime";
import { exportPayrollDetailPdf } from "../../utils/PayrollExport";

const errorText = (error, fallback) => error?.response?.data?.message || fallback;

/** Top card: month, amount and the salary status (Pending until HR presses Done). */
const SalaryHero = ({ detail }) => {
  const payment = paymentOf(detail);
  const done = salaryStateOf(payment) === "DONE";
  const { dueOn, isOverdue } = dueInfoOf(detail);
  const history = payment.history || [];
  const last = history[history.length - 1];
  const monthLabel = `${MONTH_NAMES[(detail.month || 1) - 1]} ${detail.year}`;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="relative bg-gradient-to-br from-[#E68736] to-orange-500 p-5 text-white sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-14 right-16 h-32 w-32 rounded-full bg-white/10" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-orange-50">
              <CalendarCheck size={14} /> {monthLabel} · {detail.period?.isLive ? "live" : "finalized"}
            </p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-orange-100">Net salary</p>
            <p className="font-mono text-4xl font-bold sm:text-5xl">{formatMoney(detail.netPayable)}</p>
          </div>
          <span
            className={`inline-flex w-fit items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold shadow-sm ${
              done ? "bg-emerald-500 text-white" : "bg-white text-amber-700"
            }`}
          >
            {done ? <CheckCircle2 size={18} /> : <Clock size={18} />}
            {done ? "Salary Done" : "Salary Pending"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Stat icon={Wallet} label="Base salary" value={formatMoney(detail.baseSalary)} />
        <Stat icon={IndianRupee} label={done ? "Received" : "To receive"} value={formatMoney(done ? payment.paidAmount : payment.balance)} tone={done ? "text-emerald-700" : "text-slate-900"} />
        <Stat
          icon={done ? CheckCircle2 : Clock}
          label={done ? "Received on" : "Expected by"}
          value={done ? (payment.lastPaidOn ? formatDateKey(payment.lastPaidOn) : "-") : dueOn ? formatDateKey(dueOn) : "Not paid yet"}
          hint={done ? (last ? paymentModeLabel(last.mode) : undefined) : payment.status === "PARTIAL" ? `${formatMoney(payment.paidAmount)} received so far` : "15th of next month"}
          tone={done ? "text-emerald-700" : "text-amber-700"}
        />
      </div>

      {!done && (
        <p className="border-t border-amber-100 bg-amber-50 px-5 py-2.5 text-xs font-semibold text-amber-800">
          {isOverdue
            ? "Your salary is still pending after the due date. Please contact HR."
            : "Your salary is pending. It is paid by the 15th of next month; once HR marks it Done, the status here will change to Done."}
        </p>
      )}
    </div>
  );
};

const Stat = ({ icon: Icon, label, value, hint, tone = "text-slate-900" }) => (
  <div className="flex items-center gap-3 px-5 py-4">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
      <Icon size={16} />
    </span>
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`truncate font-mono text-base font-bold ${tone}`}>{value}</p>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  </div>
);

/** /workforce/my-salary - the logged-in employee's own salary for a month (server computed). */
export default function MySalaryPage() {
  const [month, setMonth] = useState(currentIstMonth());
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const load = useCallback(async () => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const response = await PayrollService.mySalary(month);
      setState({ data: response.data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: errorText(error, "Could not load your salary") });
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const detail = state.data;
  return (
    <div>
      <PageShell
        title="My Salary"
        description={detail?.period?.isLive ? "Live figures for this month - they change as attendance is recorded." : "Finalized salary for this month."}
        actions={
          <>
            <MonthPicker value={month} onChange={setMonth} maxValue={currentIstMonth()} />
            {detail && (
              <Button variant="secondary" onClick={() => exportPayrollDetailPdf(detail)}>
                <FileDown size={14} /> PDF
              </Button>
            )}
          </>
        }
      >
        {state.loading ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <LoadingBlock text="Loading salary" />
          </div>
        ) : state.error ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <ErrorBlock message={state.error} onRetry={load} />
          </div>
        ) : !detail.hasSalaryProfile ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <ErrorBlock message="Your salary has not been set up yet. Please contact HR." />
          </div>
        ) : (
          <div className="space-y-5">
            <SalaryHero detail={detail} />
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
              <PayrollBreakdown detail={detail} />
            </div>
          </div>
        )}
      </PageShell>
    </div>
  );
}
