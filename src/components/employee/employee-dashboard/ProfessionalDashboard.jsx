/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AttendanceService } from '../../../backend/ApiService';
import DashboardHero from './DashboardHero';
import StatGroup from './StatCards';
import AttendanceCalendar from './AttendanceCalendar';
import ActivitySidebar from './ActivitySidebar';

const statusMap = {
  PRESENT: { hex: '#10b981', dot: 'bg-emerald-500', tailwind: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  ABSENT: { hex: '#ef4444', dot: 'bg-red-500', tailwind: 'bg-red-50 text-red-500 border-red-200' },
  HALF_DAY: { hex: '#f59e0b', dot: 'bg-amber-500', tailwind: 'bg-amber-50 text-amber-600 border-amber-200' },
  LATE: { hex: '#a855f7', dot: 'bg-purple-500', tailwind: 'bg-purple-50 text-purple-600 border-purple-200' },
  EARLY_GOING: { hex: '#06b6d4', dot: 'bg-cyan-500', tailwind: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
  LEAVE: { hex: '#f97316', dot: 'bg-orange-500', tailwind: 'bg-orange-50 text-orange-600 border-orange-200' },
  HOLIDAY: { hex: '#fb7185', dot: 'bg-rose-400', tailwind: 'bg-rose-50 text-rose-500 border-rose-200' },
};

const ProfessionalDashboard = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const params = {
          month: currentMonth + 1,
          year: currentYear
        };

        const [attendanceRes, holidayRes, statsRes] = await Promise.all([
          AttendanceService.getMyAttendance(), 
          AttendanceService.getHolidays(),
          AttendanceService.getDashboardStats(params)
        ]);

        if (attendanceRes?.success) setAttendanceData(attendanceRes.data);
        if (holidayRes?.success) setHolidays(holidayRes.data);
        if (statsRes?.success) setStats(statsRes.data); // Correctly setting stats

      } catch (err) {
        console.error("Dashboard Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentMonth, currentYear]);

  const getDayDetails = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = attendanceData.find(r => r.date === dateStr);
    const holiday = holidays.find(h => h.date?.split('T')[0] === dateStr);

    let activeStatuses = [];
    if (holiday) activeStatuses.push("HOLIDAY");
    if (record) {
      const apiStatuses = Array.isArray(record.status) ? record.status : [record.status];
      apiStatuses.forEach(s => { if (statusMap[s]) activeStatuses.push(s); });
      if (record.leaveType) activeStatuses.push("LEAVE");
    }

    activeStatuses = [...new Set(activeStatuses)];

    if (activeStatuses.length >= 2) {
      const s1 = statusMap[activeStatuses[0]];
      const s2 = statusMap[activeStatuses[1]];
      return {
        label: `${activeStatuses[0]} + ${activeStatuses[1]}`,
        customStyle: {
          background: `linear-gradient(135deg, ${s1.hex}15 50%, ${s2.hex}15 50%)`,
          borderColor: `${s1.hex}40`,
        },
        dots: [s1.dot, s2.dot]
      };
    }

    if (activeStatuses.length === 1) {
      const s = statusMap[activeStatuses[0]];
      return {
        label: activeStatuses[0],
        style: s.tailwind,
        dots: [s.dot]
      };
    }

    const isToday = new Date().toISOString().split('T')[0] === dateStr;
    const isSunday = new Date(currentYear, currentMonth, day).getDay() === 0;

    return {
      label: isToday ? 'TODAY' : '',
      style: isToday 
        ? 'border-blue-400 ring-2 ring-blue-50 bg-white text-blue-600' 
        : (isSunday ? 'bg-slate-50/30 text-slate-200 border-transparent' : 'bg-slate-50/30 text-slate-200 border-slate-100'),
      dots: []
    };
  };

  const handleMonthChange = (offset) => {
    setCurrentDate(new Date(currentYear, currentMonth + offset, 1));
  };

  return (
    <div className="min-h-screen p-4 md:p-10 text-slate-900 bg-slate-50/30">
      <div className="max-w-7xl mx-auto space-y-8">
        <DashboardHero user={{ firstName: "Employee" }} loading={loading} onPunchClick={() => {}} />
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* Real Stats passed here instead of stats={{}} */}
            <StatGroup stats={stats} loading={loading} />
            
            <AttendanceCalendar
              currentDate={currentDate}
              onMonthChange={handleMonthChange}
              canGoBack={true}
              getDayDetails={getDayDetails}
              monthNames={monthNames}
              dayNames={dayNames}
              daysInMonth={daysInMonth}
              firstDayOfMonth={firstDayOfMonth}
              loading={loading}
            />
          </div>
          <div className="lg:col-span-4">
            <ActivitySidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;