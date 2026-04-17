/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AttendanceService } from '../../../backend/ApiService'; 

// Import Sub-components
import DashboardHero from './DashboardHero';
import StatGroup from './StatCards';
import AttendanceCalendar from './AttendanceCalendar';
import ActivitySidebar from './ActivitySidebar';

const ProfessionalDashboard = () => {
  const [attendanceData, setAttendanceData] = useState([]); 
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date()); 
  
  const navigate = useNavigate();

  // --- Configuration & Helpers ---
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const loggedInUser = JSON.parse(localStorage.getItem("user")) || {
    firstName: "Employee", lastName: "", role: "Staff Member", createdAt: new Date().toISOString() 
  };

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); 

  // --- Derived Stats ---
  const stats = {
    presentDays: attendanceData.filter(r => r.status?.includes('PRESENT')).length,
    totalHoursWorked: attendanceData.reduce((acc, r) => acc + (r.totalWorkedTime?.hours || 0), 0),
    lateDays: attendanceData.filter(r => r.status?.includes('LATE')).length,
    leaveDays: attendanceData.reduce((acc, r) => {
      if (r.leaveType) {
        return acc + (r.leaveDuration === "HALF_DAY" ? 0.5 : 1);
      }
      return acc;
    }, 0),
  };

  // --- Data Fetching ---
// --- Data Fetching ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // We fetch both the summary stats AND the daily attendance records
        const [attendanceRes, holidayRes, statsRes] = await Promise.all([
          AttendanceService.getMyAttendance(), // Should return array of daily records
          AttendanceService.getHolidays(),
          AttendanceService.getMyDashboard()   // The API you just provided
        ]);

        if (attendanceRes.success) setAttendanceData(attendanceRes.data);
        if (holidayRes.success) setHolidays(holidayRes.data);
        
        // Use the stats from your new API if you prefer it over local calculation
        if (statsRes.success) {
           // Optional: Update local stats state with statsRes.data
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [currentMonth, currentYear]);

  // --- Calendar Logic ---
  const getDayDetails = (day) => {
    const dateObj = new Date(currentYear, currentMonth, day);
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Check for Public Holidays
    const publicHoliday = holidays.find(h => h.date.split('T')[0] === dateStr);
    if (publicHoliday) {
      return { 
        label: publicHoliday.title, 
        style: 'bg-rose-50 text-rose-600 border-rose-200 ring-2 ring-rose-100 shadow-sm', 
        dot: 'bg-rose-500'
      };
    }

    // 2. Check Daily Attendance Records
    const record = attendanceData.find(r => r.date === dateStr);
    if (record) {
      const statuses = Array.isArray(record.status) ? record.status : [record.status];
      
      if (statuses.includes('LATE')) {
        return { label: 'LATE', style: 'bg-purple-50 text-purple-600 border-purple-200 ring-2 ring-purple-100', dot: 'bg-purple-500' };
      }
      if (record.leaveType) {
        return { label: record.leaveType, style: 'bg-orange-50 text-orange-600 border-orange-200', dot: 'bg-orange-500' };
      }
      if (statuses.includes('PRESENT')) {
        return { label: 'PRESENT', style: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500' };
      }
      if (statuses.includes('ABSENT')) {
        return { label: 'ABSENT', style: 'bg-rose-50 text-rose-600 border-rose-200', dot: 'bg-rose-500' };
      }
    }
    
    // 3. Logic for Empty/Future/Current dates
    const isSunday = dateObj.getDay() === 0;
    const isToday = dateObj.getTime() === today.getTime();
    const isPast = dateObj < today;

    // Only show "ABSENT" if it's a past workday and we explicitly have no record
    // If it's today or a future date, show "---"
    if (isPast && !isSunday) {
        // If your backend doesn't return data for dates the user didn't work, 
        // they appear as Absent. If you want them blank, change 'ABSENT' to '---'
        return { label: '---', style: 'bg-slate-50/50 text-slate-300 border-slate-100', dot: 'transparent' };
    }

    // Default style for Today and Future dates
    return { 
      label: isToday ? 'TODAY' : '---', 
      style: isToday 
        ? 'border-blue-400 ring-2 ring-blue-100 bg-white' 
        : 'bg-slate-50/30 text-slate-200 border-transparent', 
      dot: 'transparent' 
    };
  };

  const handleMonthChange = (offset) => {
    const nextDate = new Date(currentYear, currentMonth + offset, 1);
    setCurrentDate(nextDate);
  };

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <DashboardHero user={loggedInUser} onPunchClick={() => navigate('/workforce/attendance/portal')} />

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <StatGroup stats={stats} />

            <AttendanceCalendar 
              currentDate={currentDate}
              onMonthChange={handleMonthChange}
              canGoBack={true}
              getDayDetails={getDayDetails}
              monthNames={monthNames}
              dayNames={dayNames}
              daysInMonth={daysInMonth}
              firstDayOfMonth={firstDayOfMonth}
            />
          </div>

          <div className="lg:col-span-4 h-full">
            <ActivitySidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;