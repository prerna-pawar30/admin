import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function MultiSelectGroup({ label, options, values, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2 relative group">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-[#E68736] transition-colors">{label}</label>
      <div
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 rounded-2xl border-2 border-orange-200 bg-slate-50/50 cursor-pointer flex justify-between items-center text-sm font-bold text-slate-700 hover:bg-white transition-all"
      >
        <span>{values.length > 0 ? `${values.length} Brands Assigned` : "Assign Brand..."}</span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="absolute top-[100%] mt-2 w-full z-[150] bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 max-h-56 overflow-y-auto">
          {options.map(o => (
            <div
              key={o.value}
              onClick={() => {
                const next = values.includes(o.value)
                  ? values.filter(v => v !== o.value)
                  : [...values, o.value];
                onChange(next);
              }}
              className="flex items-center gap-3 p-3 hover:bg-orange-50 rounded-xl cursor-pointer"
            >
              <div
                className={`w-4 h-4 rounded border-2 ${values.includes(o.value) ? "bg-[#E68736] border-[#E68736]" : "border-slate-200"}`}
              />
              <span className="text-xs font-bold">{o.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
