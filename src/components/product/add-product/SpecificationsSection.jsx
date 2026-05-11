import React from "react";
import { Info, Trash2, Plus } from "lucide-react";

export default function SpecificationsSection({ specifications, setSpecifications }) {
  const addSpec = () => setSpecifications([...specifications, { key: "", value: "" }]);
  
  const removeSpec = (idx) => setSpecifications(specifications.filter((_, i) => i !== idx));
  
  const updateSpec = (idx, field, val) => {
    let ns = [...specifications];
    ns[idx][field] = val;
    setSpecifications(ns);
  };

  return (
    <section className="bg-white rounded-[2rem] border border-orange-100 p-6 md:p-8 space-y-6 shadow-sm">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-50 rounded-lg">
            <Info className="text-[#E68736]" size={20} />
          </div>
          <h2 className="font-black text-slate-800 text-sm md:text-lg uppercase tracking-tight">
            Technical Specs
          </h2>
        </div>
        <button 
          onClick={addSpec} 
          className="flex items-center gap-1 text-[#E68736] text-[10px] md:text-xs font-black uppercase tracking-widest hover:opacity-70 transition-opacity"
        >
          <Plus size={14} strokeWidth={3} />
          <span>Add Spec</span>
        </button>
      </div>

      {/* List Section */}
      <div className="space-y-4">
        {specifications.map((s, i) => (
          <div 
            key={i} 
            className="relative flex flex-col md:flex-row gap-3 md:gap-4 p-4 md:p-0 bg-slate-50/50 md:bg-transparent rounded-2xl border border-slate-100 md:border-none"
          >
            {/* Key Input */}
            <div className="flex-1 space-y-1">
              <label className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Property</label>
              <input 
                className="w-full p-3 bg-white md:bg-slate-50 rounded-xl border border-orange-200 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-orange-500/5 transition-all" 
                placeholder="e.g. Weight" 
                value={s.key} 
                onChange={e => updateSpec(i, 'key', e.target.value)} 
              />
            </div>

            {/* Value Input */}
            <div className="flex-1 space-y-1">
              <label className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Value</label>
              <input 
                className="w-full p-3 bg-white md:bg-slate-50 rounded-xl border border-orange-200 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-orange-500/5 transition-all" 
                placeholder="e.g. 500g" 
                value={s.value} 
                onChange={e => updateSpec(i, 'value', e.target.value)} 
              />
            </div>

            {/* Delete Button */}
            <button 
              onClick={() => removeSpec(i)} 
              className="absolute top-2 right-2 md:relative md:top-0 md:right-0 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 md:hover:bg-transparent rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {specifications.length === 0 && (
          <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No specifications added</p>
          </div>
        )}
      </div>
    </section>
  );
}