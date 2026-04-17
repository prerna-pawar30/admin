import React, { useState } from "react";
import Swal from "sweetalert2";
import { ChevronDown } from "lucide-react";
import { PermissionService } from "../../../backend/ApiService";

export default function PermissionCreator({ onRefresh }) {
  const [pageName, setPageName] = useState("");
  const [section, setSection] = useState("");
  const [action, setAction] = useState("create");

  // Permission actions
  const actions = [
    { value: "create", label: "CREATE" },
    { value: "read", label: "READ / VIEW" },
    { value: "update", label: "UPDATE" },
    { value: "delete", label: "DELETE" },
    { value: "remove", label: "REMOVE" },
    { value: "display", label: "DISPLAY" },
    { value: "export", label: "EXPORT" }
  ];

  /**
   * Generates permission string
   * Format: page.section.action
   * Example: product.listing.remove
   */
  const generateString = () => {
    if (!pageName.trim() || !section.trim()) return "waiting_for_input...";

    const cleanPage = pageName
      .toLowerCase()
      .trim()
      .replace(/[\s_-]+/g, ".");

    const cleanSection = section
      .toLowerCase()
      .trim()
      .replace(/[\s_-]+/g, ".");

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
      Swal.fire(
        "Error",
        err.response?.data?.message || "Creation failed",
        "error"
      );
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">

      <h2 className="text-[11px] font-black mb-8 text-orange-600 uppercase tracking-[0.2em] flex items-center gap-2">
        <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
        Registry Builder
      </h2>

      <div className="space-y-6">

        {/* PAGE NAME INPUT */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Page Name
          </label>

          <input
            type="text"
            placeholder="e.g. product"
            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 outline-none text-sm font-bold text-slate-700 focus:bg-white focus:border-orange-200 transition-all"
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
          />
        </div>

        {/* SECTION INPUT */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Section / Module
          </label>

          <input
            type="text"
            placeholder="e.g. listing or inventory"
            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 outline-none text-sm font-bold text-slate-700 focus:bg-white focus:border-orange-200 transition-all"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          />
        </div>

        {/* ACTION DROPDOWN */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Select Action
          </label>

          <div className="relative">
            <select
              className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 appearance-none outline-none text-sm font-bold text-slate-700 cursor-pointer focus:bg-white focus:border-orange-200 transition-all"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              {actions.map((act) => (
                <option key={act.value} value={act.value}>
                  {act.label}
                </option>
              ))}
            </select>

            <ChevronDown
              size={18}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>

        {/* PREVIEW STRING */}
        <div className="mt-4">
          <div className="bg-[#0F172A] rounded-2xl p-5 relative flex items-center min-h-[70px]">
            
            <div className="absolute top-2 right-4 text-[8px] font-black text-slate-600 uppercase">
              Dot-Notation Preview
            </div>

            <code className="text-orange-400 font-mono text-sm font-bold">
              {generateString()}
            </code>

          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleCreate}
          className="w-full bg-[#E68736] hover:bg-[#d5762a] text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-orange-100 uppercase text-xs tracking-[0.2em] active:scale-95 mt-2"
        >
          Add to Registry
        </button>

      </div>
    </div>
  );
}