import React, { useState } from "react";
import Swal from "sweetalert2";
import { ChevronDown, Key, Plus } from "lucide-react";
import { PermissionService } from "../../../backend/ApiService";

export default function PermissionCreator({ onRefresh }) {
  const [pageName, setPageName] = useState("");
  const [section, setSection] = useState("");
  const [action, setAction] = useState("create");

  const actions = [
    { value: "create", label: "CREATE" },
    { value: "read", label: "READ / VIEW" },
    { value: "update", label: "UPDATE" },
    { value: "delete", label: "DELETE" },
    { value: "remove", label: "REMOVE" },
    { value: "cancel", label: "CANCEL" },
    { value: "generate", label: "GENERATE" },
    { value: "download", label: "DOWNLOAD" },
    { value: "process", label: "PROCESS" },
    { value: "status", label: "STATUS" },
    { value: "assign", label: "ASSIGN" },
    { value: "display", label: "DISPLAY" },
    { value: "export", label: "EXPORT" },
    { value: "access", label: "ACCESS" },
    { value: "revoke", label: "REVOKE" },
  ];

  const generateString = () => {
    if (!pageName.trim() || !section.trim()) return "waiting_for_input...";
    const cleanPage = pageName.toLowerCase().trim().replace(/[\s_-]+/g, ".");
    const cleanSection = section.toLowerCase().trim().replace(/[\s_-]+/g, ".");
    return `${cleanPage}.${cleanSection}.${action}`;
  };

  const handleCreate = async () => {
    if (!pageName.trim() || !section.trim()) {
      return Swal.fire("Required", "Please enter page name and section", "warning");
    }

    const finalPermission = generateString();

    try {
      await PermissionService.createPermission(finalPermission);
      Swal.fire({
        icon: "success",
        title: "Permission Created",
        text: `${finalPermission} added to registry`,
        timer: 2000,
        showConfirmButton: false
      });
      setPageName("");
      setSection("");
      if (onRefresh) onRefresh();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Creation failed", "error");
    }
  };

  const inputCls = "w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border-2 border-orange-100 bg-slate-50 outline-none text-sm font-bold text-slate-700 focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-slate-400 placeholder:font-normal";

  return (
    <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-orange-100 overflow-hidden">

      {/* Header */}
      <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-orange-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
          <Key size={15} className="text-orange-600" />
        </div>
        <div>
          <h2 className="text-sm font-black text-slate-800 tracking-tight">Registry Builder</h2>
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
            Create Permission Labels
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">

        {/* Page Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Page Name
          </label>
          <input
            type="text"
            placeholder="e.g. product"
            className={inputCls}
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
          />
        </div>

        {/* Section */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Section / Module
          </label>
          <input
            type="text"
            placeholder="e.g. listing or inventory"
            className={inputCls}
            value={section}
            onChange={(e) => setSection(e.target.value)}
          />
        </div>

        {/* Action Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Select Action
          </label>
          <div className="relative">
            <select
              className={inputCls + " appearance-none pr-10 cursor-pointer"}
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              {actions.map((act) => (
                <option key={act.value} value={act.value}>{act.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Preview */}
        <div className="bg-slate-900 rounded-xl px-4 sm:px-5 py-4 relative min-h-[64px] flex flex-col justify-center">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
            Dot-Notation Preview
          </p>
          <code className="text-orange-400 font-mono text-xs sm:text-sm font-bold break-all leading-relaxed">
            {generateString()}
          </code>
        </div>

        {/* Submit */}
        <button
          onClick={handleCreate}
          className="w-full bg-[#E68736] hover:bg-[#d5762a] text-white font-black py-3.5 sm:py-4 rounded-xl transition-all shadow-lg shadow-orange-100 uppercase text-xs tracking-[0.2em] active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus size={14} />
          Add to Registry
        </button>

      </div>
    </div>
  );
}