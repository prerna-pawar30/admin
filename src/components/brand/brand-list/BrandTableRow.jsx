import { useState } from "react";
import { HiPencil as HiPencilIcon, HiTrash as HiTrashIcon, HiDocumentText as HiDocIcon } from "react-icons/hi";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

function BrandLogo({ src, name, size = "h-11 w-11" }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1`}>
      {src && !failed ? (
        <img src={src} alt={name} className="max-h-full max-w-full object-contain" onError={() => setFailed(true)} />
      ) : (
        <span className="text-sm font-bold text-slate-400">{name?.[0]?.toUpperCase() || "?"}</span>
      )}
    </div>
  );
}

const DocBadge = ({ f }) => (
  <span className="inline-flex max-w-[180px] items-center gap-1 truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
    <HiDocIcon size={12} className="shrink-0 text-slate-400" />
    <span className="truncate">{f.category?.name || (Array.isArray(f.category) ? f.category[0] : "General")}</span>
  </span>
);

const iconBtn =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors";

export default function BrandTableRow({ brand, onEdit, onDelete, viewMode = "desktop" }) {
  const displayName = brand.brandName || "Unnamed brand";
  const files = brand.files || [];

  const actions = (
    <div className="flex items-center justify-end gap-1.5">
      <button type="button" onClick={onEdit} className={`${iconBtn} hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600`} title="Edit brand" aria-label="Edit brand">
        <HiPencilIcon size={15} />
      </button>
      <button type="button" onClick={onDelete} className={`${iconBtn} hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600`} title="Delete brand" aria-label="Delete brand">
        <HiTrashIcon size={15} />
      </button>
    </div>
  );

  if (viewMode === "desktop") {
    return (
      <tr className="transition-colors hover:bg-slate-50/60">
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-3">
            <BrandLogo src={brand.logoUrl} name={displayName} />
            <span className="max-w-xs truncate text-sm font-semibold text-slate-800">{displayName}</span>
          </div>
        </td>
        <td className="px-5 py-3.5 text-sm text-slate-600">{formatDate(brand.createdAt)}</td>
        <td className="px-5 py-3.5 text-sm text-slate-500">{formatDate(brand.updatedAt)}</td>
        <td className="px-5 py-3.5">
          <div className="flex flex-wrap gap-1.5">
            {files.length ? files.map((f, i) => <DocBadge key={f.fileId || i} f={f} />) : <span className="text-sm text-slate-400">—</span>}
          </div>
        </td>
        <td className="px-5 py-3.5">{actions}</td>
      </tr>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo src={brand.logoUrl} name={displayName} size="h-10 w-10" />
          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold text-slate-800">{displayName}</h4>
            <p className="mt-0.5 text-xs text-slate-500">
              Updated {formatDate(brand.updatedAt)} · {files.length} document{files.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {actions}
      </div>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {files.map((f, i) => (
            <DocBadge key={f.fileId || i} f={f} />
          ))}
        </div>
      )}
    </div>
  );
}
