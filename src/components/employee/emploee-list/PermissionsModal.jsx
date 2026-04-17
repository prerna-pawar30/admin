import React from "react";
import { HiX, HiShieldCheck } from "react-icons/hi";

const PermissionsModal = ({ employee, onClose }) => {
  if (!employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tighter">Member Privileges</h3>
            <p className="text-xs text-slate-500 font-bold">{employee.firstName} {employee.lastName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors">
            <HiX size={20} />
          </button>
        </div>
        <div className="p-8 max-h-[50vh] overflow-y-auto">
          <div className="grid gap-2">
            {employee.permissions?.length > 0 ? employee.permissions.map((p) => (
              <div key={p} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl">
                <HiShieldCheck className="text-emerald-500" size={18} />
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{p.replace("_", " ")}</span>
              </div>
            )) : <p className="text-center text-slate-400 py-4 text-xs font-bold uppercase">No special privileges</p>}
          </div>
        </div>
        <div className="p-6 bg-slate-50">
          <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Close View</button>
        </div>
      </div>
    </div>
  );
};

export default PermissionsModal;