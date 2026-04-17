import React from 'react';

export const HistoryTable = ({ activeTab, setActiveTab, attendanceHistory, leaveHistory, formatIST }) => {
  
  const getStatusBadge = (item) => {
    const type = item.status?.join(" ") || item.dayType || "";
    if (type.includes("HOLIDAY")) return "bg-blue-100 text-blue-600";
    if (type.includes("LATE") || type.includes("ABSENT")) return "bg-rose-100 text-rose-600";
    return "bg-emerald-100 text-emerald-600";
  };

  // Sort the logs so that the most recent dates appear at the top
  const sortedAttendance = [...attendanceHistory].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="bg-white rounded-[2.5rem] border border-orange-200 overflow-hidden">
      <div className="flex bg-slate-50 p-6">
        <button 
          onClick={() => setActiveTab("attendance")} 
          className={`flex-1 py-4 text-xs font-black rounded-2xl transition-all ${activeTab === "attendance" ? "bg-white text-[#E68736] border border-orange-200 shadow-sm" : "text-slate-400"}`}
        >
          ATTENDANCE & HOLIDAYS
        </button>
        <button 
          onClick={() => setActiveTab("leaves")} 
          className={`flex-1 py-4 text-xs font-black rounded-2xl transition-all ${activeTab === "leaves" ? "bg-white text-[#E68736] border border-orange-200 shadow-sm" : "text-slate-400"}`}
        >
          LEAVE HISTORY
        </button>
      </div>
      
      <div className="p-4 overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-50">
              {activeTab === "attendance" ? (
                <>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Timing</th>
                  <th className="px-6 py-4">Duration</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4">Period</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Status</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {activeTab === "attendance" ? (
              sortedAttendance.map((item, i) => {
                const isHoliday = item.dayType === "HOLIDAY";
                
                return (
                  <tr key={i} className={`transition-colors ${isHoliday ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-6 text-sm font-bold text-slate-700">
                      {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${getStatusBadge(item)}`}>
                        {isHoliday ? (item.holidayName || "PUBLIC HOLIDAY") : (item.status?.join(", ") || item.dayType || "PRESENT")}
                      </span>
                    </td>
                    <td className="px-6 py-6 font-mono text-xs">
                      {isHoliday ? (
                        <span className="text-blue-400 italic font-medium tracking-tight">Office Closed</span>
                      ) : (
                        <>
                          <span className="text-emerald-500 bg-emerald-50 px-2 py-1 rounded font-bold">
                            IN: {formatIST(item.punchIn)}
                          </span>
                          <span className="ml-2 text-rose-400 bg-rose-50 px-2 py-1 rounded font-bold">
                            OUT: {item.punchOut ? formatIST(item.punchOut) : (item.punchOutRequestStatus === 'PENDING' ? "PENDING APPROVAL" : "--:--")}
                          </span>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-6 text-sm font-black text-slate-600">
                      {isHoliday ? "--" : `${item.totalWorkedTime?.hours || 0}h ${item.totalWorkedTime?.minutes || 0}m`}
                    </td>
                  </tr>
                );
              })
            ) : (
              leaveHistory.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-6 font-bold text-[11px]">
                    <div className="text-emerald-600">From: {new Date(item.fromDate || item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                    <div className="text-rose-600">To: {new Date(item.toDate || item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                  </td>
                  <td className="px-6 py-6 text-xs font-black uppercase">{item.leaveType || item.dayType}</td>
                  <td className="px-6 py-6 text-xs text-slate-500 italic truncate max-w-[200px]">{item.leaveReason || "No reason"}</td>
                  <td className="px-6 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${item.leaveStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                      {item.leaveStatus || "PENDING"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};