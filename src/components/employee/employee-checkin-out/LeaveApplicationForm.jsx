import React from 'react';
import { Calendar } from 'lucide-react';

export const LeaveForm = ({ formData, setFormData, onSubmit, isLoading }) => {
  return (
    <div className="bg-white rounded-[2.5rem]  shadow-slate-200/50 border border-orange-200 overflow-hidden h-full">
      <div className="bg-[#E68736] px-8 py-5 text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2">
        <Calendar size={16} /> Apply for Leave
      </div>
      <form onSubmit={onSubmit} className="p-8 grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <select className="w-full p-4 bg-slate-50 rounded-2xl border-none text-sm font-bold" 
              value={formData.leaveType} onChange={e => setFormData({...formData, leaveType: e.target.value})}>
              <option value="SICK">Sick</option>
              <option value="CASUAL">Casual</option>
            </select>
            <select className="w-full p-4 bg-slate-50 rounded-2xl border-none text-sm font-bold" 
              value={formData.leaveDuration} onChange={e => setFormData({...formData, leaveDuration: e.target.value})}>
              <option value="FULL_DAY">Full Day</option>
              <option value="HALF_DAY">Half Day</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" required className="w-full p-3 bg-slate-50 rounded-xl border-none text-xs font-bold" 
              value={formData.fromDate} onChange={e => setFormData({...formData, fromDate: e.target.value})}/>
            <input type="date" required className="w-full p-3 bg-slate-50 rounded-xl border-none text-xs font-bold" 
              value={formData.toDate} onChange={e => setFormData({...formData, toDate: e.target.value})}/>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <textarea required className="w-full flex-grow p-4 bg-slate-50 rounded-2xl border-none text-sm resize-none font-medium" 
            placeholder="Reason..." value={formData.leaveReason} 
            onChange={e => setFormData({...formData, leaveReason: e.target.value})}></textarea>
          <button type="submit" disabled={isLoading} className="w-full bg-[#E68736] text-white font-black py-4 rounded-2xl  hover:bg-orange-600 transition-colors">
            SUBMIT REQUEST
          </button>
        </div>
      </form>
    </div>
  );
};