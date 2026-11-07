import React from "react";

export default function InputGroup({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 group">
      <label className="text-xs font-semibold text-slate-600 transition-colors group-focus-within:text-brand-600">{label}</label>
      <input
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300"
        {...props}
        onChange={e => props.onChange ? props.onChange(e.target.value) : null}
      />
    </div>
  );
}
