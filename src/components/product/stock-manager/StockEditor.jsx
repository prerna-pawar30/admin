import React, { useState, useEffect } from 'react';
import { Boxes } from 'lucide-react';
import { Dialog, DialogBody, DialogButton, DialogFooter, DialogHeader } from '../../ui/Dialog';

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
    <Dialog open onClose={onClose} size="md" label="Adjust stock">
      <DialogHeader icon={Boxes} title={localProduct.name} subtitle="Stock adjustment" onClose={onClose} />

      <DialogBody className="space-y-4">
        {localProduct.images?.[0] && (
          <div className="flex justify-center">
            <img src={localProduct.images[0]} className="h-24 w-24 rounded-xl border border-slate-100 bg-white object-contain p-1" alt="" />
          </div>
        )}

        {localProduct.stockType === "PRODUCT" ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 sm:p-5">
            <label className="mb-2 block text-center text-xs font-semibold text-slate-500">Total units in stock</label>
            <input
              inputMode="numeric"
              className="h-16 w-full rounded-xl border border-slate-200 bg-white text-center text-3xl font-bold text-brand-600 shadow-sm outline-none transition-all focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
              value={localProduct.productStock}
              onChange={(e) => handleStockChange(e.target.value)}
            />
          </div>
        ) : (
          <ul className="space-y-2">
            {localProduct.variants?.map((variant) => (
              <li key={variant.variantId} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-semibold text-slate-800">{variant.name}</p>
                  <p className="truncate font-mono text-[11px] uppercase text-slate-400">{variant.sku}</p>
                </div>
                <input
                  inputMode="numeric"
                  aria-label={`Stock for ${variant.name}`}
                  className="h-10 w-24 shrink-0 rounded-xl border border-slate-200 bg-white px-3 text-right text-base font-semibold text-slate-800 outline-none transition-all focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
                  value={variant.variantStock}
                  onChange={(e) => handleStockChange(e.target.value, variant.variantId)}
                />
              </li>
            ))}
          </ul>
        )}
      </DialogBody>

      <DialogFooter>
        <DialogButton tone="ghost" onClick={onClose}>
          Cancel
        </DialogButton>
        <DialogButton tone="primary" isLoading={isUpdating} className="flex-1 sm:flex-none" onClick={() => OnSubmit(localProduct)}>
          Update stock
        </DialogButton>
      </DialogFooter>
    </Dialog>
  );
};

export default StockEditor;
