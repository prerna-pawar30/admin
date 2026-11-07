import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AttendanceService } from "../../../backend/ApiService";
import { fetchMyCalendar, setCalendarMonth } from "../../../store/slices/AttendanceSlice";
import DashboardHero from "./DashboardHero";
import StatGroup from "./StatCards";
import AttendanceCalendar from "./AttendanceCalendar";

/** Employee dashboard: greeting, month stats and the month calendar (server computed). */
const ProfessionalDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { calendar, calendarMonth, calendarStatus, calendarError } = useSelector((state) => state.attendance);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadMonth = useCallback(() => {
    dispatch(fetchMyCalendar(calendarMonth));
    setStatsLoading(true);
    AttendanceService.getDashboardStats(calendarMonth)
      .then((response) => setStats(response.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, [dispatch, calendarMonth]);

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  return (
    <div className="text-slate-900">
      <div className="space-y-6">
        <DashboardHero user={user} onAttendanceClick={() => navigate("/workforce/portal")} />
        <StatGroup stats={stats} loading={statsLoading} />
        <AttendanceCalendar
          calendar={calendar}
          month={calendarMonth}
          onMonthChange={(value) => dispatch(setCalendarMonth(value))}
          loading={calendarStatus === "loading"}
          error={calendarStatus === "failed" ? calendarError : null}
          onRetry={loadMonth}
        />
      </div>
    </div>
  );
};

export default ProfessionalDashboard;