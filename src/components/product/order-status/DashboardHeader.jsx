import React, { useState } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import { FILTER_STATUS_OPTIONS } from "./OrderConstants";

export default function DashboardHeader({ query, setQuery, statusFilter, setStatusFilter }) {
  const [openFilter, setOpenFilter] = useState(false);

  return (
    <div className="max-w-7xl mx-auto mb-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Logistics Control</h1>
          <p className="text-slate-500 font-medium mt-1">Order tracking and shipping management</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E68736]" size={18} />
            <input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Search recipient or ID..." 
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-orange-200 focus:border-[#E68736] outline-none  transition-all" 
            />
          </div>
          
          <div className="relative">
            <button onClick={() => setOpenFilter(!openFilter)} className="flex items-center gap-3 px-6 py-3 bg-white border border-orange-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 shadow-sm">
              <Filter size={18} className="text-[#E68736]" />
              <span className="text-sm">{statusFilter}</span>
              <ChevronDown size={16} className={`transition-transform ${openFilter ? "rotate-180" : ""}`} />
            </button>
            {openFilter && (
              <div className="absolute right-0 mt-2 bg-white shadow-2xl rounded-2xl p-2 w-64 z-50 border border-slate-100">
                {FILTER_STATUS_OPTIONS.map((s) => (
                  <button 
                    key={s} 
                    onClick={() => { setStatusFilter(s); setOpenFilter(false); }} 
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold ${statusFilter === s ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}