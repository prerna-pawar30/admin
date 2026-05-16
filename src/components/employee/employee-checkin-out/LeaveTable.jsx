/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LeaveTable = ({ data = [] }) => {
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 1. DATA CLEANING: Remove duplicates before processing
  // This ensures that if the same record is sent twice, it only shows once.
  const uniqueData = useMemo(() => {
    const map = new Map();
    data.forEach(item => {
      // Use a unique identifier (id, _id, or a string combination of fields)
      const identifier = item.id || item._id || `${item.fromDate}-${item.leaveReason}`;
      if (!map.has(identifier)) {
        map.set(identifier, item);
      }
    });
    return Array.from(map.values());
  }, [data]);

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

  // 2. PAGINATION LOGIC: Use uniqueData instead of raw data
  const totalPages = Math.ceil(uniqueData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = uniqueData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-100">
      <div className="overflow-x-auto flex-grow">
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
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr 
                  key={item.id || item._id || Math.random()} 
                  className="hover:bg-slate-50/50 transition-colors"
                >
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
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border transition-all ${
                currentPage === 1 
                ? 'text-slate-300 border-slate-50' 
                : 'text-orange-500 border-orange-100 hover:bg-orange-50 active:scale-90'
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border transition-all ${
                currentPage === totalPages 
                ? 'text-slate-300 border-slate-50' 
                : 'text-orange-500 border-orange-100 hover:bg-orange-50 active:scale-90'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveTable;