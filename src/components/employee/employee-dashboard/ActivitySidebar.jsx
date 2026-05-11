import React from 'react';
import { Bell, CheckCircle2, ClipboardList, AlertCircle, Clock } from 'lucide-react';

const typeConfig = {
  APPROVED: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    dot: 'bg-emerald-400',
  },
  TASK: {
    icon: ClipboardList,
    iconColor: 'text-orange-400',
    bg: 'bg-orange-500/10',
    dot: 'bg-orange-400',
  },
  ALERT: {
    icon: AlertCircle,
    iconColor: 'text-rose-400',
    bg: 'bg-rose-500/10',
    dot: 'bg-rose-400',
  },
  INFO: {
    icon: Clock,
    iconColor: 'text-blue-400',
    bg: 'bg-blue-500/10',
    dot: 'bg-blue-400',
  },
};

const sampleActivities = [
  {
    type: 'APPROVED',
    title: 'Punch-out Approved',
    desc: 'Admin cleared your manual entry for yesterday.',
    time: '10m ago',
  },
  {
    type: 'TASK',
    title: 'New Task Assigned',
    desc: 'Review and submit monthly attendance report.',
    time: '1h ago',
  },
  {
    type: 'ALERT',
    title: 'Late Arrival Notice',
    desc: 'You were marked late on Apr 22. Contact HR if incorrect.',
    time: 'Yesterday',
  },
  {
    type: 'INFO',
    title: 'Holiday Next Week',
    desc: 'Office will be closed on the upcoming Sunday.',
    time: '2d ago',
  },
];

const NotificationItem = ({ type, title, desc, time }) => {
  const config = typeConfig[type] || typeConfig.INFO;
  const Icon = config.icon;

  return (
    <div className="flex gap-3 group">
      {/* Left line + dot */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
          <Icon size={14} className={config.iconColor} />
        </div>
        <div className="w-px flex-1 bg-white/5 mt-2 mb-1" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-4 last:pb-0">
        <div className="flex justify-between items-start gap-2 mb-0.5">
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-200 leading-tight">
            {title}
          </p>
          <span className="text-[9px] text-slate-500 font-medium shrink-0 mt-0.5">{time}</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};

const ActivitySidebar = ({ activities = sampleActivities }) => (
  <div className="bg-slate-900 rounded-[2rem] p-6 sm:p-8 text-white h-full flex flex-col">
    
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
          <Bell size={15} className="text-orange-400" />
        </div>
        <h3 className="font-black text-[11px] uppercase tracking-[0.15em] text-slate-200">
          Activity Center
        </h3>
      </div>
      {activities.length > 0 && (
        <span className="text-[9px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">
          {activities.length}
        </span>
      )}
    </div>

    {/* Items */}
    <div className="flex-1 overflow-y-auto space-y-0 pr-1 scrollbar-thin">
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-600">
          <Bell size={20} />
          <p className="text-xs font-semibold">No activity yet</p>
        </div>
      ) : (
        activities.map((item, idx) => (
          <NotificationItem key={idx} {...item} />
        ))
      )}
    </div>

    {/* Footer */}
    <div className="mt-4 pt-4 border-t border-white/5">
      <button className="w-full text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors text-center">
        View All Activity →
      </button>
    </div>
  </div>
);

export default ActivitySidebar;