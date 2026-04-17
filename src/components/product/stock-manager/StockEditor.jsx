import React, { useState, useEffect } from 'react';

const StockEditor = ({ product, isUpdating, onClose, OnSubmit }) => {
  const [localProduct, setLocalProduct] = useState(product);

  useEffect(() => {
    setLocalProduct(product);
  }, [product]);

  const handleStockChange = (value, variantId = null) => {
    const numericValue = value === "" ? 0 : Number(value);
    setLocalProduct(prev => {
      const updated = { ...prev };
      if (variantId) {
        updated.variants = updated.variants.map(v => 
          v.variantId === variantId ? { ...v, variantStock: numericValue } : v
        );
      } else {
        updated.productStock = numericValue;
      }
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* MODAL CARD */}
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* TOP RIGHT CLOSE BUTTON */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-20 p-2 bg-gray-100 hover:bg-orange-100 text-gray-500 hover:text-orange-600 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 overflow-y-auto">
          {/* HEADER INFO */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
               <div className="absolute -inset-2 bg-orange-100 rounded-full blur-xl opacity-50"></div>
               <img src={localProduct.images?.[0]} className="w-32 h-32 object-contain relative z-10 mx-auto" alt="" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">{localProduct.name}</h2>
            <p className="text-orange-500 text-[10px] font-black tracking-[0.2em] uppercase mt-1">Stock Adjustment</p>
          </div>

          {/* EDITING AREA */}
          <div className="space-y-4">
            {localProduct.stockType === "PRODUCT" ? (
              <div className="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Total Unit Inventory</label>
                <input 
                  type="number" 
                  className="w-full text-4xl font-black p-4 bg-white rounded-2xl border-2 border-transparent focus:border-orange-500 shadow-sm outline-none text-orange-600 transition-all text-center"
                  value={localProduct.productStock}
                  onChange={(e) => handleStockChange(e.target.value)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {localProduct.variants?.map((variant) => (
                  <div key={variant.variantId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-sm">{variant.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono uppercase">{variant.sku}</p>
                    </div>
                    <input 
                      type="number" 
                      className="w-24 p-3 bg-white rounded-xl border border-gray-200 font-black text-lg text-right focus:ring-2 ring-orange-500 outline-none transition-all"
                      value={variant.variantStock}
                      onChange={(e) => handleStockChange(e.target.value, variant.variantId)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTION BUTTON */}
          <button 
            onClick={() => OnSubmit(localProduct)}
            disabled={isUpdating}
            className={`mt-8 w-full py-4 rounded-2xl font-black text-white shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-3 ${
              isUpdating ? 'bg-gray-300' : 'bg-orange-500 hover:bg-orange-600 active:scale-95'
            }`}
          >
            {isUpdating ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "SYNC INVENTORY"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockEditor;