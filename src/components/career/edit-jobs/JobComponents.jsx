import React from 'react';

export const Field = ({ label, value, onChange, type = "text" }) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block ml-0.5">
      {label}
    </label>
    <input 
      type={type} 
      className="w-full border border-slate-200/80 rounded-xl px-3 py-2 bg-white text-sm font-semibold text-slate-800 focus:border-[#E68736] focus:ring-1 focus:ring-[#E68736]/10 outline-none transition-all duration-150" 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)} 
    />
  </div>
);

export const SelectField = ({ label, value, options, onChange }) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block ml-0.5">
      {label}
    </label>
    <div className="relative">
      <select 
        className="w-full border border-slate-200/80 rounded-xl px-3 py-2 bg-white text-sm font-bold text-slate-700 uppercase focus:border-[#E68736] outline-none transition-all duration-150 appearance-none cursor-pointer pr-8" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(opt => (
          <option key={opt} value={opt} className="normal-case font-medium text-slate-800">
            {opt.replace('_', ' ')}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);