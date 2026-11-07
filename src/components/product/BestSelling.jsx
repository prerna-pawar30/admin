import Pagination from "../ui/Pagination";
import PageHeader from "../ui/PageHeader";
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

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <div>
        <PageHeader
          icon={ShoppingCart}
          title="Best Sellers"
          badge={items.length ? `${items.length} products` : undefined}
          description="Your top performing products by sales."
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#E68736]"></div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Loading library...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Package className="mx-auto w-12 h-12 text-slate-300 mb-2" />
            <p className="text-slate-500 font-bold uppercase text-[11px] tracking-wider">No products found</p>
          </div>
        ) : (
          <>
            {/* --- DESKTOP TABLE VIEW (Visible md and up) --- */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                    <th className="px-5 py-3 text-center">Preview</th>
                    <th className="px-5 py-3">Product Details</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Brand</th>
                    <th className="px-5 py-3">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentItems.map((p) => (
                    <tr key={p.productId} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-5 py-3.5 text-center">
                        <div className="bg-white p-1.5 rounded-xl border border-slate-200 inline-block">
                          <img 
                            src={p.images?.[0] || undefined} 
                            alt={p.name} 
                            className="h-12 w-12 object-contain mix-blend-multiply"
                            onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800 text-sm leading-tight">{p.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-1 tracking-tight uppercase">ID: {p.productId}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold bg-slate-50 text-slate-500 border border-slate-100 uppercase tracking-tight">
                          <Tag className="w-3 h-3 text-orange-400" />
                          {p.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {(Array.isArray(p.brand) ? p.brand : [p.brand].filter(Boolean)).map(b => (
                            <span key={b._id} className="text-[11px] font-bold text-slate-600 border border-slate-100 px-2 py-1 rounded-md bg-white shadow-sm uppercase">
                              {b.brandName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-900 text-sm tabular-nums">
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
                <div key={p.productId} className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm active:scale-[0.98] transition-all">
                  <div className="flex gap-4 items-center mb-4">
                    <div className="bg-orange-50/50 p-2 rounded-2xl border border-orange-100 shrink-0">
                      <img 
                        src={p.images?.[0] || undefined} 
                        alt={p.name} 
                        className="h-20 w-20 object-contain mix-blend-multiply"
                        onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                      />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[11px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-orange-100">
                         {p.category?.name || 'General'}
                      </span>
                      <h3 className="font-bold text-slate-800 text-lg mt-1 leading-tight truncate">{p.name}</h3>
                      <p className="text-[14px] font-bold text-[#E68736] mt-1">₹{p.price?.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(p.brand) ? p.brand : [p.brand].filter(Boolean)).slice(0, 2).map(b => (
                        <span key={b._id} className="text-[11px] font-bold text-slate-400 border border-slate-100 px-2 py-0.5 rounded uppercase">
                          {b.brandName}
                        </span>
                      ))}
                    </div>
                    <span className="text-[11px] font-mono text-slate-300 uppercase tracking-tight">SKU: {p.productId?.slice(-6)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Pagination totalItems={items.length} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={paginate} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}