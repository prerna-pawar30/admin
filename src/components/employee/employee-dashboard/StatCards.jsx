import React from 'react';
import { CheckCircle, Timer, Clock, Calendar as CalIcon } from 'lucide-react';

const StatCard = ({ label, val, icon, color }) => {
  const styles = {
    emerald: 'text-emerald-600 bg-emerald-50',
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
  };
  return (
    <div className="bg-white p-6 rounded-3xl border border-white shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${styles[color]}`}>{icon}</div>
      <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
      <p className="text-xl font-black">{val}</p>
    </div>
  );
};

const StatGroup = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <StatCard label="Attendance" val={`${stats.presentDays}d`} icon={<CheckCircle size={20}/>} color="emerald" />
    <StatCard label="Work Time" val={`${stats.totalHoursWorked}h`} icon={<Timer size={20}/>} color="blue" />
    <StatCard label="Late Entry" val={stats.lateDays} icon={<Clock size={20}/>} color="purple" />
    <StatCard label="Leaves" val={stats.leaveDays} icon={<CalIcon size={20}/>} color="orange" />
  </div>
);

export default StatGroup;