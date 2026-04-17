import React from 'react';
import { Clock, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const AttendanceTable = ({ data, loading }) => {
  const formatToIST = (dateObj) => {
    if (!dateObj) return "--:--";
    const localTimestamp = typeof dateObj === 'string' ? dateObj.replace('Z', '') : dateObj;
    return new Date(localTimestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  if (loading) return <div className="py-40 text-center animate-pulse">SYNCHRONIZING...</div>;

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b">
          <th className="px-10 py-6">Identity</th>
          <th className="px-8 py-6">Date</th>
          <th className="px-8 py-6">Punch Info</th>
          <th className="px-8 py-6">Duration</th>
          <th className="px-10 py-6 text-right">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {data.map((item, idx) => (
          <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
            <td className="px-10 py-6">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center font-black text-orange-600 text-xs">
                   {item.employee?.firstName?.[0]}{item.employee?.lastName?.[0]}
                 </div>
                 <div>
                   <p className="font-bold text-sm text-slate-800">{item.employee?.firstName} {item.employee?.lastName}</p>
                   <p className="text-[10px] text-slate-400 uppercase">{item.employee?.email}</p>
                 </div>
               </div>
            </td>
            <td className="px-8 py-6 text-xs font-bold text-slate-600">
              {item.leaveType ? `${item.fromDate?.split('T')[0]} →` : item.date}
            </td>
            <td className="px-8 py-6">
              {item.leaveType ? <span className="text-[10px] italic text-slate-300 uppercase">On Leave</span> : (
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-2 text-emerald-600 font-mono text-[11px] font-bold bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                    <ArrowDownLeft size={12}/> {formatToIST(item.punchIn)}
                  </span>
                  <span className="flex items-center gap-2 text-rose-500 font-mono text-[11px] font-bold bg-rose-50 px-2 py-0.5 rounded-md w-fit">
                    <ArrowUpRight size={12}/> {formatToIST(item.punchOut)}
                  </span>
                </div>
              )}
            </td>
            <td className="px-8 py-6 text-xs font-black text-slate-700">
              <div className="flex items-center gap-2"><Clock size={14} className="text-slate-300"/> {item.leaveType ? "0h" : `${item.totalWorkedTime?.hours || 0}h ${item.totalWorkedTime?.minutes || 0}m`}</div>
            </td>
            <td className="px-10 py-6 text-right">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${item.leaveType ? "bg-purple-100 text-purple-600" : "bg-emerald-100 text-emerald-600"}`}>
                   {item.leaveType ? item.leaveType.replace("_", " ") : (item.status?.join(" / ") || "PRESENT")}
                </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AttendanceTable;