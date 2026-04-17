import React from "react";
import { HiSearch } from "react-icons/hi";

const SearchBar = ({ searchTerm, setSearchTerm }) => (
  <div className="relative group">
    <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E68736] transition-colors" />
    <input
      type="text"
      placeholder="Search by name or email..."
      className="w-full md:w-80 pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl shadow-sm outline-none focus:border-[#E68736] transition-all text-sm font-bold"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
);

export default SearchBar;