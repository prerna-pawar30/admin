/* eslint-disable no-unused-vars */
import React, { useState } from "react";

export default function RegistryTable({ permissions = [], loading, onRefresh, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 1. Ensure permissions is an array to prevent .length errors
  const safePermissions = Array.isArray(permissions) ? permissions : [];

  // 2. Fix Pagination Logic: Calculate indices to slice the array
  const totalPages = Math.ceil(safePermissions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // 3. Update currentData to only show items for the current page
  const currentData = safePermissions.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="px-8 py-6 border-b bg-slate-50/50 flex justify-between items-center">
        <div>
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Active Registry</h3>
          <p className="text-[10px] text-slate-400 font-bold mt-1">SYSTEM AUTHORIZATION LABELS</p>
        </div>
        <span className="text-[10px] font-black bg-white border border-slate-200 text-slate-500 px-4 py-2 rounded-xl shadow-sm">
          PAGE {currentPage} / {totalPages || 1}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/80 text-slate-400 text-[9px] uppercase font-black tracking-[0.2em]">
            <tr>
              <th className="px-8 py-5">Permission String</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="2" className="py-20 text-center text-xs font-black text-slate-300 animate-pulse tracking-widest">
                  SYNCHRONIZING DATA...
                </td>
              </tr>
            ) : currentData.length > 0 ? (
              currentData.map((p) => (
                <tr key={p._id || p.permissionId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <span className="font-mono font-bold text-blue-600 text-sm bg-blue-50/50 px-3 py-1 rounded-lg border border-blue-100">
                      {p.name}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      // Using _id as primary key for delete if permissionId isn't reliable
                      onClick={() => onDelete(p._id || p.permissionId)} 
                      className="text-rose-400 hover:text-rose-600 text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-rose-50 px-3 py-1 rounded-lg"
                    >
                      Revoke Label
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="py-20 text-center text-xs font-bold text-slate-300 uppercase">Registry is empty</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-5 bg-slate-50/50 border-t flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
          Total Entries: {safePermissions.length}
        </span>
        <div className="flex gap-2">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => p - 1)} 
            className="px-4 py-2 rounded-xl border-2 border-slate-100 bg-white disabled:opacity-30 hover:border-slate-300 transition-all text-[10px] font-black uppercase"
          >
            Prev
          </button>
          <button 
            disabled={currentPage >= totalPages} 
            onClick={() => setCurrentPage(p => p + 1)} 
            className="px-4 py-2 rounded-xl border-2 border-slate-100 bg-white disabled:opacity-30 hover:border-slate-300 transition-all text-[10px] font-black uppercase"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}