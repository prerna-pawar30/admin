/* eslint-disable no-unused-vars */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, X, LayoutGrid, Trash2, UploadCloud, 
  Settings2, AlignLeft, Plus, Layers, Save, Info, AlertCircle 
} from 'lucide-react';
import InputGroup from '../../ui/InputGroup';
import DropdownGroup from '../../ui/DropdownGroup';
import MultiSelectGroup from '../../ui/MultiSelectGroup';
import RadioSetting from '../../ui/RadioSetting';
import TextareaGroup from '../../ui/TextareaGroup';
import SummaryRow from '../../ui/SummaryRow';

const EditProductModal = ({ 
  showModal, setShowModal, editForm, setEditForm, loading, 
  handleUpdateProduct, categories = [], brands = [], MaterialOptions = [],
  handleCategoryChange, handleFileSelection
}) => {
  if (!editForm) return null;

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-2 sm:p-4 md:py-10"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-[#F8FAFC] w-full max-w-[1250px] h-full rounded-3xl md:rounded-[48px] shadow-3xl relative flex flex-col overflow-hidden border border-white/20"
          >
            
            {/* --- HEADER --- */}
            <div className="px-5 md:px-12 py-5 md:py-8 bg-white flex justify-between items-center border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="bg-[#E68736] p-3 md:p-5 rounded-2xl md:rounded-[24px] text-white shadow-xl shadow-orange-200">
                  <Package size={24} className="md:w-7 md:h-7" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl md:text-3xl font-black text-slate-900 uppercase tracking-tight truncate">
                    {editForm.name || "New Product"}
                  </h2>
                  <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-0.5 md:mt-1 flex items-center gap-2">
                    <Settings2 size={12}/> <span className="truncate">System Configuration</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="bg-slate-50 p-3 md:p-4 rounded-full text-slate-400 hover:text-red-500 transition-all hover:bg-red-50"
              >
                <X size={20} className="md:w-6 md:h-6" />
              </button>
            </div>

            {/* --- MODAL BODY --- */}
            <div className="flex-1 overflow-y-auto p-5 md:p-12 custom-scrollbar">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-12">
                
                {/* Main Content Area */}
                <div className="col-span-1 xl:col-span-8 space-y-8 md:space-y-12">
                  
                  {/* Basic Information */}
                  <div className="bg-white rounded-3xl md:rounded-[40px] p-6 md:p-10 border border-slate-200/60 shadow-sm space-y-6 md:space-y-8">
                    <div className="flex items-center gap-3 border-b border-slate-50 pb-5 md:pb-6">
                      <Info className="text-[#E68736]" size={18} />
                      <h3 className="font-black text-slate-800 text-[10px] md:text-xs tracking-[0.3em] uppercase">Core Identity</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                      <InputGroup 
                        label="Product Name" 
                        value={editForm.name} 
                        placeholder={!editForm.name ? "Enter product name..." : ""}
                        onChange={v => setEditForm({...editForm, name: v})} 
                      />
                      <DropdownGroup 
                        label="Category" 
                        options={categories} // REMOVED the .map() here, use the pre-formatted list
                        value={editForm.category}
                        onChange={handleCategoryChange} 
                      />
                      <MultiSelectGroup 
                        label="Brand" 
                        options={brands} // Already formatted as [{value, label}]
                        values={editForm.brand || []} 
                        onChange={vals => setEditForm({...editForm, brand: vals})} 
                      />
                      <DropdownGroup 
                        label="Material" 
                        options={MaterialOptions || []} 
                        value={editForm.material} 
                        onChange={v => setEditForm({...editForm, material: v})} 
                      />
                    </div>

                    {/* Stock & Price Logic */}
                    <div className="p-5 md:p-8 bg-slate-50 rounded-2xl md:rounded-[32px] border border-slate-100 flex flex-col lg:flex-row items-start lg:items-center gap-6 md:gap-10">
                      <RadioSetting 
                        label="Stock Logic" 
                        value={editForm.stockMode} 
                        onChange={v => setEditForm({...editForm, stockMode: v})} 
                      />
                      <div className="grid grid-cols-2 gap-4 md:gap-6 flex-1 w-full">
                        <InputGroup 
                          label="Price (₹)" 
                          type="number" 
                          value={editForm.globalPrice} 
                          onChange={v => setEditForm({...editForm, globalPrice: v})} 
                        />
                        {editForm.stockMode === "PRODUCT" && (
                          <InputGroup 
                            label="Stock" 
                            type="number" 
                            value={editForm.globalStock} 
                            onChange={v => setEditForm({...editForm, globalStock: v})} 
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gallery Section */}
                  <div className="bg-white rounded-3xl md:rounded-[40px] p-6 md:p-10 border border-slate-200/60 shadow-sm">
                    <h3 className="font-black text-slate-800 uppercase text-[10px] md:text-xs tracking-[0.2em] mb-6 md:mb-8 flex items-center gap-2">
                      <LayoutGrid size={18} className="text-[#E68736]"/> Media Gallery
                    </h3>
                    <div className="flex flex-wrap gap-4 md:gap-6">
                      {editForm.existingGlobalImages?.map((img, i) => (
                        <div key={`ex-${i}`} className="w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-[28px] overflow-hidden relative border border-slate-100 group shadow-sm">
                          <img src={img} className="w-full h-full object-cover" alt="gallery" />
                          <button 
                            onClick={() => setEditForm({...editForm, existingGlobalImages: editForm.existingGlobalImages.filter((_, idx) => idx !== i)})} 
                            className="absolute inset-0 bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                      <label className="w-20 h-20 md:w-28 md:h-28 border-2 border-dashed border-slate-200 rounded-2xl md:rounded-[28px] flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50 hover:border-[#E68736] transition-all text-slate-300 hover:text-[#E68736]">
                        <UploadCloud size={20} />
                        <span className="text-[8px] font-black mt-1 uppercase">Upload</span>
                        <input type="file" multiple className="hidden" onChange={e => handleFileSelection(e, null, 'globalImage')} />
                      </label>
                    </div>
                  </div>

                  {/* SKU Generation */}
                  <div className="bg-slate-900 rounded-3xl md:rounded-[40px] p-6 md:p-10 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
                    <div className="space-y-5 md:space-y-6">
                      <InputGroup label="Series Number" dark={true} value={editForm.seriesNumber} onChange={v => setEditForm({...editForm, seriesNumber: v})} />
                      <InputGroup label="Sub-Series ID" dark={true} value={editForm.subSeriesNumber} onChange={v => setEditForm({...editForm, subSeriesNumber: v})} />
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl md:rounded-[32px] p-6 md:p-8 flex flex-col items-center text-center">
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2 md:mb-4">Calculated SKU</span>
                      <span className={`text-xl md:text-4xl font-black tracking-tighter ${editForm.sku ? 'text-[#E68736]' : 'text-slate-700 italic font-medium'}`}>
                        {editForm.sku || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Technical Specifications */}
                  <div className="bg-white rounded-3xl md:rounded-[40px] p-6 md:p-10 border border-slate-200 shadow-sm space-y-6 md:space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-5 md:pb-6">
                      <div className="flex items-center gap-3">
                        <Settings2 className="text-[#E68736]" size={18} />
                        <h3 className="font-black text-slate-800 uppercase text-[10px] md:text-xs tracking-[0.2em]">Data Sheets</h3>
                      </div>
                      <button 
                        onClick={() => setEditForm({...editForm, specifications: [...(editForm.specifications || []), { key: "", value: "" }]})}
                        className="bg-orange-50 text-[#E68736] px-4 py-2 rounded-xl text-[10px] font-black hover:bg-[#E68736] hover:text-white transition-all uppercase w-max"
                      >
                        + Add Param
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {editForm.specifications?.map((spec, sIdx) => (
                        <div key={sIdx} className="flex gap-2 items-center bg-slate-50 p-2 md:p-3 rounded-2xl border border-slate-100 group">
                          <input placeholder="Key" className="bg-white px-3 py-2 rounded-lg text-[11px] font-black border-none focus:ring-1 focus:ring-orange-500 outline-none w-1/3" value={spec.key} onChange={(e) => {
                            const newSpecs = [...editForm.specifications]; newSpecs[sIdx].key = e.target.value; setEditForm({ ...editForm, specifications: newSpecs });
                          }} />
                          <input placeholder="Value" className="bg-white px-3 py-2 rounded-lg text-[11px] font-medium border-none focus:ring-1 focus:ring-orange-500 outline-none flex-1" value={spec.value} onChange={(e) => {
                            const newSpecs = [...editForm.specifications]; newSpecs[sIdx].value = e.target.value; setEditForm({ ...editForm, specifications: newSpecs });
                          }} />
                          <button onClick={() => setEditForm({ ...editForm, specifications: editForm.specifications.filter((_, i) => i !== sIdx) })} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Variant Configuration */}
                  <div className="space-y-6 md:space-y-8">
                    <h2 className="text-xl md:text-3xl font-black text-slate-900 flex items-center gap-3 md:gap-4 px-2">
                      <Layers className="text-[#E68736]" size={24}/> Variant Matrix
                    </h2>
                    {editForm.variants?.map((v, idx) => (
                      <div key={v.id} className="bg-white rounded-3xl md:rounded-[48px] p-6 md:p-10 border border-slate-200 shadow-xl space-y-8 relative overflow-hidden">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-5 md:pb-6">
                          <div className="flex items-center gap-3">
                            <div className="bg-slate-900 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px]">{idx+1}</div>
                            <h4 className="font-black text-slate-800 uppercase text-[10px] md:text-xs">Variant Logic</h4>
                          </div>
                          <button onClick={() => setEditForm({...editForm, variants: editForm.variants.filter(x => x.id !== v.id)})} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                          <div className="space-y-6">
                            <InputGroup label="Identifier" value={v.variantName} onChange={val => {
                              const nv = [...editForm.variants]; nv[idx].variantName = val; setEditForm({...editForm, variants: nv});
                            }} />
                            <div className="p-5 bg-slate-50 rounded-2xl space-y-4">
                               <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attributes</span><button onClick={() => {
                                  const nv = [...editForm.variants]; nv[idx].dynamicAttributes.push({key: "", values: [""]}); setEditForm({...editForm, variants: nv});
                                }} className="text-[#E68736] text-[9px] font-black uppercase">+ Add</button></div>
                                {v.dynamicAttributes?.map((attr, aIdx) => (
                                  <div key={aIdx} className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
                                    <input className="text-[10px] font-black text-[#E68736] outline-none border-none p-0 focus:ring-0 uppercase" placeholder="KEY" value={attr.key} onChange={e => {
                                      const nv = [...editForm.variants]; nv[idx].dynamicAttributes[aIdx].key = e.target.value; setEditForm({...editForm, variants: nv});
                                    }} />
                                    <div className="flex flex-wrap gap-1">
                                      {attr.values?.map((val, vIdx) => (
                                        <input key={vIdx} className="bg-slate-50 px-2 py-1 rounded text-[10px] font-bold border border-slate-100 w-16 outline-none" value={val} onChange={e => {
                                          const nv = [...editForm.variants]; nv[idx].dynamicAttributes[aIdx].values[vIdx] = e.target.value; setEditForm({...editForm, variants: nv});
                                        }} />
                                      ))}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                               <InputGroup label="Price" type="number" value={v.price} disabled={v.settings?.priceMode === 'PRODUCT'} onChange={val => {
                                 const nv = [...editForm.variants]; nv[idx].price = val; setEditForm({...editForm, variants: nv});
                               }} />
                               <InputGroup label="Stock" type="number" value={v.stock} onChange={val => {
                                 const nv = [...editForm.variants]; nv[idx].stock = val; setEditForm({...editForm, variants: nv});
                               }} />
                            </div>
                            <div>
                               <label className="text-[9px] font-black text-slate-400 uppercase mb-3 block">Variant Media</label>
                               <div className="flex flex-wrap gap-2">
                                  {v.existingImages?.map((img, iI) => (
                                    <div key={iI} className="w-12 h-12 rounded-lg overflow-hidden border relative group">
                                      <img src={img} className="w-full h-full object-cover" alt="" />
                                      <button onClick={() => {}} className="absolute inset-0 bg-red-500/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><X size={12}/></button>
                                    </div>
                                  ))}
                                  <label className="w-12 h-12 border border-dashed rounded-lg flex items-center justify-center text-slate-300 hover:text-[#E68736] cursor-pointer"><Plus size={14}/><input type="file" multiple className="hidden" onChange={e => handleFileSelection(e, v.id, 'image')} /></label>
                               </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setEditForm({...editForm, variants: [...(editForm.variants || []), { id: Date.now(), variantName: "", price: "", stock: "", existingImages: [], newImages: [], dynamicAttributes: [{key: "", values: [""]}], settings: {priceMode: "PRODUCT", imageMode: "PRODUCT"} }]})} className="w-full py-6 md:py-8 border-2 border-dashed border-[#E68736] text-[#E68736] rounded-[28px] md:rounded-[48px] font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-orange-50 transition-all">
                      + Add New Variant Profile
                    </button>
                  </div>
                </div>

                {/* Sidebar Summary Section - Stacks on Mobile */}
                <div className="col-span-1 xl:col-span-4">
                  <div className="xl:sticky xl:top-0 space-y-6 md:space-y-8">
                    <div className="bg-white rounded-[32px] md:rounded-[48px] p-8 md:p-10 border border-slate-200 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-10" />
                      <h3 className="text-xl md:text-2xl font-black mb-8 md:mb-10 pb-6 border-b border-slate-100 flex justify-between items-center">
                        SYNC SUMMARY <Save className="text-[#E68736]" size={20}/>
                      </h3>
                      
                      <div className="space-y-8 md:space-y-10 mb-8 md:mb-10">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-4 block italic tracking-widest">Status</label>
                          <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                            <button onClick={() => setEditForm({...editForm, status: 'draft'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${editForm.status === 'draft' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}>DRAFT</button>
                            <button onClick={() => setEditForm({...editForm, status: 'active'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${editForm.status === 'active' ? 'bg-[#E68736] text-white shadow-lg' : 'text-slate-400'}`}>ACTIVE</button>
                          </div>
                        </div>

                        <div className="space-y-5">
                          <SummaryRow label="System SKU" value={editForm.sku || "PENDING"} active={!!editForm.sku} />
                          <SummaryRow label="Variants" value={editForm.variants?.length || 0} active={true} />
                        </div>
                      </div>

                      <button 
                        type="button" 
                        disabled={loading} 
                        onClick={(e) => { e.preventDefault(); handleUpdateProduct(); }} 
                        className="w-full py-5 md:py-7 bg-slate-900 text-white rounded-[20px] md:rounded-[24px] font-black text-[11px] md:text-[13px] uppercase tracking-widest hover:bg-[#E68736] transition-all disabled:opacity-50"
                      >
                        {loading ? "Syncing..." : "COMMIT CHANGES"}
                      </button>
                      
                      <p className="text-center text-[9px] text-slate-400 font-bold mt-6 uppercase tracking-tighter flex items-center justify-center gap-1.5">
                        <AlertCircle size={10}/> Sync is irreversible once committed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditProductModal;