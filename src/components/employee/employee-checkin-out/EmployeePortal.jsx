/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Swal from "sweetalert2";
import { AttendanceService } from "../../../backend/ApiService";
import { PunchCard } from "./PunchCard";
import { LeaveForm } from "./LeaveApplicationForm";
import { HistoryTable } from "./AttendanceTable";

export default function EmployeePortal() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("attendance");
  const [status, setStatus] = useState("OUT"); // OUT, IN, FORGOT, HOLIDAY
  const [sessionTime, setSessionTime] = useState("00:00:00");
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [holidays, setHolidays] = useState([]);
  
  // Local override to show "PUNCH IN" immediately after submitting a fix
  const [hasJustSubmittedFix, setHasJustSubmittedFix] = useState(false);

  const [leaveFormData, setLeaveFormData] = useState({
    leaveType: "SICK", 
    leaveDuration: "FULL_DAY", 
    fromDate: "", 
    toDate: "", 
    leaveReason: ""
  });

  const todayStr = useMemo(() => new Date().toLocaleDateString('en-CA'), []);

  const updateSessionTimer = useCallback((punchInTime) => {
    if (!punchInTime) return;
    const start = new Date(punchInTime.replace('Z', '')).getTime();
    const now = new Date().getTime();
    const diff = Math.max(0, now - start);
    const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    setSessionTime(`${h}:${m}:${s}`);
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch both Attendance and Holidays simultaneously
      const [attendanceRes, holidayRes] = await Promise.all([
        AttendanceService.getMyAttendance(),
        AttendanceService.getHolidays()
      ]);

      if (holidayRes && holidayRes.success) {
        setHolidays(holidayRes.data || []);
      }

      if (attendanceRes && attendanceRes.success) {
        const allData = attendanceRes.data || [];
        
        // Filter history for the table
        setAttendanceHistory(allData.filter(item => 
          item.dayType && !item.dayType.includes("LEAVE") && !item.dayType.includes("HOLIDAY")
        ));
        setLeaveHistory(allData.filter(item => 
          (item.dayType && item.dayType.includes("LEAVE")) || item.leaveType
        ));

        const todayRecord = allData.find(item => item.date && item.date.startsWith(todayStr));
        const isHolidayToday = (holidayRes.data || []).some(h => h.date && h.date.startsWith(todayStr));

        if (todayRecord && todayRecord.punchIn && !todayRecord.punchOut) {
          // 1. User is currently Punched In
          setStatus("IN");
          updateSessionTimer(todayRecord.punchIn);
        } else if (isHolidayToday) {
          // 2. Today is a Holiday - Block Punching
          setStatus("HOLIDAY");
          setSessionTime("00:00:00");
        } else {
          // 3. Check for unresolved past days (missing punch outs)
          const hasUnresolvedForgot = allData.some(item => {
            const isPastDay = item.date.slice(0, 10) < todayStr;
            const missingPunchOut = item.punchIn && !item.punchOut;
            const isPending = item.punchOutRequestStatus === "PENDING" || 
                              (Array.isArray(item.status) ? item.status.includes("PENDING") : item.status === "PENDING");
            
            return isPastDay && missingPunchOut && !isPending;
          });

          // Switch to OUT (PUNCH IN) if fix is submitted or no issues found
          setStatus((hasUnresolvedForgot && !hasJustSubmittedFix) ? "FORGOT" : "OUT");
          setSessionTime("00:00:00");
        }
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setStatus("OUT");
    } finally {
      setIsLoading(false);
    }
  }, [todayStr, updateSessionTimer, hasJustSubmittedFix]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Real-time clock and session timer
  useEffect(() => {
    const clock = setInterval(() => {
      setCurrentTime(new Date());
      if (status === "IN") {
        const todayRecord = attendanceHistory.find(item => item.date.startsWith(todayStr));
        if (todayRecord) updateSessionTimer(todayRecord.punchIn);
      }
    }, 1000);
    return () => clearInterval(clock);
  }, [status, attendanceHistory, todayStr, updateSessionTimer]);

  const handlePunchAction = async () => {
    if (status === "HOLIDAY") {
      Swal.fire("Holiday", "Punching is disabled on holidays.", "info");
      return;
    }

    try {
      setIsLoading(true);
      if (status === "OUT") {
        await AttendanceService.punchIn();
        setHasJustSubmittedFix(false); // Reset override on new punch
        Swal.fire("Punched In", "Have a productive day!", "success");
      } 
      else if (status === "IN") {
        await AttendanceService.punchOut();
        Swal.fire("Punched Out", "Great work today!", "success");
      } 
      else if (status === "FORGOT") {
        const { value: formValues } = await Swal.fire({
          title: "Resolve Missing Punch Out",
          html:
            `<div class="text-left">` +
            `<label class="block text-sm font-bold mb-1">Actual Punch-out Time:</label>` +
            `<input id="swal-time" type="datetime-local" class="swal2-input" style="width: 85%;">` +
            `<label class="block text-sm font-bold mt-4 mb-1">Reason:</label>` +
            `<input id="swal-reason" type="text" placeholder="e.g., Forgot to punch out" class="swal2-input" style="width: 85%;">` +
            `</div>`,
          focusConfirm: false,
          showCancelButton: true,
          preConfirm: () => {
            const time = document.getElementById('swal-time').value;
            const reason = document.getElementById('swal-reason').value;
            if (!time || !reason) {
              Swal.showValidationMessage('Both time and reason are required');
            }
            return { requestedPunchOut: time, reason: reason };
          }
        });

        if (formValues) {
          await AttendanceService.submitPunchOutRequest({
            requestedPunchOut: new Date(formValues.requestedPunchOut).toISOString(),
            reason: formValues.reason
          });
          
          // Force PUNCH IN button to show immediately
          setHasJustSubmittedFix(true);
          setStatus("OUT");
          
          Swal.fire("Request Sent", "Your request is pending. You can now punch in.", "success");
        } else {
          setIsLoading(false);
          return;
        }
      }
      fetchData();
    } catch (err) { 
      const serverMsg = err.response?.data?.message;
      if (serverMsg === "Already sent for admin approval") {
        setHasJustSubmittedFix(true);
        setStatus("OUT");
        Swal.fire("Pending", "Request already exists. You can now punch in.", "info");
      } else {
        Swal.fire("Error", serverMsg || "Action failed", "error"); 
      }
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await AttendanceService.submitLeaveRequest(leaveFormData);
      Swal.fire("Success", "Leave application submitted", "success");
      setLeaveFormData({ leaveType: "SICK", leaveDuration: "FULL_DAY", fromDate: "", toDate: "", leaveReason: "" });
      fetchData();
    } catch (err) { 
      Swal.fire("Error", err.response?.data?.message || "Failed", "error"); 
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 md:py-20 font-sans bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Employee Workspace</h1>
        
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <PunchCard 
              currentTime={currentTime} 
              status={status} 
              sessionTime={sessionTime} 
              isLoading={isLoading} 
              onPunch={handlePunchAction} 
            />
          </div>
          <div className="lg:col-span-8">
            <LeaveForm 
              formData={leaveFormData} 
              setFormData={setLeaveFormData} 
              onSubmit={handleLeaveSubmit} 
              isLoading={isLoading} 
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <HistoryTable 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            attendanceHistory={attendanceHistory} 
            leaveHistory={leaveHistory} 
            formatIST={(d) => d ? new Date(d.replace('Z', '')).toLocaleTimeString("en-IN", { 
              hour: "2-digit", 
              minute: "2-digit", 
              hour12: true 
            }) : "--:--"} 
          />
        </div>
      </div>
    </div>
  );
}