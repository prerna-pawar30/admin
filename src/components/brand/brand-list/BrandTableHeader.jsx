import { HiSearch as HiSearchIcon } from "react-icons/hi";

export default function BrandTableHeader({ onSearch, onCreate }) {
  return (
    <div className="p-6 md:p-10 pb-0">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        {/* Title Section */}
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
            Brand <span className="text-[#E68736]">Library</span>
          </h2>
          <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-2">
            Manage your identities
          </p>
        </div>
        
        {/* Search and Action Section */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-80">
            <HiSearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search brands..." 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-orange-100 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-bold text-slate-600" 
              onChange={(e) => onSearch(e.target.value)} 
            />
          </div>
          
          <button 
            onClick={onCreate} 
            className="bg-[#E68736] text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#cf6e2e] transition-all shadow-lg shadow-orange-100"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}