import { SearchInput } from "../../ui/PageHeader";

const InvoiceSearch = ({ searchTerm, setSearchTerm }) => (
  <div className="mb-5">
    <SearchInput
      className="sm:w-full sm:max-w-md"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search by customer or company…"
    />
  </div>
);

export default InvoiceSearch;
