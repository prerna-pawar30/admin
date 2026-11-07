import React from "react";
import { CalendarCheck, ChevronRight } from "lucide-react";

const istHour = () =>
  Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", hourCycle: "h23" }).format(new Date()));

const greeting = () => {
  const h = istHour();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const todayLabel = () =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

const roleLabel = (role) => (role ? String(role).replace(/_/g, " ").toLowerCase() : "staff member");

const DashboardHero = ({ user, onAttendanceClick }) => {
  const firstName = user?.firstName || "Employee";
  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "E";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 p-6 text-white shadow-sm sm:p-8">
      {/* soft decorative circles */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-white/10" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold ring-4 ring-white/20 backdrop-blur sm:h-20 sm:w-20 sm:text-3xl">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-orange-50/90">{todayLabel()}</p>
            <h1 className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl">
              {greeting()}, {firstName}
            </h1>
            <p className="mt-1 inline-flex rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold capitalize">
              {roleLabel(user?.role)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAttendanceClick}
          className="group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-orange-600 shadow-md transition-all hover:bg-orange-50 active:scale-95"
        >
          <CalendarCheck size={18} />
          Attendance
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default DashboardHero;