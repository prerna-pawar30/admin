import { Search, Plus } from "lucide-react";

const HeaderActions = ({ searchQuery, setSearchQuery, setCurrentPage, navigate }) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
    {/* Title Section */}
    <div className="text-left">
      <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">
        Store front Banners
      </h2>
      <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] md:text-xs tracking-[0.2em]">
        Global Promotional Assets
      </p>
    </div>

    {/* Controls Section */}
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
      {/* Search Input Container */}
      <div className="relative group flex-1 sm:flex-none">
        <Search 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" 
          size={18} 
        />
        <input
          type="text"
          placeholder="Search target..."
          className="w-full sm:w-64 md:w-80 pl-12 pr-6 py-3.5 bg-white rounded-2xl outline-none font-bold text-slate-600 focus:ring-4 focus:ring-orange-500/10 transition-all border border-orange-200 focus:border-orange-500"
          value={searchQuery}
          onChange={(e) => { 
            setSearchQuery(e.target.value); 
            setCurrentPage(1); 
          }}
        />
      </div>

      {/* Action Button */}
      <button
        onClick={() => navigate("marketing/banners/add")}
        className="flex items-center justify-center gap-2 px-8 py-4 bg-[#E68736] hover:bg-[#d1762d] text-white font-black rounded-2xl  uppercase text-[11px] tracking-widest transition-all active:scale-95 whitespace-nowrap"
      >
        <Plus size={18} strokeWidth={3} />
        <span>Create New</span>
      </button>
    </div>
  </div>
);

export default HeaderActions;