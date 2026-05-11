import React, { useState } from "react";

export default function AuditLogFeed({ logs }) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const currentLogs = logs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="px-8 py-6 border-b bg-slate-50/50 flex justify-between items-center">
        <div>
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Security Audit Logs</h3>
          <p className="text-[10px] text-blue-500 font-bold mt-1">REAL-TIME ACCESS FEED</p>
        </div>
        <div className="flex gap-2">
           <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-30 text-slate-400">❮</button>
           <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-30 text-slate-400">❯</button>
        </div>
      </div>

      <div className="p-8 space-y-4">
        {currentLogs.length > 0 ? (
          currentLogs.map((log) => (
            <div key={log._id} className="group relative flex items-start justify-between p-5 rounded-[1.5rem] border-2 border-slate-50 hover:border-blue-100 transition-all bg-white shadow-sm hover:shadow-md">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-[8px] font-black px-2.5 py-1 rounded-md uppercase tracking-[0.2em] ${
                    log.action === 'assign' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {log.action === 'assign' ? 'Access Granted' : 'Access Revoked'}
                  </span>
                  <span className="text-xs font-mono font-black text-blue-900 tracking-tight">{log.permission}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Administrator</p>
                    <p className="text-[11px] text-slate-600 font-bold">{log.actionBy?.email || "System-Auto"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Target Employee</p>
                    <p className="text-[11px] text-slate-600 font-bold">{log.actionFor?.email || "Unknown"}</p>
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col justify-center border-l-2 border-slate-50 pl-6 ml-4">
                <p className="text-[11px] text-slate-800 font-black">{log.timestamp ? new Date(log.timestamp).toLocaleDateString('en-GB') : ''}</p>
                <p className="text-[10px] text-slate-400 font-bold">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <p className="text-slate-300 font-black uppercase text-xs tracking-widest">No Security Events Logged</p>
          </div>
        )}
      </div>
    </div>
  );
}