import { HiSearch as HiSearchIcon } from "react-icons/hi";
import { Plus } from "lucide-react";

export default function BrandTableHeader({ onSearch, onCreate }) {
  return (
    <div className="p-6 sm:p-8 border-b border-slate-100 mb-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

        {/* Brand Information Segment */}
        <div className="text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Brand <span className="text-[#E68736]">Library</span>
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            Maintain organizational asset records and configuration listings
          </p>
        </div>

        {/* Operational Filter Control Subgroup Module */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:w-auto">
          <div className="relative flex-grow sm:w-72 lg:w-80">
            <HiSearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search brand identities..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-[#E68736] transition-all font-semibold text-slate-700 text-sm placeholder:text-slate-400 placeholder:font-normal"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>

          <button
            onClick={onCreate}
            className="inline-flex items-center justify-center gap-2 bg-[#E68736] text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#cf6e2e] active:scale-[0.98] transition-all shadow-md shadow-orange-100 whitespace-nowrap"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Create Brand</span>
          </button>
        </div>

      </div>
    </div>
  );
}