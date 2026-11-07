import { ChevronLeft, ChevronRight } from "lucide-react";

/** Shared pagination bar: "Showing x–y of z" + compact page buttons. Responsive. */
const Pagination = ({ totalItems = 0, itemsPerPage = 10, currentPage, setCurrentPage }) => {
  const perPage = itemsPerPage > 0 ? itemsPerPage : 10;
  const totalPages = Math.ceil(totalItems / perPage);

  if (totalItems <= 0 || totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  const btn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="flex flex-col items-center justify-between gap-3 px-1 py-3 sm:flex-row">
      <p className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * perPage + 1}</span>–
        <span className="font-semibold text-slate-700">{Math.min(currentPage * perPage, totalItems)}</span> of{" "}
        <span className="font-semibold text-slate-700">{totalItems}</span>
      </p>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className={`${btn} border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {start > 1 && (
          <>
            <button type="button" onClick={() => setCurrentPage(1)} className={`${btn} border-transparent text-slate-600 hover:bg-slate-100`}>
              1
            </button>
            {start > 2 && <span className="px-1 text-slate-400">…</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            type="button"
            key={page}
            onClick={() => setCurrentPage(page)}
            aria-current={currentPage === page ? "page" : undefined}
            className={`${btn} ${
              currentPage === page
                ? "border-brand-500 bg-brand-500 text-white shadow-sm"
                : "border-transparent text-slate-600 hover:bg-slate-100"
            }`}
          >
            {page}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
            <button type="button" onClick={() => setCurrentPage(totalPages)} className={`${btn} border-transparent text-slate-600 hover:bg-slate-100`}>
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className={`${btn} border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
