import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { AlertTriangle, CalendarClock, History, ListChecks, Wrench } from "lucide-react";
import { AttendanceService } from "../../../backend/ApiService";
import { fetchMyCalendar, fetchTodayStatus } from "../../../store/slices/AttendanceSlice";
import { EMPTY_LEAVE_FORM } from "../../../constants/LeaveConstants";
import { validateLeaveForm } from "../../../validators/LeaveValidator";
import { formatDateKey, formatIstTime } from "../../../utils/IstTime";
import { socket } from "../../../utils/socket";
import { PunchCard } from "./PunchCard";
import { LeaveForm } from "./LeaveApplicationForm";
import { HistoryTable } from "./AttendanceTable";
import LeaveTable from "./LeaveTable";
import PunchOutCorrectionDialog from "./PunchOutCorrectionDialog";
import { ErrorBlock, LoadingBlock } from "../../ui/StateBlock";

const PAGE_SIZE = 10;
const REFRESH_TYPES = new Set(["ATTENDANCE_LOG_UPDATED", "LEAVE_APPROVED", "LEAVE_REJECTED", "MISSING_PUNCH_OUT", "HOLIDAY_UPDATED"]);

const errorText = (error, fallback) => error?.response?.data?.message || fallback;

export default function EmployeePortal() {
  const dispatch = useDispatch();
  const { today, todayStatus, todayError } = useSelector((state) => state.attendance);
  const [nowMs, setNowMs] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState("attendance");
  const [correctionDay, setCorrectionDay] = useState(null);

  const [leaveForm, setLeaveForm] = useState({ ...EMPTY_LEAVE_FORM });
  const [leaveErrors, setLeaveErrors] = useState({});
  const [balance, setBalance] = useState(null);

  const [lists, setLists] = useState({
    attendance: { items: [], meta: null, page: 1, loading: true, error: null },
    leaves: { items: [], meta: null, page: 1, loading: true, error: null },
  });

  /* ---------- clock: browser time corrected by the server's clock ---------- */
  const skewMs = useMemo(() => (today ? new Date(today.serverTime).getTime() - today.receivedAt : 0), [today]);
  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now() + skewMs), 1000);
    return () => clearInterval(timer);
  }, [skewMs]);

  /* ---------- loaders ---------- */
  const loadList = useCallback(async (key, page) => {
    setLists((previous) => ({ ...previous, [key]: { ...previous[key], page, loading: true, error: null } }));
    try {
      const response =
        key === "attendance"
          ? await AttendanceService.getMyAttendance({ page, limit: PAGE_SIZE })
          : await AttendanceService.getMyLeaveRequests({ page, limit: PAGE_SIZE });
      setLists((previous) => ({ ...previous, [key]: { items: response.data || [], meta: response.meta, page, loading: false, error: null } }));
    } catch (error) {
      setLists((previous) => ({ ...previous, [key]: { ...previous[key], loading: false, error: errorText(error, "Could not load the list") } }));
    }
  }, []);

  const loadBalance = useCallback(async () => {
    try {
      const response = await AttendanceService.getLeaveBalance();
      setBalance(response.data);
    } catch {
      setBalance(null); // the form still works without the balance strip
    }
  }, []);

  const refreshAll = useCallback(() => {
    dispatch(fetchTodayStatus());
    loadList("attendance", 1);
    loadList("leaves", 1);
    loadBalance();
  }, [dispatch, loadList, loadBalance]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    const onNotification = (notification) => {
      if (REFRESH_TYPES.has(notification?.type)) refreshAll();
    };
    socket.on("newNotification", onNotification);
    return () => socket.off("newNotification", onNotification);
  }, [refreshAll]);

  const correctableDates = useMemo(
    () => new Set((today?.missingPunchOuts || []).filter((day) => day.canRequestCorrection).map((day) => day.date)),
    [today]
  );

  /* ---------- actions ---------- */
  const afterChange = () => {
    dispatch(fetchTodayStatus());
    dispatch(fetchMyCalendar(today ? { month: Number(today.date.slice(5, 7)), year: Number(today.date.slice(0, 4)) } : {}));
    loadList("attendance", 1);
  };

  const handlePunchIn = async () => {
    setBusy(true);
    try {
      await AttendanceService.punchIn();
      Swal.fire("Punched in", "Have a productive day!", "success");
      afterChange();
    } catch (error) {
      Swal.fire("Could not punch in", errorText(error, "Please try again"), "error");
    } finally {
      setBusy(false);
    }
  };

  const handlePunchOut = async () => {
    const confirm = await Swal.fire({
      title: "Punch out now?",
      text: "Your punch-out time is recorded by the server.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#E68736",
    });
    if (!confirm.isConfirmed) return;
    setBusy(true);
    try {
      await AttendanceService.punchOut();
      Swal.fire("Punched out", "Great work today!", "success");
      afterChange();
    } catch (error) {
      Swal.fire("Could not punch out", errorText(error, "Please try again"), "error");
    } finally {
      setBusy(false);
    }
  };

  const handleLeaveSubmit = async (event) => {
    event.preventDefault();
    let payload;
    try {
      payload = validateLeaveForm(leaveForm);
      setLeaveErrors({});
    } catch (validation) {
      setLeaveErrors(validation.validationErrors || {});
      return;
    }
    setBusy(true);
    try {
      const response = await AttendanceService.submitLeaveRequest(payload);
      Swal.fire("Leave requested", `${response.data?.totalDays ?? ""} day(s) sent for approval`, "success");
      setLeaveForm({ ...EMPTY_LEAVE_FORM });
      loadList("leaves", 1);
      loadBalance();
      setActiveTab("leaves");
    } catch (error) {
      const details = error.response?.data?.error?.details;
      if (details?.length) setLeaveErrors(Object.fromEntries(details.map((detail) => [detail.field, detail.message])));
      Swal.fire("Could not apply", errorText(error, "Please check the form"), "error");
    } finally {
      setBusy(false);
    }
  };

  const handleCancelLeave = async (leave) => {
    const confirm = await Swal.fire({ title: "Cancel this leave request?", icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444" });
    if (!confirm.isConfirmed) return;
    try {
      await AttendanceService.cancelLeaveRequest(leave.approvalId);
      Swal.fire("Cancelled", "Your leave request was cancelled.", "success");
      loadList("leaves", lists.leaves.page);
      loadBalance();
    } catch (error) {
      Swal.fire("Could not cancel", errorText(error, "Please try again"), "error");
    }
  };

  const openCorrection = (day) => setCorrectionDay({ date: day.date, punchIn: day.punchIn });

  const tabs = [
    { key: "attendance", label: "Attendance", icon: ListChecks, count: lists.attendance.meta?.total },
    { key: "leaves", label: "Leave history", icon: History, count: lists.leaves.meta?.total },
  ];

  /* ---------- render ---------- */
  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <CalendarClock size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">My Attendance</h1>
            <p className="text-xs text-slate-400">Punch in / out, apply for leave and see your history</p>
          </div>
        </div>

        {/* Missing punch-out */}
        {today?.missingPunchOuts?.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50">
            <div className="flex items-center gap-2 border-b border-amber-200/70 px-5 py-3 text-sm font-bold text-amber-800">
              <AlertTriangle size={16} /> Missing punch-out
            </div>
            <ul className="divide-y divide-amber-200/60">
              {today.missingPunchOuts.map((day) => (
                <li key={day.date} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm text-amber-900">
                  <span>
                    <span className="font-bold">{formatDateKey(day.date)}</span>
                    <span className="text-amber-700"> · in at {formatIstTime(day.punchIn)} IST</span>
                  </span>
                  {day.pendingRequest ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">Correction requested · waiting for approval</span>
                  ) : day.canRequestCorrection ? (
                    <button
                      type="button"
                      onClick={() => openCorrection(day)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-amber-950 shadow-sm transition-colors hover:bg-amber-500"
                    >
                      <Wrench size={13} /> Request punch-out correction
                    </button>
                  ) : (
                    <span className="text-xs text-amber-700">Older than {today.rules?.punchOutCorrectionWindowDays} days · contact HR</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Punch + Leave */}
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            {todayStatus === "loading" && !today ? (
              <div className="rounded-2xl border border-slate-100 bg-white shadow-sm"><LoadingBlock text="Loading today" /></div>
            ) : todayError && !today ? (
              <div className="rounded-2xl border border-slate-100 bg-white shadow-sm"><ErrorBlock message={todayError} onRetry={() => dispatch(fetchTodayStatus())} /></div>
            ) : (
              <PunchCard today={today} nowMs={nowMs} isBusy={busy} onPunchIn={handlePunchIn} onPunchOut={handlePunchOut} />
            )}
          </div>
          <div className="lg:col-span-3">
            <LeaveForm formData={leaveForm} setFormData={setLeaveForm} onSubmit={handleLeaveSubmit} isLoading={busy} errors={leaveErrors} balance={balance} />
          </div>
        </div>

        {/* History */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <h2 className="text-base font-bold text-slate-800">History</h2>
            <div className="inline-flex rounded-2xl bg-slate-100 p-1" role="tablist">
              {tabs.map(({ key, label, icon: Icon, count }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === key}
                  onClick={() => setActiveTab(key)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    activeTab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                  {count > 0 && (
                    <span className={`rounded-full px-1.5 text-[11px] ${activeTab === key ? "bg-orange-100 text-orange-700" : "bg-slate-200 text-slate-600"}`}>{count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="p-2 sm:p-4">
            {activeTab === "attendance" ? (
              <HistoryTable
                data={lists.attendance.items}
                meta={lists.attendance.meta}
                loading={lists.attendance.loading}
                error={lists.attendance.error}
                onRetry={() => loadList("attendance", lists.attendance.page)}
                page={lists.attendance.page}
                setPage={(page) => loadList("attendance", typeof page === "function" ? page(lists.attendance.page) : page)}
                correctableDates={correctableDates}
                onRequestCorrection={openCorrection}
              />
            ) : (
              <LeaveTable
                data={lists.leaves.items}
                meta={lists.leaves.meta}
                loading={lists.leaves.loading}
                error={lists.leaves.error}
                onRetry={() => loadList("leaves", lists.leaves.page)}
                page={lists.leaves.page}
                setPage={(page) => loadList("leaves", typeof page === "function" ? page(lists.leaves.page) : page)}
                onCancel={handleCancelLeave}
              />
            )}
          </div>
        </div>
      </div>

      <PunchOutCorrectionDialog
        day={correctionDay}
        onClose={() => setCorrectionDay(null)}
        onError={(message) => Swal.fire("Could not send", message, "error")}
        onSubmitted={() => {
          setCorrectionDay(null);
          Swal.fire("Request sent", "An admin will review your punch-out correction.", "success");
          afterChange();
        }}
      />
    </div>
  );
}