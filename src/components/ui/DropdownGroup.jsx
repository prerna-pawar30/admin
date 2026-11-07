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
      className={`flex flex-col gap-1.5 w-full relative group ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      {/* Scaled-down tiny high-density typography label */}
      {label && (
        <label className="text-xs font-semibold text-slate-600 transition-colors group-focus-within:text-brand-600">
          {label}
        </label>
      )}
      
      {/* Optimized responsive trigger wrapper container */}
      <div
        onClick={() => !disabled && setOpen(!open)}
        className={`w-full px-3.5 h-10 rounded-xl border bg-white shadow-sm cursor-pointer flex justify-between items-center text-sm text-slate-800 transition-colors select-none ${
          open ? "border-brand-400 ring-4 ring-brand-500/10" : "border-slate-200 hover:border-slate-300"
        } ${selectedOption ? "" : "text-slate-400"}`}
      >
        <div className="flex items-center gap-2 truncate pr-1">
          {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : "Select an option"}
          </span>
        </div>
        <ChevronDown 
          size={14} 
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-brand-500" : ""}`} 
        />
      </div>

      {/* Floating Panel list context overlay */}
      {open && options.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[200px] z-[200] bg-white border border-slate-200 rounded-xl shadow-lg p-1 max-h-48 sm:max-h-60 overflow-y-auto origin-top transition-all">
          
          {options.map((o, idx) => {
            const isSelected = value === o.value;
            return (
              <div
                key={`${o.value}-${idx}`}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`flex items-center px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors mb-0.5 last:mb-0 truncate ${
                  isSelected 
                    ? "bg-brand-50 font-semibold text-brand-700" 
                    : o.value === "" 
                      ? "text-slate-400 hover:bg-slate-50" 
                      : "text-slate-700 hover:bg-slate-100"
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