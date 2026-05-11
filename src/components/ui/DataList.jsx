import React, { useMemo } from "react";
import { Loader2, Inbox, Calendar, Plus } from "lucide-react";

/**
 * @param {Array} data - The raw array from your API (e.g., coupons or products)
 * @param {Array} columns - Configuration for table headers and data keys
 * @param {boolean} loading - Loading state from the parent
 * @param {Function} onAdd - Function to open the "Create" modal
 * @param {string} title - Page title
 */
export default function ReusableList({ data = [], columns = [], loading, onAdd, title }) {
  
  // ✅ DATE LOGIC: Sort data so newest (by createdAt or date) shows first
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.startDate || 0);
      const dateB = new Date(b.createdAt || b.startDate || 0);
      return dateB - dateA; // Descending order: Newest first
    });
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="text-[#E68736] animate-spin mb-4" size={40} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading {title}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
          {title} <span className="text-[#E68736]">({data.length})</span>
        </h1>
        {onAdd && (
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 bg-[#E68736] text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg"
          >
            <Plus size={18} strokeWidth={3} />
            ADD NEW
          </button>
        )}
      </div>

      {/* List / Table Section */}
      {sortedData.length > 0 ? (
        <div className="bg-white border-2 border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b-2 border-slate-100">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, rowIdx) => (
                <tr key={item._id || rowIdx} className="border-b border-slate-50 hover:bg-orange-50/30 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="p-5 text-sm font-bold text-slate-700">
                      {/* If a render function is provided, use it; otherwise, show the raw key */}
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <Inbox className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No data found</p>
        </div>
      )}
    </div>
  );
}