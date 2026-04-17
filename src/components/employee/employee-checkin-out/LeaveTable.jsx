import React from 'react';

const LeaveTable = ({ data }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'bg-emerald-100 text-emerald-600';
      case 'REJECTED': return 'bg-rose-100 text-rose-600';
      default: return 'bg-amber-100 text-amber-600';
    }
  };

  return (
    <table className="w-full text-left min-w-[600px]">
      <thead>
        <tr className="text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100">
          <th className="px-6 py-4">Period</th>
          <th className="px-6 py-4">Type & Duration</th>
          <th className="px-6 py-4">Reason</th>
          <th className="px-6 py-4">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {data.length > 0 ? (
          data.map((item, i) => (
            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-6">
                <div className="text-[11px] font-bold space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 w-8">FROM:</span>
                    <span className="text-slate-700">{formatDate(item.fromDate || item.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 w-8">TO:</span>
                    <span className="text-slate-700">{formatDate(item.toDate || item.date)}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-6">
                <div className="text-xs font-black text-slate-800 uppercase">
                  {item.leaveType?.replace('_', ' ') || "CASUAL"}
                </div>
                <div className="text-[10px] text-slate-500 font-bold">
                  {item.leaveDuration?.replace('_', ' ') || "FULL DAY"}
                </div>
              </td>
              <td className="px-6 py-6">
                <p className="text-xs text-slate-500 italic max-w-[250px] leading-relaxed">
                  {item.leaveReason || "No reason provided"}
                </p>
              </td>
              <td className="px-6 py-6">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase shadow-sm ${getStatusStyle(item.leaveStatus)}`}>
                  {item.leaveStatus || "PENDING"}
                </span>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4" className="text-center py-12 text-slate-400 italic text-sm">
              No leave applications found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default LeaveTable;