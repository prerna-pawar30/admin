import { HiSearch as HiSearchIcon } from "react-icons/hi";
import { Plus } from "lucide-react";

export default function BrandTableHeader({ onSearch, onCreate }) {
  return (
    <div className="px-5 sm:px-6 lg:px-10 pt-6 sm:pt-8 pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">

        {/* Title */}
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-800 tracking-tight">
            Brand <span className="text-[#E68736]">Library</span>
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5">
            Manage your identities
          </p>
        </div>

        {/* Search + Create */}
        <div className="flex flex-col xs:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 lg:w-80">
            <HiSearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search brands…"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all font-semibold text-slate-600 text-sm placeholder:text-slate-400 placeholder:font-normal"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>

          <button
            onClick={onCreate}
            className="flex items-center justify-center gap-2 bg-[#E68736] text-white px-5 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#cf6e2e] active:scale-95 transition-all shadow-lg shadow-orange-100 whitespace-nowrap"
          >
            <Plus size={14} /> Create
          </button>
        </div>
      </div>
    </div>
  );
}