import React from "react";

export default function RadioSetting({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-2 flex-1">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="flex bg-white rounded-xl p-1 border border-slate-100 shadow-inner">
        {["PRODUCT", "VARIANT"].map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${value === opt ? "bg-[#E68736] text-white shadow-md" : "text-slate-400 hover:text-slate-600"}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
