import { SearchInput } from "../../ui/PageHeader";

const SearchBar = ({ searchTerm, setSearchTerm }) => (
  <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or email…" />
);

export default SearchBar;
