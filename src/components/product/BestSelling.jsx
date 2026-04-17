import { useEffect, useState } from "react";
import { ShoppingCart, Package, Tag, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { AnalyticsService } from "../../backend/ApiService";

export default function BestSelling() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchBest = async () => {
      setLoading(true);
      try {
        const data = await AnalyticsService.getBestSelling();
        setItems(data || []);
      } catch (err) {
        console.error("Failed to fetch best sellers:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBest();
  }, []);

  // PAGINATION LOGIC
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="py-6 px-4 md:px-8 min-h-screen bg-gray-50/30">
      <div className="max-w-6xl mx-auto bg-white rounded-[2rem] md:rounded-[3rem] border border-orange-100 p-5 md:p-10 shadow-sm">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-2xl">
              <ShoppingCart className="text-[#E68736] w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Best Sellers</h2>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Top Performing Products</p>
            </div>
          </div>
          <div className="w-fit text-[11px] font-black text-orange-600 bg-orange-50 border border-orange-100 px-4 py-2 rounded-xl uppercase tracking-wider">
            Total: {items.length} Products
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#E68736]"></div>
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400">Loading library...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <Package className="mx-auto w-12 h-12 text-slate-300 mb-2" />
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No products found</p>
          </div>
        ) : (
          <>
            {/* --- DESKTOP TABLE VIEW (Visible md and up) --- */}
            <div className="hidden md:block overflow-x-auto border border-orange-100 rounded-3xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-orange-50/50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                    <th className="p-5 text-center">Preview</th>
                    <th className="p-5">Product Details</th>
                    <th className="p-5">Category</th>
                    <th className="p-5">Brand</th>
                    <th className="p-5">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentItems.map((p) => (
                    <tr key={p.productId} className="hover:bg-orange-50/30 transition-colors group">
                      <td className="p-5 text-center">
                        <div className="bg-white p-2 rounded-2xl border border-orange-100 inline-block shadow-sm group-hover:scale-110 transition-transform">
                          <img 
                            src={p.images?.[0] || ""} 
                            alt={p.name} 
                            className="h-16 w-16 object-contain mix-blend-multiply"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Image"; }}
                          />
                        </div>
                      </td>
                      <td className="p-5">
                        <p className="font-bold text-slate-800 text-lg leading-tight">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-1 tracking-tighter uppercase">ID: {p.productId}</p>
                      </td>
                      <td className="p-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black bg-slate-50 text-slate-500 border border-slate-100 uppercase tracking-tight">
                          <Tag className="w-3 h-3 text-orange-400" />
                          {p.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-wrap gap-1.5">
                          {p.brand?.map(b => (
                            <span key={b._id} className="text-[9px] font-bold text-slate-600 border border-slate-100 px-2 py-1 rounded-md bg-white shadow-sm uppercase">
                              {b.brandName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-5">
                        <p className="font-black text-[#E68736] text-xl">
                          ₹{p.price?.toLocaleString('en-IN')}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- MOBILE CARD VIEW (Visible below md) --- */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {currentItems.map((p) => (
                <div key={p.productId} className="bg-white border border-orange-100 rounded-[2rem] p-5 shadow-sm active:scale-[0.98] transition-all">
                  <div className="flex gap-4 items-center mb-4">
                    <div className="bg-orange-50/50 p-2 rounded-2xl border border-orange-100 shrink-0">
                      <img 
                        src={p.images?.[0] || ""} 
                        alt={p.name} 
                        className="h-20 w-20 object-contain mix-blend-multiply"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Image"; }}
                      />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[9px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-orange-100">
                         {p.category?.name || 'General'}
                      </span>
                      <h3 className="font-bold text-slate-800 text-lg mt-1 leading-tight truncate">{p.name}</h3>
                      <p className="text-[14px] font-black text-[#E68736] mt-1">₹{p.price?.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex flex-wrap gap-1">
                      {p.brand?.slice(0, 2).map(b => (
                        <span key={b._id} className="text-[9px] font-bold text-slate-400 border border-slate-100 px-2 py-0.5 rounded uppercase">
                          {b.brandName}
                        </span>
                      ))}
                    </div>
                    <span className="text-[8px] font-mono text-slate-300 uppercase tracking-tighter">SKU: {p.productId?.slice(-6)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row items-center justify-between mt-12 gap-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   Page {currentPage} of {totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-3 rounded-xl border border-slate-100 hover:bg-orange-50 disabled:opacity-20 transition-all shadow-sm"
                  >
                    <ChevronLeft size={18} className="text-slate-600" />
                  </button>

                  <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-none">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`min-w-[40px] h-10 rounded-xl text-xs font-black transition-all ${
                          currentPage === i + 1
                            ? "bg-[#E68736] text-white shadow-lg shadow-orange-100 scale-110"
                            : "bg-white border border-slate-100 text-slate-400 hover:text-[#E68736]"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-xl border border-slate-100 hover:bg-orange-50 disabled:opacity-20 transition-all shadow-sm"
                  >
                    <ChevronRight size={18} className="text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}