import { Plus, Tag } from "lucide-react";
import PageHeader, { SearchInput } from "../../ui/PageHeader";

export default function BrandTableHeader({ onSearch, onCreate, count }) {
  return (
    <PageHeader
      icon={Tag}
      title="Brands"
      badge={count ? `${count} total` : undefined}
      description="Manage the brands shown across your product catalog."
      actions={
        <>
          <SearchInput onChange={(e) => onSearch(e.target.value)} placeholder="Search brands…" />
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add brand
          </button>
        </>
      }
    />
  );
}
