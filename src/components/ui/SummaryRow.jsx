import React from "react";

export default function SummaryRow({ label, value, active }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-bold ${active ? "text-[#E68736]" : "text-[#E68736]"}`}>{value}</span>
    </div>
  );
}
