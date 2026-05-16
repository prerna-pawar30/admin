/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Shield, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

export default function RegistryTable({ permissions = [], loading, onRefresh, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const safePermissions = Array.isArray(permissions) ? permissions : [];

  const totalPages = Math.ceil(safePermissions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = safePermissions.slice(indexOfFirstItem, indexOfLastItem);

  // Color badge based on action suffix
  const badgeCls = (name) => {
    if (name.endsWith(".create"))  return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (name.endsWith(".read"))    return "bg-sky-50 text-sky-700 border-sky-200";
    if (name.endsWith(".update"))  return "bg-amber-50 text-amber-700 border-amber-200";
    if (name.endsWith(".delete") || name.endsWith(".remove") || name.endsWith(".revoke"))
                                   return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-blue-50 text-blue-700 border-blue-100";
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">

      {/* Header */}
      <div className="px-5 sm:px-6 lg:px-8 py-4 sm:py-5 border-b bg-slate-50/50 flex flex-wrap gap-3 justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <Shield size={15} className="text-white" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Active Registry</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              {safePermissions.length} Authorization Labels
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-slate-100 bg-white disabled:opacity-30 hover:border-slate-300 transition-all"
          >
            <ChevronLeft size={14} className="text-slate-500" />
          </button>
          <span className="text-[10px] font-black text-slate-500 px-1 whitespace-nowrap">
            {currentPage} / {totalPages || 1}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-slate-100 bg-white disabled:opacity-30 hover:border-slate-300 transition-all"
          >
            <ChevronRight size={14} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[380px]">
          <thead className="bg-slate-50/80 text-slate-400 text-[9px] uppercase font-black tracking-[0.2em]">
            <tr>
              <th className="px-5 sm:px-6 lg:px-8 py-4">Permission String</th>
              <th className="px-5 sm:px-6 lg:px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="2" className="py-16 text-center text-xs font-black text-slate-300 animate-pulse tracking-widest">
                  SYNCHRONIZING DATA…
                </td>
              </tr>
            ) : currentData.length > 0 ? (
              currentData.map((p) => (
                <tr key={p.permissionId} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-5 sm:px-6 lg:px-8 py-4">
                    <span className={`font-mono font-bold text-xs px-2.5 py-1 rounded-lg border ${badgeCls(p.name)}`}>
                      {p.name}
                    </span>
                  </td>
                  <td className="px-5 sm:px-6 lg:px-8 py-4 text-right">
                    <button
                      onClick={() => onDelete(p.permissionId)}
                      className="inline-flex items-center gap-1.5 text-slate-400 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-rose-50 px-3 py-1.5 rounded-lg"
                    >
                      <Trash2 size={11} />
                      <span className="hidden sm:inline">Revoke</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="py-16 text-center text-xs font-bold text-slate-300 uppercase tracking-widest">
                  Registry is empty
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 sm:px-6 lg:px-8 py-4 bg-slate-50/50 border-t">
        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
          Total Entries: {safePermissions.length}
        </span>
      </div>
    </div>
  );
}