import { HiPencil as HiPencilIcon, HiTrash as HiTrashIcon, HiDocumentDownload as HiDocIcon } from "react-icons/hi";

export default function BrandTableRow({ brand, onEdit, onDelete }) {
  const displayName = brand.brandName || "Unnamed Brand";
  const displayLogo = brand.logoUrl || "/placeholder-logo.png";

  const categoryBadge = (f, i) => (
    <span
      key={f.fileId || i}
      className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 border border-orange-100 uppercase tracking-wide"
    >
      <HiDocIcon size={12} />
      {f.category?.name || (Array.isArray(f.category) ? f.category[0] : "General")}
    </span>
  );

  return (
    <>
      {/* ── Desktop Row (md+) ── */}
      <tr className="group hidden md:table-row">
        {/* Brand Identity */}
        <td className="px-6 lg:px-8 py-5 bg-white border-y border-l border-orange-100 rounded-l-2xl group-hover:bg-orange-50/20 transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 flex items-center justify-center border border-orange-100 rounded-xl p-2 bg-white flex-shrink-0 shadow-sm">
              <img
                src={displayLogo}
                className="max-h-full object-contain"
                alt={displayName}
                onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Logo"; }}
              />
            </div>
            <span className="font-bold text-slate-800 text-base">{displayName}</span>
          </div>
        </td>

        {/* Assets */}
        <td className="px-6 lg:px-8 py-5 bg-white border-y border-orange-100 group-hover:bg-orange-50/20 transition-colors">
          <div className="flex gap-2 flex-wrap">
            {brand.files && brand.files.length > 0
              ? brand.files.map((f, i) => categoryBadge(f, i))
              : <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">No Assets</span>
            }
          </div>
        </td>

        {/* Actions */}
        <td className="px-6 lg:px-8 py-5 bg-white border-y border-r border-orange-100 rounded-r-2xl text-center group-hover:bg-orange-50/20 transition-colors">
          <div className="flex justify-center gap-2">
            <button
              onClick={onEdit}
              className="p-2.5 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              title="Edit"
            >
              <HiPencilIcon size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2.5 text-red-500 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
              title="Delete"
            >
              <HiTrashIcon size={16} />
            </button>
          </div>
        </td>
      </tr>

      {/* ── Mobile Card (< md) ── */}
      <tr className="md:hidden">
        <td colSpan="3" className="px-1 py-1.5">
          <div className="bg-white border border-orange-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-12 w-12 flex items-center justify-center border border-orange-100 rounded-xl p-2 bg-white flex-shrink-0 shadow-sm">
                <img
                  src={displayLogo}
                  className="max-h-full object-contain"
                  alt={displayName}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Logo"; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-base truncate">{displayName}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
                  {brand.files?.length || 0} asset{brand.files?.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={onEdit} className="p-2.5 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                  <HiPencilIcon size={15} />
                </button>
                <button onClick={onDelete} className="p-2.5 text-red-500 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                  <HiTrashIcon size={15} />
                </button>
              </div>
            </div>

            {brand.files && brand.files.length > 0 && (
              <div className="flex gap-2 flex-wrap pt-2 border-t border-slate-100">
                {brand.files.map((f, i) => categoryBadge(f, i))}
              </div>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}