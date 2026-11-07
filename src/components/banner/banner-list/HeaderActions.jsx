import { Plus, Image as ImageIcon } from "lucide-react";
import PageHeader, { SearchInput } from "../../ui/PageHeader";

const HeaderActions = ({ searchQuery, setSearchQuery, setCurrentPage, navigate }) => (
  <PageHeader
    icon={ImageIcon}
    title="Banners"
    description="Promotional banners shown on the website."
    actions={
      <>
        <SearchInput
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search banners…"
        />
        <button type="button" onClick={() => navigate("/marketing/banners/add")} className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600">
          <Plus size={16} strokeWidth={2.5} />
          Add banner
        </button>
      </>
    }
  />
);

export default HeaderActions;
