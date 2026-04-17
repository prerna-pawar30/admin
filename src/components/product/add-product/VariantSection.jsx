/* eslint-disable no-unused-vars */
import React from "react";
import { Settings2, Trash2, Plus, PlusCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RadioSetting from "../../ui/RadioSetting";
import InputGroup from "../../ui/InputGroup";

export default function VariantSection({ 
  variants, setVariants, selectionSettings, commonForm, updateVariant, handleFileSelection, updateAttributeValue, addAttributeValue, removeAttributeValue, addVariantRow 
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black flex items-center gap-2"><Settings2 size={24} className="text-[#E68736]" /> Product Variants</h2>
      <AnimatePresence>
        {variants.map((v, idx) => (
          <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-orange-200 shadow-sm overflow-hidden mb-8">
            <div className="px-8 py-4  border-b border-orange-200 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Variant #{idx + 1}</span>
              <button type="button" onClick={() => setVariants(variants.filter(x => x.id !== v.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <RadioSetting label="Price Mode" value={v.settings.priceMode} onChange={val => updateVariant(v.id, 'settings', { ...v.settings, priceMode: val })} />
                <RadioSetting label="Media Mode" value={v.settings.imageMode} onChange={val => updateVariant(v.id, 'settings', { ...v.settings, imageMode: val })} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <InputGroup label="Variant Label" value={v.variantName} onChange={val => updateVariant(v.id, 'variantName', val)} placeholder="e.g. Large / Silver" />
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-6">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attributes</label>
                      <button onClick={() => updateVariant(v.id, 'dynamicAttributes', [...v.dynamicAttributes, { key: "", values: [""] }])} className="text-[#E68736] flex items-center gap-1 text-[10px] font-bold uppercase"><PlusCircle size={14} /> Add New Key</button>
                    </div>
                    {v.dynamicAttributes.map((attr, aIdx) => (
                      <div key={aIdx} className="space-y-3 bg-white p-4 rounded-xl  border border-orange-200 ">
                        <div className="flex gap-2">
                          <input className="flex-1 p-2 text-[11px] font-black uppercase tracking-wider rounded-lg border-none bg-slate-50 text-[#E68736]" placeholder="Key" value={attr.key} onChange={e => { const na = [...v.dynamicAttributes]; na[aIdx].key = e.target.value; updateVariant(v.id, 'dynamicAttributes', na); }} />
                          {v.dynamicAttributes.length > 1 && <button onClick={() => updateVariant(v.id, 'dynamicAttributes', v.dynamicAttributes.filter((_, i) => i !== aIdx))} className="text-slate-300 hover:text-red-500"><X size={14} /></button>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {attr.values.map((val, vIdx) => (
                            <div key={vIdx} className="flex items-center  rounded-lg px-2 py-1 border border-orange-200">
                              <input className="bg-transparent text-xs font-bold outline-none w-20" placeholder="Value..." value={val} onChange={e => updateAttributeValue(v.id, aIdx, vIdx, e.target.value)} />
                              {attr.values.length > 1 && <button onClick={() => removeAttributeValue(v.id, aIdx, vIdx)} className="text-slate-300 ml-1 hover:text-red-500"><X size={12} /></button>}
                            </div>
                          ))}
                          <button onClick={() => addAttributeValue(v.id, aIdx)} className="w-8 h-8 rounded-lg border-2 border-dashed border-orange-200 flex items-center justify-center text-slate-300 hover:border-[#E68736] hover:text-[#E68736]"><Plus size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {v.settings.priceMode === 'VARIANT' ? <InputGroup label="Custom Price (₹)" type="number" value={v.price} onChange={val => updateVariant(v.id, 'price', val)} /> : <div className="flex flex-col gap-2 opacity-60"><label className="text-[11px] font-black text-slate-400 uppercase ml-1">Price (Global)</label><div className="w-full px-5 py-3.5 rounded-2xl border border-orange-200 bg-slate-100 text-sm font-bold text-slate-500 italic">Using base price</div></div>}
                    {selectionSettings.stockMode === 'VARIANT' ? <InputGroup label="Variant Stock" type="number" value={v.stock} onChange={val => updateVariant(v.id, 'stock', val)} /> : <div className="flex flex-col gap-2 opacity-60"><label className="text-[11px] font-black text-slate-400 uppercase ml-1">Stock (Global)</label><div className="w-full px-5 py-3.5 rounded-2xl border border-orange-200 bg-slate-100 text-sm font-bold text-slate-500 italic">Managed via Global</div></div>}
                  </div>
                  {v.settings.imageMode === "VARIANT" ? (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Variant Media</label>
                      <div className="flex flex-wrap gap-2">
                        {v.images.map((file, i) => (
                          <div key={i} className="w-12 h-12 rounded-lg border overflow-hidden relative shadow-sm bg-white"><img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="variant" /><button onClick={() => updateVariant(v.id, 'images', v.images.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-white/80 p-0.5"><X size={8} /></button></div>
                        ))}
                        <label className="w-12 h-12 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-orange-50"><Plus size={16} className="text-slate-300" /><input type="file" multiple className="hidden" onChange={e => handleFileSelection(e, v.id, 'image')} /></label>
                      </div>
                    </div>
                  ) : <div className="p-4 bg-slate-50 rounded-2xl border border-orange-200 text-center"><span className="text-[10px] font-bold text-slate-400 italic">Using Global Product Images</span></div>}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="flex justify-center pt-4">
        <button type="button" onClick={addVariantRow} className="bg-[#E68736] text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-3  hover:bg-slate-900 transition-all uppercase text-xs tracking-widest"><Plus size={20} /> Add New Variant</button>
      </div>
    </div>
  );
}