import { HiPencil as HiPencilIcon, HiTrash as HiTrashIcon, HiDocumentDownload as HiDocIcon } from "react-icons/hi";

export default function BrandTableRow({ brand, onEdit, onDelete }) {
  // Syncing with your JSON structure: brandName and logoUrl
  const displayName = brand.brandName || "Unnamed Brand";
  const displayLogo = brand.logoUrl || "/placeholder-logo.png";

  return (
    <tr className="group">
      <td className="px-8 py-6 bg-white border-y border-l border-orange-100 rounded-l-[2.5rem] group-hover:bg-orange-50/10 transition-colors">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 flex items-center justify-center border border-orange-100 rounded-2xl p-2 bg-white flex-shrink-0 shadow-sm">
            <img 
              src={displayLogo} 
              className="max-h-full object-contain" 
              alt={displayName} 
              onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Logo"; }}
            />
          </div>
          <span className="font-bold text-slate-800 text-lg">{displayName}</span>
        </div>
      </td>
      <td className="px-8 py-6 bg-white border-y border-orange-100 group-hover:bg-orange-50/10 transition-colors">
        <div className="flex gap-2 flex-wrap">
            {brand.files && brand.files.length > 0 ? (
              brand.files.map((f, i) => (
                <span key={f.fileId || i} className="...">
                  <HiDocIcon size={14}/> 
                  {/* Update this line to handle the object structure */}
                  {f.category?.name || (Array.isArray(f.category) ? f.category[0] : "General")}
                </span>
              ))
            ) : (
            <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">No Assets</span>
          )}
        </div>
      </td>
      <td className="px-8 py-6 bg-white border-y border-r border-orange-100 rounded-r-[2.5rem] text-center">
        <div className="flex justify-center gap-3">
          <button onClick={onEdit} className="p-3 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
            <HiPencilIcon/>
          </button>
          <button onClick={onDelete} className="p-3 text-red-600 bg-red-50 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
            <HiTrashIcon/>
          </button>
        </div>
      </td>
    </tr>
  );
}