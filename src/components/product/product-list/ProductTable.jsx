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
    <div className="w-full space-y-6 md:space-y-8">
      {/* Header & Search Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Box size={28} className="md:w-9 md:h-9 text-[#E68736]" />
            PRODUCT <span className="text-slate-400 font-light">INVENTORY</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-medium mt-1">Manage and scale your dental surgical catalog.</p>
        </div>
        
        <div className="w-full lg:w-96">
          <div className="flex items-center gap-3 bg-white px-4 md:px-6 py-3 md:py-4 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm focus-within:border-[#E68736] transition-all">
            <HiSearch className="text-slate-400 text-lg md:text-xl" />
          <input 
                value={query} // Make it a controlled component
                placeholder="Search by name or SKU..." 
                className="..." 
                onChange={(e) => setQuery(e.target.value)} 
              />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl md:rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Details</th>
                <th className="px-8 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Brand/Origin</th>
                <th className="px-8 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-7 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((item) => (
                <tr key={item.productId} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-[24px] overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 shadow-inner">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><Box size={24}/></div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-slate-800 text-lg group-hover:text-[#E68736] transition-colors truncate">
                          {item.name || <span className="text-slate-300 italic font-medium">Unnamed Product</span>}
                        </div>
                        <div className="text-[11px] font-bold text-slate-400 mt-1 flex items-center gap-2">
                          CAT: <span className="text-[#E68736]">{item.category?.name || "Uncategorized"}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-600 italic">
                      {item.brand?.[0]?.brandName || <span className="text-slate-300 font-medium">No Brand Linked</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      item.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-orange-50 border-orange-100 text-[#E68736]'
                    }`}>
                      {item.status || "Draft"}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-3 justify-center">
                      <button onClick={() => onEdit(item.productId)} className="w-11 h-11 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-2xl hover:border-[#E68736] hover:text-[#E68736] transition-all hover:shadow-md">
                        <HiPencil size={18} />
                      </button>
                      <button onClick={() => onDuplicate(item.productId)} className="w-11 h-11 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-2xl hover:border-indigo-500 hover:text-indigo-500 transition-all hover:shadow-md">
                        <PlusCircle size={18} />
                      </button>
                      <button onClick={() => onDelete(item.productId)} className="w-11 h-11 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-2xl hover:border-red-500 hover:text-red-500 transition-all hover:shadow-md">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredProducts.map((item) => (
            <div key={item.productId} className="p-5 flex flex-col gap-4 bg-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200"><Box size={20}/></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-slate-800 text-base truncate">
                    {item.name || "Unnamed Product"}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="text-[#E68736]">{item.category?.name || "Uncategorized"}</span>
                    <span>•</span>
                    <span className="italic">{item.brand?.[0]?.brandName || "No Brand"}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                    item.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-orange-50 border-orange-100 text-[#E68736]'
                  }`}>
                    {item.status || "Draft"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 w-full">
                <button 
                  onClick={() => onEdit(item.productId)} 
                  className="flex-1 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 flex items-center justify-center gap-2 font-bold text-xs"
                >
                  <HiPencil size={14} /> Edit
                </button>
                <button 
                  onClick={() => onDuplicate(item.productId)} 
                  className="flex-1 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 flex items-center justify-center gap-2 font-bold text-xs"
                >
                  <PlusCircle size={14} /> Clone
                </button>
                <button 
                  onClick={() => onDelete(item.productId)} 
                  className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-500 flex items-center justify-center"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs md:text-sm">
            No Records Found
          </div>
        )}
      </div>
    </div>
  );
}