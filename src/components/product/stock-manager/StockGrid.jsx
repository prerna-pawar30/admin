import React from 'react';

const StockGrid = ({ products = [], onSelect, currentPage, totalPages, onPageChange }) => {
  return (
    <>
      {/* PROFESSIONAL GRID SYSTEM */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-12">
        {products.map(product => {
          const isVariableStock = product.stockType !== 'PRODUCT';
          const totalStockCount = isVariableStock 
            ? (product.variants?.length || 0) 
            : (product.productStock || 0);

          return (
            <div 
              key={product._id || product.productId} 
              onClick={() => onSelect && onSelect(product)}
              className="group cursor-pointer bg-white rounded-2xl border border-orange-200/80 overflow-hidden hover:border-orange-300 hover:shadow-[0_20px_40px_-15px_rgba(230,135,54,0.12)] transition-all duration-300 flex flex-col"
            >
              {/* IMAGE ASSET CONTAINER */}
              <div className="h-36 md:h-56 bg-gradient-to-b from-slate-50 to-white flex items-center justify-center relative p-3 overflow-hidden border-b border-slate-100 flex-shrink-0">
                <img 
                  src={product.images?.[0] || "/placeholder-image.jpg"} 
                  alt={product.name} 
                  className="max-h-full max-w-full object-contain mix-blend-multiply transform group-hover:scale-105 transition-transform duration-500 ease-out" 
                  loading="lazy"
                />
                
                {/* Micro-Interaction Highlight Layer */}
                <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Stock Logic Badge */}
                <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-md text-[8px] md:text-[9px] font-black uppercase tracking-wider border backdrop-blur-md shadow-sm ${
                  isVariableStock 
                    ? 'bg-blue-50/90 text-blue-600 border-blue-100' 
                    : 'bg-emerald-50/90 text-emerald-600 border-emerald-100'
                }`}>
                  {product.stockType || 'PRODUCT'}
                </span>
              </div>

              {/* INFORMATION COMPARTMENT */}
              <div className="p-4 md:p-5 flex flex-col flex-1 justify-between bg-white">
                <div className="space-y-1.5 md:space-y-2 mb-4">
                  <h3 className="font-bold text-slate-800 text-sm md:text-base leading-snug group-hover:text-orange-600 transition-colors duration-200 line-clamp-2 min-h-[2.5rem] md:min-h-[2.75rem]">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] md:text-xs text-slate-400 font-mono tracking-tight bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 truncate max-w-[60%]">
                      {product.sku || "NO-SKU"}
                    </span>
                    <span className="text-sm md:text-base font-extrabold text-slate-900 whitespace-nowrap">
                      ₹{product.price?.toLocaleString('en-IN') || "0"}
                    </span>
                  </div>
                </div>
                
                {/* MATURED STOCK DATA SECTION */}
                <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[9px] md:text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                      Inventory Status
                    </span>
                    <span className={`text-sm md:text-lg font-black tracking-tight ${
                      totalStockCount === 0 ? 'text-red-500' : 'text-slate-800'
                    }`}>
                      {totalStockCount}
                      <span className="text-[9px] md:text-xs ml-1 text-slate-400 font-medium lowercase">
                        {isVariableStock ? 'variants' : 'units'}
                      </span>
                    </span>
                  </div>
                  
                  {/* Action Configuration Trigger Button */}
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white group-hover:rotate-12 transition-all duration-300 shadow-sm border border-slate-100 group-hover:border-transparent">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* COMPACT & PROFESSIONAL PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-10 px-4">
          {/* Previous Page Control */}
          <button 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 1} 
            className="p-2 md:p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Numeric Page Controls */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[240px] sm:max-w-none scrollbar-none py-1 px-0.5">
            {[...Array(totalPages)].map((_, idx) => {
              const pageNum = idx + 1;
              const isCurrent = currentPage === pageNum;
              return (
                <button 
                  key={idx} 
                  onClick={() => onPageChange(pageNum)} 
                  className={`min-w-[32px] md:min-w-[38px] h-8 md:h-9 px-1.5 rounded-xl font-bold text-xs md:text-sm transition-all border ${
                    isCurrent 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10' 
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Page Control */}
          <button 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage === totalPages} 
            className="p-2 md:p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

export default StockGrid;