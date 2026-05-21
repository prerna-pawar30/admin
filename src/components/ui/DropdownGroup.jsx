import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function DropdownGroup({ label, options = [], value, onChange, icon, disabled }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find currently selected label
  const selectedOption = options.find(o => o.value === value);

  return (
    <div 
      ref={dropdownRef} 
      className={`flex flex-col gap-1 w-full relative group ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      {/* Scaled-down tiny high-density typography label */}
      {label && (
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-[#E68736] transition-colors">
          {label}
        </label>
      )}
      
      {/* Optimized responsive trigger wrapper container */}
      <div
        onClick={() => !disabled && setOpen(!open)}
        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 min-h-[38px] sm:min-h-[42px] rounded-xl border-2 bg-orange-50/30 cursor-pointer flex justify-between items-center text-xs sm:text-sm font-bold text-slate-700 hover:bg-white transition-all select-none ${
          open ? "border-[#E68736] bg-white ring-2 ring-orange-500/10" : "border-orange-100"
        }`}
      >
        <div className="flex items-center gap-2 truncate pr-1">
          {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : "Select Option"}
          </span>
        </div>
        <ChevronDown 
          size={14} 
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-[#E68736]" : ""}`} 
        />
      </div>

      {/* Floating Panel list context overlay */}
      {open && options.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[200px] z-[200] bg-white border border-orange-100 rounded-xl shadow-xl p-1.5 max-h-48 sm:max-h-60 overflow-y-auto origin-top transition-all">
          
          {options.map((o, idx) => {
            const isSelected = value === o.value;
            return (
              <div
                key={`${o.value}-${idx}`}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`flex items-center px-3 py-2 rounded-lg cursor-pointer text-xs font-bold transition-colors mb-0.5 last:mb-0 truncate ${
                  isSelected 
                    ? "bg-[#E68736] text-white" 
                    : o.value === "" 
                      ? "text-slate-400 hover:bg-orange-50/50" 
                      : "text-slate-700 hover:bg-orange-50"
                }`}
              >
                <span className="truncate">{o.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}