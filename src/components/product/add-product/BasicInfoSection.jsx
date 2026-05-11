import React from "react";
import { Plus, X } from "lucide-react";
import InputGroup from "../../ui/InputGroup";
import DropdownGroup from "../../ui/DropdownGroup";
import MultiSelectGroup from "../../ui/MultiSelectGroup";
import RadioSetting from "../../ui/RadioSetting";

const MaterialOptions = [
  { value: "Titanium", label: "Titanium" },
  { value: "Stainless Steel", label: "Stainless Steel" },
];

export default function BasicInfoSection({ 
  commonForm, setCommonForm, categories, brands, selectionSettings, setSelectionSettings, handleCategorySelection, handleFileSelection 
}) {
  return (
    <section className="bg-white rounded-lg md:rounded-3xl border border-orange-200  p-4 md:p-8 space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
        <InputGroup label="Product Name" value={commonForm.name} onChange={v => setCommonForm({ ...commonForm, name: v })} />
        <DropdownGroup 
            label="Category" 
            options={categories} // categories is already [{value, label}]
            value={commonForm.category} 
            onChange={handleCategorySelection} 
          />
        <MultiSelectGroup label="Brand" options={brands} values={commonForm.brand} onChange={vals => setCommonForm({ ...commonForm, brand: vals })} />
        <DropdownGroup label="Material" options={MaterialOptions} value={commonForm.material} onChange={v => setCommonForm({ ...commonForm, material: v })} />
      </div>

      <div className="p-3 md:p-6 bg-slate-50 rounded-lg md:rounded-2xl border border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6">
        <RadioSetting label="Global Stock Logic" value={selectionSettings.stockMode} onChange={v => setSelectionSettings({ ...selectionSettings, stockMode: v })} />
        <div className="flex-1 text-xs md:text-sm text-slate-400 font-medium">Use 'PRODUCT' for shared stock, 'VARIANT' for unique stock per item.</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 pt-2">
        <InputGroup label="Base Product Price (₹)" type="number" value={commonForm.globalPrice} onChange={v => setCommonForm({ ...commonForm, globalPrice: v })} />
        {selectionSettings.stockMode === "PRODUCT" && (
          <InputGroup label="Global Stock Count" type="number" value={commonForm.globalStock} onChange={v => setCommonForm({ ...commonForm, globalStock: v })} />
        )}
      </div>

      <div className="space-y-3 md:space-y-4 p-3 md:p-4 bg-orange-50/30 rounded-lg md:rounded-2xl border border-orange-100">
        <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">Main Product Gallery</label>
        <div className="flex flex-wrap gap-2 md:gap-4">
          {commonForm.globalImages.map((file, i) => (
            <div key={i} className="w-16 h-16 md:w-20 md:h-20 border rounded-lg md:rounded-xl overflow-hidden relative shadow-sm bg-white">
              <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="product" />
              <button onClick={() => setCommonForm({ ...commonForm, globalImages: commonForm.globalImages.filter((_, idx) => idx !== i) })} className="absolute top-0.5 right-0.5 bg-white rounded-full p-0.5 shadow-md"><X size={10} className="text-red-500" /></button>
            </div>
          ))}
          <label className="w-20 h-20 border-2 border-orange-200 border-dashed rounded-xl flex items-center justify-center cursor-pointer bg-white hover:bg-orange-50 transition-all">
            <Plus className="text-orange-300" />
            <input type="file" multiple className="hidden" onChange={e => handleFileSelection(e, null, 'globalImage')} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
        <InputGroup label="Series Number" value={commonForm.seriesNumber} onChange={v => setCommonForm({ ...commonForm, seriesNumber: v })} />
        <InputGroup label="Sub-Series Number" value={commonForm.subSeriesNumber} onChange={v => setCommonForm({ ...commonForm, subSeriesNumber: v })} />
        <div className="md:col-span-2 bg-[#E68736] rounded-2xl p-6 flex justify-between items-center text-white">
          <span className="text-xs font-black uppercase tracking-widest">Calculated SKU</span>
          <span className="text-2xl font-black tracking-widest">{commonForm.sku || "---"}</span>
        </div>
      </div>
    </section>
  );
}