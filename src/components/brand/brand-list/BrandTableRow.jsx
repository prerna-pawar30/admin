import { HiPencil as HiPencilIcon, HiTrash as HiTrashIcon, HiDocumentDownload as HiDocIcon } from "react-icons/hi";
import { CalendarDays, RefreshCw } from "lucide-react";

export default function BrandTableRow({ brand, onEdit, onDelete, viewMode = "desktop" }) {
  const displayName = brand.brandName || "Unnamed Brand";
  const displayLogo = brand.logoUrl || "/placeholder-logo.png";

  // Helper function to format ISO date strings uniformly
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const categoryBadge = (f, i) => (
    <span
      key={f.fileId || i}
      className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-orange-50/60 text-orange-600 border border-orange-100/70 uppercase tracking-wide max-w-xs truncate"
    >
      <HiDocIcon size={12} className="flex-shrink-0" />
      <span className="truncate">
        {f.category?.name || (Array.isArray(f.category) ? f.category[0] : "General")}
      </span>
    </span>
  );

  // ── DESKTOP SCREEN VARIANT (md+) ──
  if (viewMode === "desktop") {
    return (
      <tr className="group">
        {/* Profile Card Identity column layout */}
        <td className="pl-6 pr-4 py-4 bg-white border-y border-l border-slate-100 rounded-l-xl group-hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 flex items-center justify-center border border-slate-100 rounded-xl p-1.5 bg-white flex-shrink-0 shadow-sm overflow-hidden">
              <img
                src={displayLogo}
                className="max-h-full max-w-full object-contain"
                alt={displayName}
                onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Logo"; }}
              />
            </div>
            <span className="font-bold text-slate-700 text-sm truncate max-w-xs">{displayName}</span>
          </div>
        </td>

        {/* Dynamic Registered Timestamps Column Meta Metrics */}
        <td className="px-4 py-4 bg-white border-y border-slate-100 group-hover:bg-slate-50/50 transition-colors">
          <div className="flex flex-col gap-1 text-[11px] font-semibold text-slate-500">
            <div className="flex items-center gap-1.5" title="Creation Date">
              <CalendarDays size={12} className="text-slate-400 flex-shrink-0" />
              <span>Created: <span className="text-slate-700 font-bold">{formatDate(brand.createdAt)}</span></span>
            </div>
            <div className="flex items-center gap-1.5" title="Last Systematic Modification Date">
              <RefreshCw size={11} className="text-slate-400 flex-shrink-0" />
              <span>Updated: <span className="text-slate-700 font-bold">{formatDate(brand.updatedAt)}</span></span>
            </div>
          </div>
        </td>

        {/* Connected Array File Tags Elements Block */}
        <td className="px-4 py-4 bg-white border-y border-slate-100 group-hover:bg-slate-50/50 transition-colors">
          <div className="flex gap-1.5 flex-wrap">
            {brand.files && brand.files.length > 0 ? (
              brand.files.map((f, i) => categoryBadge(f, i))
            ) : (
              <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest ml-1">No Assets Cataloged</span>
            )}
          </div>
        </td>

        {/* Configuration Manipulation Operators Button Node array panel */}
        <td className="pr-6 pl-4 py-4 bg-white border-y border-r border-slate-100 rounded-r-xl group-hover:bg-slate-50/50 transition-colors text-center">
          <div className="flex justify-center items-center gap-1.5">
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl transition-all shadow-sm bg-slate-50/60"
              title="Edit Brand"
            >
              <HiPencilIcon size={15} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all shadow-sm bg-slate-50/60"
              title="Delete Brand"
            >
              <HiTrashIcon size={15} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  // ── MOBILE VIEW VARIANT (< md viewport breakpoints) ──
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-11 w-11 flex items-center justify-center border border-slate-100 rounded-xl p-1 bg-white flex-shrink-0 shadow-sm overflow-hidden">
            <img
              src={displayLogo}
              className="max-h-full max-w-full object-contain"
              alt={displayName}
              onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Logo"; }}
            />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-slate-800 text-sm truncate">{displayName}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {brand.files?.length || 0} Registered Asset{brand.files?.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Action Controls Container layout row */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button 
            onClick={onEdit} 
            className="p-2 text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-100 rounded-lg transition-all"
          >
            <HiPencilIcon size={14} />
          </button>
          <button 
            onClick={onDelete} 
            className="p-2 text-rose-500 bg-slate-50 hover:bg-rose-50 border border-slate-100 rounded-lg transition-all"
          >
            <HiTrashIcon size={14} />
          </button>
        </div>
      </div>

      {/* Mobile Meta Row: Created & Updated Timestamps */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <CalendarDays size={12} className="text-slate-300 flex-shrink-0" />
          <span className="truncate">CR: <span className="text-slate-600 font-black">{formatDate(brand.createdAt)}</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <RefreshCw size={11} className="text-slate-300 flex-shrink-0" />
          <span className="truncate">UP: <span className="text-slate-600 font-black">{formatDate(brand.updatedAt)}</span></span>
        </div>
      </div>

      {brand.files && brand.files.length > 0 && (
        <div className="flex gap-1.5 flex-wrap pt-3 border-t border-slate-50">
          {brand.files.map((f, i) => categoryBadge(f, i))}
        </div>
      )}
    </div>
  );
}