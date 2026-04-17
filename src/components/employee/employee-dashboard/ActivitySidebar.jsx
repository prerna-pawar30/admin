import React from 'react';
import { Bell, Check, ClipboardList } from 'lucide-react';

const NotificationItem = ({ type, title, desc, time }) => (
  <div className="flex gap-4 border-b border-white/5 pb-4 last:border-0">
    <div className="mt-1 h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
      {type === 'APPROVED' ? <Check size={14} className="text-emerald-400" /> : <ClipboardList size={14} className="text-orange-400" />}
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-center w-full">
        <p className="text-[11px] font-black uppercase text-slate-200">{title}</p>
        <span className="text-[9px] text-slate-500">{time}</span>
      </div>
      <p className="text-[10px] text-slate-400 mt-1">{desc}</p>
    </div>
  </div>
);

const ActivitySidebar = () => (
  <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white h-full">
    <div className="flex items-center gap-3 mb-6">
      <Bell className="text-orange-500" size={20} />
      <h3 className="font-black text-xs uppercase tracking-widest">Activity Center</h3>
    </div>
    <div className="space-y-4">
      <NotificationItem type="APPROVED" title="Punch-out Approved" desc="Admin cleared your manual entry" time="10m ago" />
      <NotificationItem type="TASK" title="New Task" desc="Review monthly report" time="Today" />
    </div>
  </div>
);

export default ActivitySidebar;