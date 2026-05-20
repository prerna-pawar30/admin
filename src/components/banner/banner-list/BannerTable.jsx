import React from "react";
import { Edit2, Trash2, Circle } from "lucide-react";

const BannerTable = ({ loading, banners, onEdit, onDelete }) => {
  
  // Helper function to format MongoDB ISO dates neatly
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xl shadow-slate-100/50">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/60">
              {/* Added explicit column widths to prevent automatic wide browser spacing */}
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[180px]">Banner Preview</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[140px]">Link Target</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[100px]">Order</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell w-[140px]">Created At</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell w-[140px]">Updated At</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[130px]">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[120px]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-20 text-center">
                  <div className="flex flex-col justify-center items-center gap-3">
                    <div className="w-8 h-8 border-[3px] border-[#E68736] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading Assets...</span>
                  </div>
                </td>
              </tr>
            ) : banners.length > 0 ? (
              banners.map((b) => (
                <tr 
                  key={b._id} 
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Preview Asset */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`w-32 h-16 rounded-xl overflow-hidden border bg-slate-50 p-0.5 flex items-center justify-center transition-transform group-hover:scale-[1.02] ${
                      b.isActive ? "border-slate-200 shadow-sm" : "border-slate-200/60 opacity-50"
                    }`}>
                      <img src={b.imageUrl} className="w-full h-full object-cover rounded-lg" alt="banner preview" />
                    </div>
                  </td>

                  {/* Target Information */}
                  <td className="px-6 py-4">
                    <span className={`font-semibold text-sm tracking-tight block truncate capitalize ${
                      b.isActive ? "text-slate-700" : "text-slate-400 font-medium"
                    }`}>
                      {b.filterBy || "No Target"}
                    </span>
                  </td>

                  {/* Display Order */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                      b.isActive ? "bg-slate-100 text-slate-600" : "bg-slate-100/70 text-slate-400"
                    }`}>
                      #{b.displayOrder}
                    </span>
                  </td>

                  {/* Created At */}
                  <td className="px-6 py-4 text-slate-500 text-xs font-medium hidden lg:table-cell whitespace-nowrap">
                    {formatDate(b.createdAt)}
                  </td>

                  {/* Updated At */}
                  <td className="px-6 py-4 text-slate-500 text-xs font-medium hidden md:table-cell whitespace-nowrap">
                    {formatDate(b.updatedAt)}
                  </td>

                  {/* Status Wrapper */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-center">
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        b.isActive 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : "bg-slate-50 text-slate-500 border-slate-200/80"
                      }`}>
                        <Circle size={6} fill="currentColor" className={b.isActive ? "animate-pulse text-emerald-500" : "text-slate-400"} />
                        {b.isActive ? "Active" : "Draft"}
                      </span>
                    </div>
                  </td>

                  {/* Actions Grid */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-center items-center gap-1">
                      <button 
                        onClick={() => onEdit(b)} 
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                        title="Edit Asset"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(b.bannerId)} 
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete Asset"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center text-slate-400 font-medium text-sm">
                  No store banners have been added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BannerTable;