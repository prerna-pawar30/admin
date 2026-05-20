import React, { useState } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import { FILTER_STATUS_OPTIONS } from "./OrderConstants";

export default function DashboardHeader({ query, setQuery, statusFilter, setStatusFilter }) {
  const [openFilter, setOpenFilter] = useState(false);

  return (
    <div className="max-w-7xl mx-auto mb-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">Logistics Pipeline</h1>
          <p className="text-slate-400 text-xs sm:text-sm font-semibold tracking-wide mt-0.5">Fulfillment workflow & asset distribution management</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Input Core search bar */}
          <div className="relative group flex-1 sm:flex-none sm:min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={16} />
            <input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Search reference ID or recipient..." 
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 outline-none text-sm transition-all shadow-sm placeholder:text-slate-400 font-medium" 
            />
          </div>
          
          {/* Dropdown Filter */}
          <div className="relative">
            <button 
              onClick={() => setOpenFilter(!openFilter)} 
              className={`w-full flex items-center justify-between sm:justify-start gap-3 px-5 py-2.5 border rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all ${
                openFilter ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Filter size={14} className={openFilter ? "text-orange-400" : "text-orange-500"} />
                <span>{statusFilter}</span>
              </div>
              <ChevronDown size={14} className={`transition-transform duration-200 flex-shrink-0 ${openFilter ? "rotate-180" : ""}`} />
            </button>

            {openFilter && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenFilter(false)} />
                <div className="absolute right-0 mt-2 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.15)] rounded-2xl p-1.5 w-56 z-50 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
                  <p className="text-[9px] font-black text-slate-400 px-3 py-1.5 uppercase tracking-widest border-b border-slate-50 mb-1">State Target</p>
                  {FILTER_STATUS_OPTIONS.map((s) => (
                    <button 
                      key={s} 
                      onClick={() => { setStatusFilter(s); setOpenFilter(false); }} 
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-[11px] font-bold uppercase transition-colors ${
                        statusFilter === s 
                          ? "bg-slate-900 text-white" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}