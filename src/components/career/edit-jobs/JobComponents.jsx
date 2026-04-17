import React from 'react';

export const Field = ({ label, value, onChange, type = "text" }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">
      {label}
    </label>
    <input 
      type={type} 
      className="w-full border-2 border-slate-100 rounded-xl p-3 bg-white text-sm font-bold focus:border-[#E68736] outline-none transition-all" 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)} 
    />
  </div>
);

export const SelectField = ({ label, value, options, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">
      {label}
    </label>
    <select 
      className="w-full border-2 border-slate-100 rounded-xl p-3 bg-white text-sm font-bold uppercase focus:border-[#E68736] outline-none" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
      ))}
    </select>
  </div>
);