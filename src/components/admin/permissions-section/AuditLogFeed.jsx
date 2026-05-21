import React, { useState } from "react";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";

export default function AuditLogFeed({ logs }) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const safeLogs = Array.isArray(logs) ? logs : [];
  const totalPages = Math.ceil(safeLogs.length / itemsPerPage);
  const currentLogs = safeLogs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-orange-100 overflow-hidden">

      {/* Header */}
      <div className="px-5 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-orange-200 bg-orange-50/50 flex flex-wrap gap-3 justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Activity size={15} className="text-violet-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Security Audit Logs</h3>
            <p className="text-[10px] text-orange-500 font-bold mt-0.5 uppercase tracking-widest">Real-Time Access Feed</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-orange-200 disabled:opacity-30 hover:border-orange-300 transition-all text-slate-500"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[10px] font-black text-slate-500 px-1 whitespace-nowrap">
            {page} / {totalPages || 1}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-orange-200 disabled:opacity-30 hover:border-orange-300 transition-all text-slate-500"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Log Cards */}
      <div className="p-4 sm:p-5 lg:p-6 space-y-3">
        {currentLogs.length > 0 ? (
          currentLogs.map((log) => (
            <div
              key={log._id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-slate-50 hover:border-blue-100 transition-all bg-white shadow-sm hover:shadow-md"
            >
              {/* Left: badge + permission + emails */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className={`text-[8px] font-black px-2.5 py-1 rounded-md uppercase tracking-[0.2em] flex-shrink-0 ${
                    log.action === 'assign'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    {log.action === 'assign' ? 'Access Granted' : 'Access Revoked'}
                  </span>
                  <span className="text-xs font-mono font-black text-orange text-slate900 tracking-tight truncate max-w-[200px] sm:max-w-none">
                    {log.permission}
                  </span>
                </div>

                <div className="flex flex-col xs:flex-row gap-2 sm:gap-6">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Administrator</p>
                    <p className="text-[11px] text-slate-600 font-bold truncate">{log.actionBy?.email || "System-Auto"}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Target Employee</p>
                    <p className="text-[11px] text-slate-600 font-bold truncate">{log.actionFor?.email || "Unknown"}</p>
                  </div>
                </div>
              </div>

              {/* Right: timestamp — inline on mobile, bordered on desktop */}
              <div className="flex sm:flex-col sm:items-end sm:text-right sm:border-l-2 sm:border-orange-50 sm:pl-5 sm:ml-4 gap-2 sm:gap-0">
                <p className="text-[11px] text-slate-800 font-black">
                  {log.timestamp ? new Date(log.timestamp).toLocaleDateString('en-GB') : ''}
                </p>
                <p className="text-[10px] text-slate-400 font-bold">
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
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