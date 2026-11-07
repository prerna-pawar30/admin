import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { AlertTriangle, CalendarClock, CheckCircle2, Clock, FileDown, FileSpreadsheet, Info, ListChecks, Lock, LockOpen, Search, Settings2 } from "lucide-react";
import PageShell from "../ui/PageShell";
import MonthPicker from "../ui/MonthPicker";
import Pagination from "../ui/Pagination";
import { Button } from "../ui/FormField";
import { ErrorBlock } from "../ui/StateBlock";
import PayrollTable from "./PayrollTable";
import PayrollDetailDrawer from "./PayrollDetailDrawer";
import PayrollSettingsDialog from "./PayrollSettingsDialog";
import { PayDialog, canMarkDone, confirmSalaryDone, paymentOf, salaryDueOn } from "./SalaryPayment";
import { PayrollService } from "../../backend/ApiService";
import {
  closePayrollDetail,
  fetchPayrollDetail,
  openPayrollDetail,
  setPayrollMonth,
  setPayrollPage,
  setPayrollPaymentFilter,
  setPayrollSearch,
} from "../../store/slices/PayrollSlice";
import { HR_PERMISSIONS, MONTH_STATUS_STYLE, formatMoney } from "../../constants/PayrollConstants";
import { DEBOUNCE_MS } from "../../constants/AppConfig";
import { MONTH_NAMES, currentIstMonth, formatDateKey, formatIstDateTime, todayIstKey } from "../../utils/IstTime";
import { exportPayrollExcel, exportPayrollPdf } from "../../utils/PayrollExport";

const EXPORT_PAGE_SIZE = 200;
const PAGE_SIZE = 20;
const errorText = (error, fallback) => error?.response?.data?.message || fallback;

/**
 * /workforce/payroll - all employees for a month (live, or the finalized snapshot), with search,
 * paging, exports, finalize / re-open, settings and a per-employee breakdown drawer.
 * Every number comes from the server.
 */
