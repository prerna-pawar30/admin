import React from "react";
import { HiSearch, HiPencil } from "react-icons/hi";
import { PlusCircle, Trash2, Box } from "lucide-react";

export default function ProductTableView({
  products, query, setQuery, onEdit, onDelete, onDuplicate
}) {
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(query.toLowerCase()) ||
    p.sku?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-full space-y-5">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Product inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and scale your dental surgical catalog.</p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-lg px-3 py-2.5 w-full sm:w-72 focus-within:border-[#E68736] transition-colors">
          <HiSearch className="text-gray-400 text-base flex-shrink-0" />
          <input
            value={query}
            placeholder="Search by name or SKU…"
            className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-300"
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-gray-300 hover:text-gray-500 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3.5 text-[11px] font-medium text-gray-400 uppercase tracking-wide">Product</th>
                <th className="px-5 py-3.5 text-[11px] font-medium text-gray-400 uppercase tracking-wide">Brand</th>
                <th className="px-5 py-3.5 text-[11px] font-medium text-gray-400 uppercase tracking-wide">SKU</th>
                <th className="px-5 py-3.5 text-[11px] font-medium text-gray-400 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3.5 text-[11px] font-medium text-gray-400 uppercase tracking-wide text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((item) => (
                <tr key={item.productId} className="hover:bg-gray-50/60 transition-colors group">

                  {/* Product info */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Box size={18} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 group-hover:text-[#E68736] transition-colors truncate max-w-[200px]">
                          {item.name || <span className="text-gray-300 italic font-normal">Unnamed</span>}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.category?.name || "Uncategorized"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Brand */}
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-600">
                      {item.brand?.[0]?.brandName || (
                        <span className="text-gray-300 italic">No brand</span>
                      )}
                    </span>
                  </td>

                  {/* SKU */}
                  <td className="px-5 py-4">
                    <span className="text-xs font-mono text-[#E68736] bg-orange-50 border border-orange-100 px-2 py-1 rounded">
                      {item.sku || "—"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border
                      ${item.status === "active"
                        ? "bg-green-50 border-green-100 text-green-600"
                        : "bg-orange-50 border-orange-100 text-[#E68736]"
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5
                        ${item.status === "active" ? "bg-green-500" : "bg-[#E68736]"}`}
                      />
                      {item.status === "active" ? "Active" : "Draft"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(item.productId)}
                        title="Edit"
                        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:border-[#E68736] hover:text-[#E68736] hover:bg-orange-50 transition-colors"
                      >
                        <HiPencil size={15} />
                      </button>
                      <button
                        onClick={() => onDuplicate(item.productId)}
                        title="Duplicate"
                        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <PlusCircle size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(item.productId)}
                        title="Delete"
                        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredProducts.map((item) => (
            <div key={item.productId} className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Box size={18} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.name || "Unnamed Product"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.category?.name || "Uncategorized"} · {item.brand?.[0]?.brandName || "No brand"}
                  </p>
                </div>
                <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border
                  ${item.status === "active"
                    ? "bg-green-50 border-green-100 text-green-600"
                    : "bg-orange-50 border-orange-100 text-[#E68736]"
                  }`}>
                  {item.status === "active" ? "Active" : "Draft"}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(item.productId)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-[#E68736] hover:text-[#E68736] transition-colors"
                >
                  <HiPencil size={13} /> Edit
                </button>
                <button
                  onClick={() => onDuplicate(item.productId)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-blue-400 hover:text-blue-500 transition-colors"
                >
                  <PlusCircle size={13} /> Clone
                </button>
                <button
                  onClick={() => onDelete(item.productId)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-red-400 hover:border-red-300 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div className="py-16 text-center">
            <Box size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-medium">No products found</p>
            {query && (
              <p className="text-xs text-gray-300 mt-1">
                Try a different name or SKU
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}