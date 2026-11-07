import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { CalendarCheck, ClipboardList, Globe, ListChecks, Search, Timer, X } from "lucide-react";
import AttendanceTable from "../../ui/AttendanceTable";
import RequestTable from "../../ui/RequestTable";
import Pagination from "../../ui/Pagination";
import { ErrorBlock } from "../../ui/StateBlock";
import { AdminAttendanceService } from "../../../backend/ApiService";
import { validateDecision } from "../../../validators/LeaveValidator";
import { HR_PERMISSIONS } from "../../../constants/PayrollConstants";
import { DEBOUNCE_MS } from "../../../constants/AppConfig";

const PAGE_SIZE = 15;
const TABS = [
  { key: "attendance", label: "Attendance", icon: ListChecks },
  { key: "leaves", label: "Leaves", icon: CalendarCheck },
  { key: "punchout", label: "Punch-out", icon: Timer },
];
const STATUS_FILTERS = {
  attendance: [
    { value: "", label: "All" },
    { value: "MISSING_PUNCH_OUT", label: "Missing punch-out" },
    { value: "HALF_DAY", label: "Half day" },
    { value: "ABSENT", label: "Absent" },
  ],
  leaves: [
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
    { value: "", label: "All" },
  ],
  punchout: [
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
    { value: "", label: "All" },
  ],
};
const LOADERS = {
  attendance: AdminAttendanceService.getAllEmployeeAttendances,
  leaves: AdminAttendanceService.getPendingLeaves,
  punchout: AdminAttendanceService.getPendingPunchouts,
};
const errorText = (error, fallback) => error?.response?.data?.message || fallback;

/** Admin: attendance log, leave requests and punch-out corrections (server-side paging and search). */
const AdminAttendanceLogs = () => {
  const { user } = useSelector((state) => state.auth);
  const canOverridePaid = [0, 1].includes(Number(user?.role)) || user?.permissions?.includes(HR_PERMISSIONS.PAYROLL_UPDATE);
  const [activeTab, setActiveTab] = useState("attendance");
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ items: [], meta: null, loading: true, error: null });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setStatus(STATUS_FILTERS[activeTab][0].value);
    setPage(1);
  }, [activeTab]);

  const load = useCallback(async () => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const params = { page, limit: PAGE_SIZE, ...(status ? { status } : {}), ...(search ? { search } : {}) };
      const response = await LOADERS[activeTab](params);
      setState({ items: response.data || [], meta: response.meta, loading: false, error: null });
    } catch (error) {
      setState({ items: [], meta: null, loading: false, error: errorText(error, "Could not load the list") });
    }
  }, [activeTab, status, search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAction = async (item, action, category) => {
    const isApprove = action === "APPROVED";
    const { value: note, isConfirmed } = await Swal.fire({
      title: `${isApprove ? "Approve" : "Reject"} this ${category === "leave" ? "leave" : "punch-out correction"}?`,
      input: "textarea",
      inputLabel: isApprove ? "Note (optional)" : "Reason for rejecting",
      inputPlaceholder: isApprove ? "Optional note for the employee" : "Required",
      showCancelButton: true,
      confirmButtonColor: isApprove ? "#10b981" : "#ef4444",
      inputValidator: (value) => {
        try {
          validateDecision({ action, note: value });
          return undefined;
        } catch (validation) {
          return Object.values(validation.validationErrors)[0];
        }
      },
    });
    if (!isConfirmed) return;
    const decision = validateDecision({ action, note });
    try {
      const response =
        category === "leave"
          ? await AdminAttendanceService.processLeave(item.approvalId, decision)
          : await AdminAttendanceService.processPunchout(item.approvalId, decision);
      const data = response.data || {};
      const detail = category === "leave" && isApprove ? `${data.paidDays} paid, ${data.unpaidDays} unpaid day(s)` : `Request ${action.toLowerCase()}`;
      Swal.fire("Done", detail, "success");
      load();
    } catch (error) {
      Swal.fire("Could not save", errorText(error, "Action failed"), "error");
    }
  };

  const handleOverridePaid = async (leave) => {
    const { value, isConfirmed } = await Swal.fire({
      title: "Override paid / unpaid",
      html: `<p style="font-size:13px">Server allocation: ${leave.paidDays} paid, ${leave.unpaidDays} unpaid.</p>`,
      input: "select",
      inputOptions: { true: "Make every day paid", false: "Make every day unpaid" },
      showCancelButton: true,
      confirmButtonColor: "#E68736",
    });
    if (!isConfirmed) return;
    const { value: note } = await Swal.fire({
      title: "Reason (kept in the audit log)",
      input: "text",
      showCancelButton: true,
      inputValidator: (text) => ((text || "").trim().length < 3 ? "Give a short reason" : undefined),
    });
    if (!note) return;
    try {
      await AdminAttendanceService.overrideLeavePaid(leave.approvalId, { isPaid: value === "true", note: note.trim() });
      Swal.fire("Updated", "The paid / unpaid split was changed.", "success");
      load();
    } catch (error) {
      Swal.fire("Could not update", errorText(error, "Please try again"), "error");
    }
  };

  const total = state.meta?.total ?? state.items.length;

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <ClipboardList size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Attendance & Leaves</h1>
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <Globe size={12} className="text-orange-500" /> All times in IST
              </p>
            </div>
          </div>

          <div className="inline-flex w-full rounded-xl bg-slate-100 p-1 sm:w-auto" role="tablist">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeTab === key}
                onClick={() => setActiveTab(key)}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors sm:flex-none ${
                  activeTab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Main card */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by employee name or e-mail..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-11 pr-10 text-sm outline-none transition-all focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />
              {searchInput && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Status filter">
              {STATUS_FILTERS[activeTab].map((option) => (
                <button
                  key={option.value || "all"}
                  type="button"
                  onClick={() => {
                    setStatus(option.value);
                    setPage(1);
                  }}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                    status === option.value ? "bg-orange-500 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {!state.loading && !state.error && (
            <p className="px-5 pt-4 text-[11px] font-semibold text-slate-400">
              {total} {total === 1 ? "record" : "records"}
              {search && <> for "<span className="text-slate-600">{search}</span>"</>}
            </p>
          )}

          <div className="p-2 sm:p-4">
            {state.error ? (
              <ErrorBlock message={state.error} onRetry={load} />
            ) : activeTab === "attendance" ? (
              <AttendanceTable data={state.items} loading={state.loading} />
            ) : (
              <RequestTable
                data={state.items}
                loading={state.loading}
                activeTab={activeTab}
                onAction={handleAction}
                onOverridePaid={canOverridePaid ? handleOverridePaid : undefined}
              />
            )}
          </div>

          {state.meta && <Pagination totalItems={state.meta.total} itemsPerPage={state.meta.limit} currentPage={page} setCurrentPage={setPage} />}
        </div>
      </div>
    </div>
  );
};

export default AdminAttendanceLogs;