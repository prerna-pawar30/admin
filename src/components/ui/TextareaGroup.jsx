import React from "react";

export default function TextareaGroup({ label, ...props }) {
  return (
    <div className="flex flex-col gap-2 group">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-[#E68736] transition-colors">{label}</label>
      <textarea
        className="w-full px-6 py-4 rounded-2xl border-2 border-orange-200 bg-slate-50/50 outline-none text-sm font-bold text-slate-700 leading-relaxed resize-none focus:bg-white focus:border-orange-200 transition-all"
        {...props}
        onChange={e => props.onChange(e.target.value)}
      />
    </div>
  );
}
