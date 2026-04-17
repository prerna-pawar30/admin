import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ totalItems = 0, itemsPerPage = 10, currentPage, setCurrentPage }) => {
  const safeItemsPerPage = itemsPerPage > 0 ? itemsPerPage : 10;
  const totalPages = Math.ceil(totalItems / safeItemsPerPage);

  if (totalItems <= 0 || totalPages <= 1) return null;

  // Logic to show only a few page numbers (e.g., 2 before and 2 after current)
  const getPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="px-10 py-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
        Showing {((currentPage - 1) * safeItemsPerPage) + 1} - {Math.min(currentPage * safeItemsPerPage, totalItems)} of {totalItems}
      </p>
      
      <div className="flex items-center gap-2">
        <button 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(1)} // Go to first
          className="p-2 text-slate-400 disabled:opacity-20 hover:text-orange-500"
        >
          First
        </button>

        <button 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(prev => prev - 1)} 
          className="p-2.5 rounded-xl border border-slate-200 text-slate-400 disabled:opacity-20 hover:bg-white transition-all"
        >
          <ChevronLeft size={18}/>
        </button>

        <div className="flex gap-1">
          {getPageNumbers().map((page) => (
            <button 
              key={page} 
              onClick={() => setCurrentPage(page)} 
              className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                currentPage === page 
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-200" 
                  : "text-slate-400 hover:bg-white"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button 
          disabled={currentPage === totalPages} 
          onClick={() => setCurrentPage(prev => prev + 1)} 
          className="p-2.5 rounded-xl border border-slate-200 text-slate-400 disabled:opacity-20 hover:bg-white transition-all"
        >
          <ChevronRight size={18}/>
        </button>
      </div>
    </div>
  );
};

export default Pagination;