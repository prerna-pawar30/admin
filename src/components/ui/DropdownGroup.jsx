import React from "react";
import { ChevronDown } from "lucide-react";

export default function DropdownGroup({ label, options, ...props }) {
  return (
    <div className="flex flex-col gap-2 group">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-[#E68736] transition-colors">{label}</label>
      <div className="relative">
        <select
          className="w-full px-6 py-4 rounded-2xl border-2 border-orange-200 bg-slate-50/50 appearance-none outline-none text-sm font-bold text-slate-700 cursor-pointer focus:bg-white focus:border-orange-200 transition-all"
          {...props}
          onChange={e => props.onChange(e.target.value)}
        >
          <option value="">Select Option</option>
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}
