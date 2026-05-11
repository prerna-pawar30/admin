import React from 'react';
import { CheckCircle2, Timer, Pill, Coffee, Info } from 'lucide-react';

const cardConfigs = [
  {
    key: 'presentDays',
    label: 'Present Days',
    unit: 'd',
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    valueColor: 'text-emerald-700',
    border: 'border-emerald-100',
    ring: 'ring-emerald-100',
  },
  {
    key: 'totalHoursWorked',
    label: 'Hours Worked',
    unit: 'h',
    icon: Timer,
    bg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    valueColor: 'text-blue-700',
    border: 'border-blue-100',
    ring: 'ring-blue-100',
  },
  {
    key: 'CASUAL',
    label: 'Casual Leave',
    unit: 'd',
    icon: Coffee,
    bg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    valueColor: 'text-orange-700',
    border: 'border-orange-100',
    ring: 'ring-orange-100',
    total: 18,
    monthlyLimit: 'Max 2d / month'
  },
  {
    key: 'SICK',
    label: 'Sick Leave',
    unit: 'd',
    icon: Pill,
    bg: 'bg-rose-50',
    iconColor: 'text-rose-500',
    valueColor: 'text-rose-700',
    border: 'border-rose-100',
    ring: 'ring-rose-100',
    total: 6,
    monthlyLimit: 'Max 1d / month'
  },
];

const StatCard = ({ config, value, loading }) => {
  const Icon = config.icon;
  return (
    <div className={`bg-white p-5 rounded-[1.5rem] border ${config.border} shadow-sm transition-all duration-200`}>
      <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center mb-4 ring-4 ${config.ring}`}>
        <Icon size={18} className={config.iconColor} />
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{config.label}</p>
      {loading ? (
        <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg mt-1" />
      ) : (
        <div className="flex items-baseline gap-1">
          <p className={`text-2xl font-black ${config.valueColor}`}>{value ?? 0}</p>
          {config.total && <span className="text-slate-400 font-bold text-sm">/ {config.total}{config.unit}</span>}
          {!config.total && <span className="text-sm font-bold opacity-60 ml-0.5">{config.unit}</span>}
        </div>
      )}
    </div>
  );
};

const StatGroup = ({ stats, loading }) => {
  // Mapping API response to Card Keys
  const processedStats = {
    presentDays: stats?.presentDays || 0,
    // Format hours to 2 decimal places if it's a number
    totalHoursWorked: typeof stats?.totalHoursWorked === 'number' 
      ? stats.totalHoursWorked.toFixed(2) 
      : (stats?.totalHoursWorked || 0),
    CASUAL: stats?.leaveTypeCount?.CASUAL || 0,
    SICK: stats?.leaveTypeCount?.SICK || 0,
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-white border-l-4 border-orange-500 p-4 rounded-r-2xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Info className="text-orange-500" size={20} />
          <div>
            <h4 className="text-sm font-bold text-slate-800">Leave Entitlements Policy</h4>
            <p className="text-[11px] text-slate-500">CL: 18d/year | SL: 6d/year</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cardConfigs.map((config) => (
          <StatCard
            key={config.key}
            config={config}
            value={processedStats[config.key]}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
};

export default StatGroup;