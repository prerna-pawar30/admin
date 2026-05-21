import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function DropdownGroup({ label, options, value, onChange }) {
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
    <div ref={dropdownRef} className="flex flex-col gap-2 relative group">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-[#E68736] transition-colors">
        {label}
      </label>
      
      <div
        onClick={() => setOpen(!open)}
        className={`w-full px-6 py-4 rounded-2xl border-2 bg-orange-50/50 cursor-pointer flex justify-between items-center text-sm font-bold text-slate-700 hover:bg-white transition-all ${
          open ? "border-[#E68736] bg-white" : "border-orange-200"
        }`}
      >
        <span>{selectedOption ? selectedOption.label : "Select Option"}</span>
        <ChevronDown 
          size={18} 
          className={`text-slate-400 transition-transform ${open ? "rotate-180 text-[#E68736] " : ""}`} 
        />
      </div>

      {open && (
        <div className="absolute top-[100%] mt-2 w-full z-[150] bg-white border border-orange-200 rounded-2xl shadow-2xl p-2 max-h-56 overflow-y-auto">
          {/* Default blank state option */}
          <div
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="flex items-center p-3 hover:bg-orange-50 rounded-xl cursor-pointer text-xs font-bold text-slate-400"
          >
            Select Option
          </div>
          
          {options.map(o => (
            <div
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`flex items-center p-3 rounded-xl cursor-pointer text-xs font-bold transition-colors ${
                value === o.value 
                  ? "bg-[#E68736] text-white" 
                  : "text-slate-700 hover:bg-orange-50"
              }`}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}