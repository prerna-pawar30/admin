import React from 'react';

const StockGrid = ({ products, onSelect, currentPage, totalPages, onPageChange }) => {
  return (
    <>
      {/* CHANGE: grid-cols-2 is the default (mobile), 
          then scales up to 3 and 4 columns on larger screens.
          Also reduced gap to 3 or 4 for better fit on small screens.
      */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8 mb-12">
        {products.map(product => (
          <div 
            key={product._id || product.productId} 
            onClick={() => onSelect(product)}
            className="group cursor-pointer bg-white border border-orange-200 rounded-xl md:rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            {/* Reduced height for mobile (h-32 md:h-55) */}
            <div className="h-32 md:h-55 bg-orange-50/30 flex items-center justify-center relative p-2">
              <img 
                src={product.images?.[0]} 
                alt={product.name} 
                className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" 
              />
              {/* Badge smaller on mobile */}
              <div className="absolute top-2 left-2 md:left-4 bg-white/90 backdrop-blur-md px-1.5 py-0.5 rounded-full text-[8px] md:text-[10px] font-bold text-orange-600 border border-orange-100 uppercase tracking-widest">
                {product.stockType}
              </div>
            </div>

            <div className="p-3 md:p-6">
              {/* Smaller title on mobile */}
              <h3 className="font-bold text-gray-800 text-sm md:text-lg leading-tight truncate">
                  {product.name}
              </h3>

              {/* Stacked or smaller meta line for mobile */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 md:mb-4">
                  <p className="text-[10px] md:text-[14px] text-gray-400 font-mono uppercase tracking-wider">
                    {product.sku}
                  </p>
                  <p className="text-xs md:text-[14px] font-black text-orange-600">
                    ₹{product.price?.toLocaleString('en-IN')}
                  </p>
              </div>
              
              {/* STOCK SECTION */}
              <div className="flex justify-between items-end border-t border-gray-50 pt-2">
                  <div className="flex flex-col">
                    <span className="text-[8px] md:text-[10px] text-gray-400 uppercase font-bold tracking-tight">In Stock</span>
                    <span className="text-sm md:text-xl font-black text-gray-900">
                        {product.stockType === 'PRODUCT' ? product.productStock : product.variants?.length}
                        <span className="text-[8px] md:text-xs ml-1 text-gray-500 font-normal">
                          {product.stockType === 'PRODUCT' ? 'units' : 'vars'}
                        </span>
                    </span>
                  </div>
                  
                  {/* Smaller action button for mobile */}
                  <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-orange-500 text-white flex items-center justify-center group-hover:bg-orange-600 transition-colors shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Container (Added horizontal scroll for many pages on mobile) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 px-4">
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 md:p-3 rounded-lg md:rounded-xl bg-white border border-gray-200 disabled:opacity-30 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          </button>
          
          <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] md:max-w-none no-scrollbar">
            {[...Array(totalPages)].map((_, idx) => (
              <button key={idx} onClick={() => onPageChange(idx + 1)} className={`min-w-[32px] md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl font-bold transition-all text-xs md:text-base ${currentPage === idx + 1 ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100'}`}>
                {idx + 1}
              </button>
            ))}
          </div>

          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 md:p-3 rounded-lg md:rounded-xl bg-white border border-gray-200 disabled:opacity-30 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
          </button>
        </div>
      )}
    </>
  );
};

export default StockGrid;