export default function PayrollPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const payroll = useSelector((state) => state.payroll);
  const { filters, selectedEmployeeId, detail, detailStatus, detailError } = payroll;
  // The list is read straight from the API so every field (payment status, summary) arrives as sent.
  const [list, setList] = useState({ items: [], meta: null, month: null, summary: null, status: "loading", error: null });
  const { items, meta, month, summary, status, error } = list;
  const [searchInput, setSearchInput] = useState(filters.search);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [payRow, setPayRow] = useState(null);
  const [selected, setSelected] = useState(() => new Set());

  const isAdmin = [0, 1].includes(Number(user?.role));
  const can = (permission) => isAdmin || user?.permissions?.includes(permission);

  const reload = useCallback(async () => {
    setList((previous) => ({ ...previous, status: "loading", error: null }));
    try {
      const response = await PayrollService.list({
        month: filters.month,
        year: filters.year,
        search: filters.search || undefined,
        paymentStatus: filters.paymentStatus || undefined,
        page: filters.page || 1,
        limit: PAGE_SIZE,
      });
      setList({ items: response.data || [], meta: response.meta || null, month: response.month || null, summary: response.summary || null, status: "succeeded", error: null });
    } catch (loadError) {
      setList((previous) => ({ ...previous, status: "failed", error: errorText(loadError, "Could not load payroll") }));
    }
  }, [filters.month, filters.year, filters.search, filters.paymentStatus, filters.page]);

  useEffect(() => {
    reload();
    setSelected(new Set());
  }, [reload]);

  // Salary is paid by the 15th of the next month: until the 15th, open last month's payroll first.
  const monthDefaulted = useRef(false);
  useEffect(() => {
    if (monthDefaulted.current) return;
    monthDefaulted.current = true;
    const now = currentIstMonth();
    const day = Number(String(todayIstKey()).slice(8, 10));
    if (day <= 15 && filters.month === now.month && filters.year === now.year) {
      dispatch(setPayrollMonth(now.month === 1 ? { month: 12, year: now.year - 1 } : { month: now.month - 1, year: now.year }));
    }
  }, [dispatch, filters.month, filters.year]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) dispatch(setPayrollSearch(searchInput.trim()));
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, filters.search, dispatch]);

  useEffect(() => {
    if (selectedEmployeeId) dispatch(fetchPayrollDetail(selectedEmployeeId));
  }, [selectedEmployeeId, filters.month, filters.year, dispatch]);

  const fetchAllRows = async () => {
    const rows = [];
    for (let page = 1; ; page += 1) {
      const response = await PayrollService.list({ month: filters.month, year: filters.year, search: filters.search || undefined, page, limit: EXPORT_PAGE_SIZE });
      rows.push(...(response.data || []));
      if (!response.meta?.hasNext) return { rows, month: response.month };
    }
  };

  const runExport = async (kind) => {
    setExporting(true);
    try {
      const { rows, month: monthState } = await fetchAllRows();
      if (kind === "excel") await exportPayrollExcel(rows, monthState);
      else await exportPayrollPdf(rows, monthState);
    } catch (exportError) {
      Swal.fire("Export failed", errorText(exportError, "Please try again"), "error");
    } finally {
      setExporting(false);
    }
  };

  const finalize = async (force = false) => {
    const confirm = await Swal.fire({
      title: `Finalize ${filters.month}/${filters.year}?`,
      text: "A snapshot is stored and later changes will not affect this month until it is re-opened.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E68736",
    });
    if (!confirm.isConfirmed) return;
    try {
      const response = await PayrollService.finalize({ month: filters.month, year: filters.year, force });
      Swal.fire("Finalized", `${response.data.employees} employee(s), version ${response.data.version}`, "success");
      reload();
    } catch (finalizeError) {
      const code = finalizeError.response?.data?.error?.code;
      if (code === "PAYROLL_PENDING_ITEMS") {
        const list = (finalizeError.response.data.error.details || []).map((detailItem) => `${detailItem.field}: ${detailItem.message}`).join("<br/>");
        const forceIt = await Swal.fire({
          title: "Pending days",
          html: `${list}<br/><br/>Pending days are not counted. Finalize anyway?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Finalize anyway",
          confirmButtonColor: "#ef4444",
        });
        if (forceIt.isConfirmed) {
          try {
            await PayrollService.finalize({ month: filters.month, year: filters.year, force: true });
            reload();
          } catch (forceError) {
            Swal.fire("Could not finalize", errorText(forceError, "Please try again"), "error");
          }
        }
        return;
      }
      Swal.fire("Could not finalize", errorText(finalizeError, "Please try again"), "error");
    }
  };

  const reopen = async () => {
    const { value: reason } = await Swal.fire({
      title: "Re-open this month?",
      text: "The month becomes live again. The reason is kept in the audit log.",
      input: "textarea",
      inputPlaceholder: "Reason (required)",
      showCancelButton: true,
      confirmButtonColor: "#E68736",
      inputValidator: (text) => ((text || "").trim().length < 5 ? "Give a reason (at least 5 characters)" : undefined),
    });
    if (!reason) return;
    try {
      await PayrollService.reopen({ month: filters.month, year: filters.year, reason: reason.trim() });
      reload();
    } catch (reopenError) {
      Swal.fire("Could not re-open", errorText(reopenError, "Please try again"), "error");
    }
  };

  const approveExtra = async (day) => {
    try {
      await PayrollService.setExtraApproval(day.attendanceId, true);
      dispatch(fetchPayrollDetail(selectedEmployeeId));
      reload();
    } catch (approveError) {
      Swal.fire("Could not approve", errorText(approveError, "Please try again"), "error");
    }
  };

  const isFinalized = month?.status === "FINALIZED";
  const period = { month: filters.month, year: filters.year, isLive: month?.isLive, isOver: month?.isOver };
  const pay = summary?.payment;
  const unpaidCount = pay ? pay.pendingCount ?? pay.dueCount + pay.partialCount + pay.upcomingCount : 0;
  const doneCount = pay ? pay.doneCount ?? pay.paidCount : 0;
  const dueOn = pay?.dueOn || salaryDueOn(filters.month, filters.year);
  const isPastDue = Boolean(dueOn) && todayIstKey() > dueOn;
  const overdueCount = pay?.overdueCount ?? (isPastDue ? unpaidCount : 0);
  const payableCount = pay ? unpaidCount + doneCount : 0;
  const paidPercent = payableCount ? Math.round((doneCount / payableCount) * 100) : 0;
  const canMarkPaid = can(HR_PERMISSIONS.PAYROLL_UPDATE);
  const monthName = `${MONTH_NAMES[filters.month - 1]} ${filters.year}`;

  const selectedRows = items.filter((row) => selected.has(row.employeeId) && canMarkDone(row));
  const selectedAmount = selectedRows.reduce((sum, row) => sum + (paymentOf(row).balance || 0), 0);
  const unpaidRowsOnPage = items.filter(canMarkDone);

  // Drawer: fill the payment from the list row if the detail came without one.
  const selectedRow = items.find((row) => row.employeeId === selectedEmployeeId);
  const drawerDetail = detail
    ? {
        ...detail,
        employeeId: detail.employeeId || selectedEmployeeId,
        month: detail.month || filters.month,
        year: detail.year || filters.year,
        hasSalaryProfile: detail.hasSalaryProfile ?? selectedRow?.hasSalaryProfile,
        payment: detail.payment || selectedRow?.payment,
      }
    : detail;

  const toggleRow = (row) =>
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(row.employeeId)) next.delete(row.employeeId);
      else next.add(row.employeeId);
      return next;
    });
  const toggleRows = (rows, isOn) =>
    setSelected((previous) => {
      const next = new Set(previous);
      rows.forEach((row) => (isOn ? next.add(row.employeeId) : next.delete(row.employeeId)));
      return next;
    });

  const afterPayment = () => {
    reload();
    if (selectedEmployeeId) dispatch(fetchPayrollDetail(selectedEmployeeId));
  };

  /** Row "Done" button: salary given -> confirm -> Done. */
  const markDone = async (row) => {
    const result = await confirmSalaryDone({ row, month: filters.month, year: filters.year });
    if (result) afterPayment();
  };

  /** "Mark selected as Done": full balance of every selected employee, one confirm. */
  const paySelected = async () => {
    if (!selectedRows.length) return;
    const list = selectedRows
      .map((row) => `<tr><td style="text-align:left;padding:4px 8px">${row.name}</td><td style="text-align:right;padding:4px 8px;font-family:monospace">${formatMoney(paymentOf(row).balance)}</td></tr>`)
      .join("");
    const confirm = await Swal.fire({
      title: `Mark salary as done for ${selectedRows.length} employee(s)?`,
      html: `<div style="max-height:220px;overflow:auto;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:10px"><table style="width:100%;font-size:13px">${list}</table></div>
        <div style="font-size:15px">Total: <b>${formatMoney(selectedAmount)}</b> · ${monthName}</div>
        ${isFinalized ? "" : `<div style="margin-top:8px;font-size:12px;color:#b45309">This month is not finalized - amounts can still change.</div>`}`,
      icon: "question",
      input: "text",
      inputPlaceholder: "Reference / UTR / batch no. (optional)",
      showCancelButton: true,
      confirmButtonText: "Yes, Done",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#059669",
      reverseButtons: true,
    });
    if (!confirm.isConfirmed) return;
    try {
      const response = await PayrollService.recordBulkPayments({
        month: filters.month,
        year: filters.year,
        employeeIds: selectedRows.map((row) => row.employeeId),
        reference: (confirm.value || "").trim(),
      });
      setSelected(new Set());
      Swal.fire({ icon: "success", title: "Salary Done ✓", text: `${response.data.paid} employee(s) marked as done · ${formatMoney(response.data.amount)}`, confirmButtonColor: "#059669" });
      afterPayment();
    } catch (payError) {
      Swal.fire("Could not mark as done", errorText(payError, "Please try again"), "error");
    }
  };

  return (
    <div className={selectedRows.length ? "pb-28" : ""}>
      <PageShell
        title="Payroll"
        description="Salary for every employee, calculated by the server from attendance, leave and holidays."
        actions={
          <>
            <MonthPicker value={{ month: filters.month, year: filters.year }} maxValue={currentIstMonth()} onChange={(value) => dispatch(setPayrollMonth(value))} />
            <Button variant="secondary" onClick={() => setSettingsOpen(true)}>
              <Settings2 size={14} /> Rules
            </Button>
          </>
        }
      >
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <SummaryTile label="Month" value={month ? <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${MONTH_STATUS_STYLE[month.status]}`}>{isFinalized ? `Finalized v${month.version}` : "Live"}</span> : "-"} hint={isFinalized && month.finalizedAt ? formatIstDateTime(month.finalizedAt) : undefined} />
          <SummaryTile label="Employees" value={summary?.employees ?? "-"} hint={summary?.withoutSalaryProfile ? `${summary.withoutSalaryProfile} without salary` : undefined} />
          <SummaryTile label="Deductions" value={summary ? formatMoney(summary.totalDeductions) : "-"} />
          <SummaryTile label="Extra pay" value={summary ? formatMoney(summary.totalExtraPay) : "-"} />
          <SummaryTile label="Net payable" value={summary ? formatMoney(summary.totalNetPayable) : "-"} strong hint={summary?.pendingDays ? `${summary.pendingDays} pending day(s)` : undefined} />
        </div>

        {/* ===== Salary payment status: who got salary, who did not ===== */}
        <section className="mb-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5" aria-label="Salary payment status">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Salary status · {monthName}</p>
              <p className="text-base font-bold text-slate-800">
                {pay ? (
                  <>
                    <span className="text-emerald-600">{doneCount} done</span>
                    <span className="text-slate-300"> / </span>
                    <span className="text-amber-600">{unpaidCount} pending</span>
                  </>
                ) : (
                  "-"
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {dueOn && (
                <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${isPastDue && unpaidCount ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"}`}>
                  <CalendarClock size={13} /> Pay by {formatDateKey(dueOn)}
                </span>
              )}
              <span className="text-xs font-semibold text-slate-500">{paidPercent}% done</span>
            </div>
          </div>
          {overdueCount > 0 && (
            <p className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
              <AlertTriangle size={14} className="shrink-0" />
              {overdueCount} salary(ies) not marked Done and the {formatDateKey(dueOn)} deadline has passed.
            </p>
          )}
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-amber-100" role="progressbar" aria-valuenow={paidPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${paidPercent}%` }} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PayTile
              icon={CheckCircle2}
              tone="emerald"
              label="Done ✓ (salary paid)"
              count={pay ? doneCount : undefined}
              amount={pay?.paidAmount}
              active={filters.paymentStatus === "paid"}
              onClick={() => dispatch(setPayrollPaymentFilter(filters.paymentStatus === "paid" ? "" : "paid"))}
            />
            <PayTile
              icon={Clock}
              tone="amber"
              label="Pending (salary to pay)"
              count={pay ? unpaidCount : undefined}
              amount={pay?.balanceAmount}
              hint={pay?.partialCount ? `${pay.partialCount} partly paid` : undefined}
              active={filters.paymentStatus === "unpaid"}
              onClick={() => dispatch(setPayrollPaymentFilter(filters.paymentStatus === "unpaid" ? "" : "unpaid"))}
            />
          </div>

          {canMarkPaid && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <Info size={14} className="mt-0.5 shrink-0 text-slate-400" />
              <span>
                {monthName} salary is paid by the <b>15th of the next month</b>. It stays <b className="text-amber-700">Pending</b> until you press{" "}
                <b className="text-emerald-700">Done</b>. After paying an employee, press{" "}
                <b className="text-emerald-700">Done</b> on their row. To mark several at once, tick the <b>checkboxes</b> (or <b>Select all pending</b>) and press{" "}
                <b className="text-emerald-700">Mark selected as Done</b> at the bottom. Marked by mistake? Open the employee and press <b>Undo</b>.
              </span>
            </p>
          )}
        </section>

        <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter by payment">
          {[
            { key: "", label: "All employees", count: summary?.employees },
            { key: "unpaid", label: "Pending", count: pay ? unpaidCount : undefined },
            { key: "paid", label: "Done", count: pay ? doneCount : undefined },
          ].map((item) => {
            const active = (filters.paymentStatus || "") === item.key;
            return (
              <button
                key={item.key || "all"}
                type="button"
                onClick={() => dispatch(setPayrollPaymentFilter(item.key))}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${active ? "bg-[#E68736] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {item.label} {item.count !== undefined && <span className="opacity-70">{item.count}</span>}
              </button>
            );
          })}
        </div>

        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="search"
              aria-label="Search employees"
              placeholder="Search name or e-mail"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {canMarkPaid && unpaidRowsOnPage.length > 0 && (
              <Button variant="secondary" onClick={() => toggleRows(unpaidRowsOnPage, true)}>
                <ListChecks size={14} /> Select all pending ({unpaidRowsOnPage.length})
              </Button>
            )}
            <Button variant="secondary" disabled={exporting || !items.length} onClick={() => runExport("excel")}>
              <FileSpreadsheet size={14} /> Excel
            </Button>
            <Button variant="secondary" disabled={exporting || !items.length} onClick={() => runExport("pdf")}>
              <FileDown size={14} /> PDF
            </Button>
            {can(HR_PERMISSIONS.PAYROLL_FINALIZE) &&
              (isFinalized ? (
                <Button variant="secondary" onClick={reopen}>
                  <LockOpen size={14} /> Re-open
                </Button>
              ) : (
                <Button onClick={() => finalize(false)}>
                  <Lock size={14} /> Finalize month
                </Button>
              ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          {status === "failed" ? (
            <ErrorBlock message={error} onRetry={reload} />
          ) : (
            <PayrollTable
              rows={items}
              loading={status === "loading" && !items.length}
              onSelect={(row) => dispatch(openPayrollDetail(row.employeeId))}
              onDone={canMarkPaid ? markDone : undefined}
              selected={selected}
              onToggle={canMarkPaid ? toggleRow : undefined}
              onToggleAll={toggleRows}
            />
          )}
          {meta && <Pagination totalItems={meta.total} itemsPerPage={meta.limit} currentPage={filters.page} setCurrentPage={(page) => dispatch(setPayrollPage(typeof page === "function" ? page(filters.page) : page))} />}
        </div>
      </PageShell>

      {/* Bulk bar: appears when employees are selected */}
      {selectedRows.length > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[900] flex justify-center px-3">
          <div className="pointer-events-auto flex w-full max-w-2xl flex-wrap items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-2xl">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{selectedRows.length} employee(s) selected</p>
              <p className="font-mono text-xs text-slate-300">{formatMoney(selectedAmount)} to pay</p>
            </div>
            <button type="button" onClick={() => setSelected(new Set())} className="rounded-xl px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white">
              Clear
            </button>
            <button
              type="button"
              onClick={paySelected}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-600"
            >
              <CheckCircle2 size={16} /> Mark selected as Done
            </button>
          </div>
        </div>
      )}

      <PayrollDetailDrawer
        open={Boolean(selectedEmployeeId)}
        employeeId={selectedEmployeeId}
        detail={drawerDetail}
        loading={detailStatus === "loading"}
        error={detailStatus === "failed" ? detailError : null}
        onRetry={() => dispatch(fetchPayrollDetail(selectedEmployeeId))}
        onClose={() => dispatch(closePayrollDetail())}
        canEditSalary={can(HR_PERMISSIONS.PAYROLL_UPDATE)}
        onSalarySaved={() => {
          reload();
          dispatch(fetchPayrollDetail(selectedEmployeeId));
        }}
        onApproveExtra={can(HR_PERMISSIONS.PAYROLL_UPDATE) ? approveExtra : undefined}
        canPay={canMarkPaid}
        onPay={setPayRow}
        onPaymentChanged={afterPayment}
      />
      <PayDialog open={Boolean(payRow)} row={payRow} period={period} onClose={() => setPayRow(null)} onPaid={afterPayment} />
      <PayrollSettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} canEdit={can(HR_PERMISSIONS.PAYROLL_SETTINGS_UPDATE)} onSaved={reload} />
    </div>
  );
}

const SummaryTile = ({ label, value, hint, strong }) => (
  <div className={`rounded-2xl border px-4 py-3 ${strong ? "border-slate-900 bg-slate-900 text-white" : "border-slate-100 bg-white"}`}>
    <p className={`text-[11px] font-bold uppercase tracking-wider ${strong ? "text-slate-400" : "text-slate-400"}`}>{label}</p>
    <div className={`mt-1 font-mono text-lg font-bold ${strong ? "text-white" : "text-slate-800"}`}>{value}</div>
    {hint && <p className={`text-[11px] ${strong ? "text-slate-300" : "text-slate-400"}`}>{hint}</p>}
  </div>
);

const PAY_TONES = {
  emerald: { box: "border-emerald-200 bg-emerald-50", icon: "bg-emerald-500 text-white", text: "text-emerald-800" },
  rose: { box: "border-rose-200 bg-rose-50", icon: "bg-rose-500 text-white", text: "text-rose-800" },
  amber: { box: "border-amber-200 bg-amber-50", icon: "bg-amber-400 text-white", text: "text-amber-800" },
  sky: { box: "border-sky-200 bg-sky-50", icon: "bg-sky-500 text-white", text: "text-sky-800" },
};

const PayTile = ({ icon: Icon, tone, label, count, amount, hint, active, onClick }) => {
  const style = PAY_TONES[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-shadow hover:shadow-md ${style.box} ${active ? "ring-2 ring-[#E68736]" : ""}`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.icon}`}>
        <Icon size={18} />
      </span>
      <span className="min-w-0">
        <span className={`block text-[11px] font-bold uppercase tracking-wider ${style.text}`}>{label}</span>
        <span className="block font-mono text-lg font-bold text-slate-900">
          {count ?? "-"} <span className="font-sans text-xs font-semibold text-slate-500">employee(s)</span>
        </span>
        <span className="block font-mono text-xs font-bold text-slate-600">
          {amount !== undefined ? formatMoney(amount) : "-"}
          {hint && <span className="ml-2 font-sans font-semibold text-slate-400">{hint}</span>}
        </span>
      </span>
    </button>
  );
};
