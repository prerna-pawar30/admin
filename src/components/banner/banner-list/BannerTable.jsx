import React from "react";
import { Edit2, Trash2, Circle } from "lucide-react";

const BannerTable = ({ loading, banners, onEdit, onDelete }) => (
  <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-orange-200 overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="hidden md:table-header-group border-b border-orange-100 bg-orange-50/30">
          <tr>
            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Banner Preview</th>
            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Link Target</th>
            <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Order</th>
            <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-50">
          {loading ? (
            <tr>
              <td colSpan="5" className="px-10 py-20 text-center text-slate-400 font-bold italic">
                Loading assets...
              </td>
            </tr>
          ) : banners.length > 0 ? (
            banners.map((b) => (
              <tr 
                key={b._id} 
                className={`flex flex-col md:table-row transition-colors group p-5 md:p-0 ${
                  b.isActive ? "hover:bg-green-50/30" : "hover:bg-amber-50/30 bg-slate-50/40"
                }`}
              >
                {/* Preview */}
                <td className="md:px-10 md:py-5 flex justify-center md:table-cell">
                  <div className={`w-full max-w-[280px] md:w-44 h-24 md:h-20 rounded-2xl overflow-hidden border shadow-sm transition-opacity ${
                    b.isActive ? "border-slate-100" : "border-slate-200 opacity-60"
                  }`}>
                    <img src={b.imageUrl} className="w-full h-full object-cover" alt="banner" />
                  </div>
                </td>

                {/* Target Information */}
                <td className="px-2 py-4 md:px-10 md:py-5 flex flex-col md:table-cell">
                  <span className="md:hidden text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Target</span>
                  <span className={`block font-black uppercase text-xs ${b.isActive ? "text-slate-700" : "text-slate-400"}`}>
                    {b.filterBy}
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 opacity-70">
                    ID: {b.filterId}
                  </p>
                </td>

                {/* Display Order */}
                <td className="px-2 py-2 md:px-6 md:py-5 text-left md:text-center flex items-center gap-3 md:table-cell">
                  <span className="md:hidden text-[9px] font-black text-slate-300 uppercase tracking-widest">Order:</span>
                  <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                    b.isActive ? "bg-slate-100 text-slate-600" : "bg-slate-200 text-slate-400"
                  }`}>
                    #{b.displayOrder}
                  </span>
                </td>

                {/* ACTIVE (true) / DRAFT (false) STATUS */}
                <td className="px-2 py-2 md:px-6 md:py-5 text-left md:text-center flex items-center gap-3 md:table-cell">
                  <span className="md:hidden text-[9px] font-black text-slate-300 uppercase tracking-widest">Visibility:</span>
                  <div className="flex md:justify-center">
                    <span className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      b.isActive 
                        ? "bg-green-50 text-green-700 border-green-100" 
                        : "bg-amber-50 text-amber-700 border-amber-100"
                    }`}>
                      {/* Only animate the pulse if the banner is Active (true) */}
                      <Circle size={6} fill="currentColor" className={b.isActive ? "animate-pulse" : ""} />
                      {b.isActive ? "Active" : "Draft"}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-2 pt-6 md:px-10 md:py-5 text-right flex justify-end md:table-cell space-x-2">
                  <button 
                    onClick={() => onEdit(b)} 
                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => onDelete(b.bannerId)} 
                    className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-10 py-20 text-center text-slate-400 font-bold">
                No banners found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default BannerTable;