import React, { useState } from "react";
import Swal from "sweetalert2";
import { KeyRound, Plus } from "lucide-react";
import { PermissionService } from "../../../backend/ApiService";

/**
 * Builds a permission name as `page.section.action` (e.g. `product.inventory.update`) and adds
 * it to the registry. The backend accepts 2–50 characters.
 */

const ACTIONS = [
  "create",
  "read",
  "update",
  "delete",
  "remove",
  "cancel",
  "generate",
  "download",
  "process",
  "status",
  "assign",
  "display",
  "export",
  "access",
  "revoke",
];

const MAX_LENGTH = 50;

const slug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s._-]/g, "")
    .replace(/[\s_-]+/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "");

const inputCls =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10";

export default function PermissionCreator({ onRefresh }) {
  const [pageName, setPageName] = useState("");
  const [section, setSection] = useState("");
  const [action, setAction] = useState("create");
  const [isSaving, setIsSaving] = useState(false);

  const page = slug(pageName);
  const sec = slug(section);
  const finalPermission = page && sec ? `${page}.${sec}.${action}` : "";
  const isTooLong = finalPermission.length > MAX_LENGTH;

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!finalPermission) {
      Swal.fire("Missing details", "Enter a page name and a section.", "warning");
      return;
    }
    if (isTooLong) {
      Swal.fire("Name too long", `Permission names can be at most ${MAX_LENGTH} characters.`, "warning");
      return;
    }

    setIsSaving(true);
    try {
      await PermissionService.createPermission(finalPermission);
      Swal.fire({ icon: "success", title: "Permission created", text: finalPermission, timer: 1800, showConfirmButton: false });
      setPageName("");
      setSection("");
      onRefresh?.();
    } catch (err) {
      Swal.fire("Could not create", err.response?.data?.message || "Creation failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <header className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <KeyRound size={17} />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-800">Create permission</h2>
          <p className="text-xs text-slate-500">Format: page.section.action</p>
        </div>
      </header>

      <form onSubmit={handleCreate} className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="min-w-0">
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Page</label>
            <input type="text" placeholder="e.g. product" className={inputCls} value={pageName} onChange={(e) => setPageName(e.target.value)} />
          </div>
          <div className="min-w-0">
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Section</label>
            <input type="text" placeholder="e.g. inventory" className={inputCls} value={section} onChange={(e) => setSection(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Action</label>
          <div className="flex flex-wrap gap-1.5">
            {ACTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setAction(item)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-colors ${
                  action === item ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-slate-900 px-4 py-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Preview</span>
            {finalPermission && (
              <span className={`text-[11px] font-semibold ${isTooLong ? "text-rose-400" : "text-slate-500"}`}>
                {finalPermission.length}/{MAX_LENGTH}
              </span>
            )}
          </div>
          <code className={`block break-all font-mono text-sm font-semibold ${finalPermission ? "text-brand-400" : "text-slate-500"}`}>
            {finalPermission || "page.section.action"}
          </code>
        </div>

        <button
          type="submit"
          disabled={isSaving || !finalPermission || isTooLong}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Plus size={16} />}
          Add permission
        </button>
      </form>
    </section>
  );
}