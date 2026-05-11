import React from 'react';
import { Clock, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const AttendanceTable = ({ data, loading }) => {
  const formatToIST = (dateObj) => {
    if (!dateObj) return "--:--";
    // Handles ISO strings or date objects
    const localTimestamp = typeof dateObj === 'string' ? dateObj.replace('Z', '') : dateObj;
    return new Date(localTimestamp).toLocaleTimeString("en-IN", { 
      hour: "2-digit", 
      minute: "2-digit", 
      hour12: true 
    });
  };

  if (loading) {
    return (
      <table className="w-full">
        <tbody>
          <tr>
            <td className="py-40 text-center text-slate-300 font-black uppercase text-xs animate-pulse tracking-[0.3em]">
              Synchronizing Terminal...
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
          <th className="px-10 py-6">Identity</th>
          <th className="px-8 py-6">Date</th>
          <th className="px-8 py-6">Punch Info</th>
          <th className="px-8 py-6">Duration</th>
          <th className="px-10 py-6 text-right">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {data.map((item, idx) => (
          <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
            <td className="px-10 py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center font-black text-orange-600 text-xs shadow-inner uppercase">
                  {item.employee?.firstName?.[0]}{item.employee?.lastName?.[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{item.employee?.firstName} {item.employee?.lastName}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.employee?.email}</p>
                </div>
              </div>
            </td>
            <td className="px-8 py-6 text-xs font-bold text-slate-600">
              {item.leaveType ? `${item.fromDate?.split('T')[0]} →` : item.date}
            </td>
            <td className="px-8 py-6">
              {item.leaveType ? (
                <span className="text-[10px] font-black text-slate-300 uppercase italic">On Leave</span>
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-2 text-emerald-600 font-mono text-[11px] font-bold bg-emerald-50 w-fit px-2 py-0.5 rounded-md">
                    <ArrowDownLeft size={12}/> {formatToIST(item.punchIn)}
                  </span>
                  <span className="flex items-center gap-2 text-rose-500 font-mono text-[11px] font-bold bg-rose-50 w-fit px-2 py-0.5 rounded-md">
                    <ArrowUpRight size={12}/> {formatToIST(item.punchOut)}
                  </span>
                </div>
              )}
            </td>
            <td className="px-8 py-6 text-xs font-black text-slate-700">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-300"/> 
                {item.leaveType ? "0h" : `${item.totalWorkedTime?.hours || 0}h ${item.totalWorkedTime?.minutes || 0}m`}
              </div>
            </td>
            <td className="px-10 py-6 text-right">
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                item.leaveType 
                  ? "bg-purple-100 text-purple-600" 
                  : item.status?.includes("LATE") 
                  ? "bg-amber-100 text-amber-600" 
                  : "bg-emerald-100 text-emerald-600"
              }`}>
                {item.leaveType ? item.leaveType.replace("_", " ") : (item.status?.length > 0 ? item.status.join(" / ") : "PRESENT")}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AttendanceTable;