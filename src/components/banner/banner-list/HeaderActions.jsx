import React from 'react';
import { Search, Plus } from "lucide-react";

const HeaderActions = ({ searchQuery, setSearchQuery, setCurrentPage, navigate }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
    {/* Title Section */}
    <div className="text-left">
      <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
        Storefront <span className="text-[#E68736]">Banners</span>
      </h2>
      <p className="text-slate-400 text-sm mt-1">Manage global web storefront promotional placement channels</p>
    </div>

    {/* Controls Section */}
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
      {/* Search Bar container */}
      <div className="relative w-full sm:w-72">
        <Search 
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" 
          size={18} 
        />
        <input
          type="text"
          placeholder="Search targets..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#E68736] focus:ring-1 focus:ring-[#E68736] outline-none text-sm font-medium text-slate-700 placeholder-slate-400 transition-all"
          value={searchQuery}
          onChange={(e) => { 
            setSearchQuery(e.target.value); 
            setCurrentPage(1); 
          }}
        />
      </div>

      {/* Primary Action Button */}
      <button
        onClick={() => navigate("/marketing/banners/add")}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E68736] text-white px-5 py-2.5 rounded-xl hover:bg-[#cf6e2e] active:scale-[0.98] transition-all font-bold text-sm shadow-md shadow-orange-100 whitespace-nowrap"
      >
        <Plus size={16} strokeWidth={2.5} />
        <span>Create New</span>
      </button>
    </div>
  </div>
);

export default HeaderActions;