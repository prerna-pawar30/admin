import React, { useState } from "react";
import { Filter, ChevronDown, Truck } from "lucide-react";
import PageHeader, { SearchInput } from "../../ui/PageHeader";
import { FILTER_STATUS_OPTIONS } from "./OrderConstants";

export default function DashboardHeader({ query, setQuery, statusFilter, setStatusFilter }) {
  const [openFilter, setOpenFilter] = useState(false);

  return (
    <PageHeader
      icon={Truck}
      title="Order Tracking"
      description="Track orders and update their fulfilment status."
      actions={
        <>
          <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order ID or customer…" />
          {/* Dropdown Filter */}
          <div className="relative">
            <button 
              onClick={() => setOpenFilter(!openFilter)} 
              className={`flex h-10 w-full items-center justify-between gap-3 rounded-xl border px-3.5 text-sm font-medium capitalize shadow-sm transition-colors sm:w-auto sm:justify-start ${
                openFilter ? 'border-brand-400 bg-white text-slate-900 ring-4 ring-brand-500/10' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-400" />
                <span>{statusFilter}</span>
              </div>
              <ChevronDown size={14} className={`transition-transform duration-200 flex-shrink-0 ${openFilter ? "rotate-180" : ""}`} />
            </button>

            {openFilter && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenFilter(false)} />
                <div className="absolute right-0 mt-2 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.15)] rounded-2xl p-1.5 w-56 z-50 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
                  <p className="text-[11px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider border-b border-slate-50 mb-1">Filter by status</p>
                  {FILTER_STATUS_OPTIONS.map((s) => (
                    <button 
                      key={s} 
                      onClick={() => { setStatusFilter(s); setOpenFilter(false); }} 
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm capitalize transition-colors ${
                        statusFilter === s 
                          ? "bg-brand-50 font-semibold text-brand-700" 
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
        </>
      }
    />
  );
}