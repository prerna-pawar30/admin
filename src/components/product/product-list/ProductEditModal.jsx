/* eslint-disable no-unused-vars */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, X, LayoutGrid, Trash2, UploadCloud, 
  Settings2, AlignLeft, Plus, Layers, Save, Info, AlertCircle, EyeOff 
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-50 w-full max-w-3xl h-[85vh] rounded-2xl shadow-2xl relative flex flex-col overflow-hidden border border-slate-200/80"
          >
            
            {/* --- HEADER --- */}
            <div className="px-6 md:px-10 py-4 bg-white flex justify-between items-center border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-4">
                <div className="bg-orange-500/10 text-orange-600 p-2.5 rounded-xl">
                  <Package size={22} />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight truncate max-w-md md:max-w-xl">
                    {editForm.name || "New Product"}
                  </h2>
                  <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
                    <Settings2 size={12} className="text-slate-500"/> System Configuration
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* --- MODAL BODY --- */}
            <div className="flex-1 overflow-y-auto pt-8 px-6 md:px-10 pb-4 bg-slate-50/50 text-left">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* Main Form Fields */}
                <div className="col-span-1 xl:col-span-8 space-y-6">
                  
                  {/* Basic Information */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200/60 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-3">
                      <Info className="text-orange-500" size={18} />
                      <span>Core Identity</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputGroup 
                        label="Product Name" 
                        value={editForm.name} 
                        placeholder={!editForm.name ? "Enter product name..." : ""}
                        onChange={v => setEditForm({...editForm, name: v})} 
                      />
                      <DropdownGroup 
                        label="Category" 
                        options={categories} 
                        value={editForm.category}
                        onChange={handleCategoryChange} 
                      />
                      <MultiSelectGroup 
                        label="Brand" 
                        options={brands} 
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

                    {/* Stock & Price Logic Wrapper */}
                    <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex flex-col lg:flex-row items-start lg:items-center gap-6 mt-2">
                      <RadioSetting 
                        label="Stock Logic" 
                        value={editForm.stockMode} 
                        onChange={v => setEditForm({...editForm, stockMode: v})} 
                      />
                      <div className="grid grid-cols-2 gap-4 flex-1 w-full">
                        <InputGroup 
                          label="Price (₹)" 
                          value={editForm.globalPrice} 
                          onChange={v => setEditForm({...editForm, globalPrice: v})} 
                        />
                        {editForm.stockMode === "PRODUCT" && (
                          <InputGroup 
                            label="Stock" 
                            value={editForm.globalStock} 
                            onChange={v => setEditForm({...editForm, globalStock: v})} 
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gallery Section */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200/60 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-3">
                      <LayoutGrid size={18} className="text-orange-500"/> 
                      <span>Media Gallery</span>
                    </div>
                    <div className="flex flex-wrap gap-4 pt-1">
                      {editForm.existingGlobalImages?.map((img, i) => (
                        <div key={`ex-${i}`} className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden relative border border-slate-200 group shadow-sm">
                          <img src={img} className="w-full h-full object-cover" alt="gallery" />
                          <button 
                            type="button"
                            onClick={() => setEditForm({...editForm, existingGlobalImages: editForm.existingGlobalImages.filter((_, idx) => idx !== i)})} 
                            className="absolute inset-0 bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {editForm.newGlobalImages?.map((file, i) => (
                        <div key={`new-${i}`} className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden relative border-2 border-orange-500 group shadow-md">
                          <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="new gallery" />
                          <button 
                            type="button"
                            onClick={() => setEditForm({...editForm, newGlobalImages: editForm.newGlobalImages.filter((_, idx) => idx !== i)})} 
                            className="absolute top-1 right-1 bg-white p-1 rounded-full text-red-500 shadow-sm"
                          >
                            <X size={12}/>
                          </button>
                        </div>
                      ))}
                      <label className="w-20 h-20 md:w-24 md:h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50 hover:border-orange-500 transition-all text-slate-400 hover:text-orange-500">
                        <UploadCloud size={20} />
                        <span className="text-[10px] font-semibold mt-1">Upload</span>
                        <input type="file" multiple className="hidden" onChange={e => handleFileSelection(e, null, 'globalImage')} />
                      </label>
                    </div>
                  </div>

                  {/* SKU Generation Card */}
                  <div className="bg-slate-900 rounded-xl p-5 shadow-md grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="space-y-4">
                      <InputGroup label="Series Number" dark={true} value={editForm.seriesNumber} onChange={v => setEditForm({...editForm, seriesNumber: v})} />
                      <InputGroup label="Sub-Series ID" dark={true} value={editForm.subSeriesNumber} onChange={v => setEditForm({...editForm, subSeriesNumber: v})} />
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col items-center text-center justify-center h-full">
                      <span className="text-xs font-semibold text-slate-400 tracking-wider mb-1 uppercase">Calculated SKU</span>
                      <span className={`text-xl md:text-2xl font-bold tracking-tight ${editForm.sku ? 'text-orange-400' : 'text-slate-500 italic font-medium'}`}>
                        {editForm.sku || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Technical Specifications */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200/60 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                        <Settings2 className="text-orange-500" size={18} />
                        <span>Data Sheets</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setEditForm({...editForm, specifications: [...(editForm.specifications || []), { key: "", value: "" }]})}
                        className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                      >
                        <Plus size={14} /> Add Parameter
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {editForm.specifications?.map((spec, sIdx) => (
                        <div key={sIdx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200/60 group">
                          <input placeholder="Key" className="bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold focus:border-orange-500 outline-none w-1/3 transition-all" value={spec.key} onChange={(e) => {
                            const newSpecs = [...editForm.specifications]; newSpecs[sIdx].key = e.target.value; setEditForm({ ...editForm, specifications: newSpecs });
                          }} />
                          <input placeholder="Value" className="bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 focus:border-orange-500 outline-none flex-1 transition-all" value={spec.value} onChange={(e) => {
                            const newSpecs = [...editForm.specifications]; newSpecs[sIdx].value = e.target.value; setEditForm({ ...editForm, specifications: newSpecs });
                          }} />
                          <button type="button" onClick={() => setEditForm({ ...editForm, specifications: editForm.specifications.filter((_, i) => i !== sIdx) })} className="text-slate-400 hover:text-red-500 p-1.5 transition-colors"><Trash2 size={15} /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Storytelling Blocks (Descriptions) */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200/60 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-3">
                      <AlignLeft className="text-orange-500" size={18} />
                      <span>Storytelling Blocks</span>
                    </div>
                    <TextareaGroup 
                      label="Short Description" 
                      rows={2} 
                      value={editForm.shortDescription} 
                      onChange={v => setEditForm({...editForm, shortDescription: v})} 
                    />
                    
                    <div className="space-y-4">
                      {editForm.descriptionSections?.map((sec, idx) => (
                        <div key={idx} className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/50 relative group/block space-y-3">
                          <button 
                            type="button"
                            onClick={() => setEditForm({...editForm, descriptionSections: editForm.descriptionSections.filter((_, i) => i !== idx)})} 
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16}/>
                          </button>
                          <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block">Paragraph {idx + 1}</span>
                          <TextareaGroup 
                            label="Text Content" 
                            value={sec.text} 
                            onChange={v => {
                              const ns = [...editForm.descriptionSections]; ns[idx].text = v;
                              setEditForm({...editForm, descriptionSections: ns});
                            }} 
                          />
                          
                          <div className="flex flex-wrap gap-3 pt-1">
                            {sec.existingImage && (
                              <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 relative group/img shadow-sm">
                                <img src={sec.existingImage} className="w-full h-full object-cover" alt="" />
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const ns = [...editForm.descriptionSections]; ns[idx].existingImage = null;
                                    setEditForm({...editForm, descriptionSections: ns});
                                  }} 
                                  className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                >
                                  <X size={14}/>
                                </button>
                              </div>
                            )}
                            {sec.newImages?.map((f, i) => (
                              <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border-2 border-orange-500 relative group/img shadow-sm">
                                <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="" />
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const ns = [...editForm.descriptionSections];
                                    ns[idx].newImages = ns[idx].newImages.filter((_, mi) => mi !== i);
                                    setEditForm({...editForm, descriptionSections: ns});
                                  }} 
                                  className="absolute -top-1.5 -right-1.5 bg-white text-red-500 p-0.5 rounded-full shadow-md border"
                                >
                                  <X size={10}/>
                                </button>
                              </div>
                            ))}
                            <label className="w-16 h-16 border border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white text-slate-400 hover:text-orange-500 hover:border-orange-500 transition-all">
                              <Plus size={16} />
                              <input type="file" className="hidden" onChange={e => handleFileSelection(e, null, 'descImages', idx)} />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      type="button"
                      onClick={() => setEditForm({...editForm, descriptionSections: [...(editForm.descriptionSections || []), {text: "", newImages: []}]})} 
                      className="w-full py-2.5 border border-dashed border-slate-300 hover:border-orange-500/60 text-slate-500 hover:text-orange-600 rounded-xl font-semibold text-xs transition-all"
                    >
                      + Add New Text Paragraph
                    </button>
                  </div>

                  {/* Variant Configuration Matrix */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 px-1 text-slate-800 font-bold text-base">
                      <Layers className="text-orange-500" size={20}/> 
                      <span>Variant Matrix</span>
                    </div>
                    
                    {editForm.variants?.map((v, idx) => {
                      const isPriceDisabled = (v.settings?.priceMode || "PRODUCT") === "PRODUCT";
                      const isImageDisabled = (v.settings?.imageMode || "PRODUCT") === "PRODUCT";
                      const isStockDisabled = (editForm.stockMode || "PRODUCT") === "PRODUCT";

                      return (
                        <div key={v.id} className="bg-white rounded-xl p-5 border border-slate-200/60 shadow-sm space-y-4 relative overflow-hidden">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                              <div className="bg-slate-800 text-white w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs">{idx+1}</div>
                              <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wide">Variant Matrix Row</h4>
                            </div>
                            <button type="button" onClick={() => setEditForm({...editForm, variants: editForm.variants.filter(x => x.id !== v.id)})} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <InputGroup label="Identifier" value={v.variantName} onChange={val => {
                                const nv = [...editForm.variants]; nv[idx].variantName = val; setEditForm({...editForm, variants: nv});
                              }} />
                              <div className="p-3 bg-slate-50 rounded-xl space-y-3 border border-slate-200/40">
                                <div className="flex justify-between items-center">
                                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Attributes</span>
                                  <button type="button" onClick={() => {
                                    const nv = [...editForm.variants]; nv[idx].dynamicAttributes.push({key: "", values: [""]}); setEditForm({...editForm, variants: nv});
                                  }} className="text-orange-600 text-xs font-bold hover:text-orange-700">+ Add</button>
                                </div>
                                {v.dynamicAttributes?.map((attr, aIdx) => (
                                  <div key={aIdx} className="bg-white p-2.5 rounded-lg border border-slate-200/60 flex flex-col gap-2">
                                    <input className="text-xs font-bold text-orange-600 outline-none border-b border-dashed border-slate-200 pb-1 focus:border-orange-500 w-full" placeholder="KEY (e.g. SIZE)" value={attr.key} onChange={e => {
                                      const nv = [...editForm.variants]; nv[idx].dynamicAttributes[aIdx].key = e.target.value; setEditForm({...editForm, variants: nv});
                                    }} />
                                    <div className="flex flex-wrap gap-1.5">
                                      {attr.values?.map((val, vIdx) => (
                                        <input key={vIdx} className="bg-slate-50 px-2 py-1 rounded text-xs border border-slate-200 w-20 outline-none focus:border-orange-500 text-slate-700 font-medium" value={val} onChange={e => {
                                          const nv = [...editForm.variants]; nv[idx].dynamicAttributes[aIdx].values[vIdx] = e.target.value; setEditForm({...editForm, variants: nv});
                                        }} />
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-4">
                              {/* Configuration Toggles */}
                              <div className="grid grid-cols-2 gap-3">
                                <RadioSetting 
                                  label="Price Type" 
                                  value={v.settings?.priceMode || "PRODUCT"} 
                                  onChange={val => {
                                    const nv = [...editForm.variants]; 
                                    nv[idx].settings = { ...nv[idx].settings, priceMode: val }; 
                                    setEditForm({...editForm, variants: nv});
                                  }} 
                                />
                                <RadioSetting 
                                  label="Media Type" 
                                  value={v.settings?.imageMode || "PRODUCT"} 
                                  onChange={val => {
                                    const nv = [...editForm.variants]; 
                                    nv[idx].settings = { ...nv[idx].settings, imageMode: val }; 
                                    setEditForm({...editForm, variants: nv});
                                  }} 
                                />
                              </div>

                              {/* Price and Stock Inputs */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className={`transition-opacity duration-200 ${isPriceDisabled ? 'opacity-45 pointer-events-none' : 'opacity-100'}`}>
                                  <InputGroup 
                                    label="Variant Price" 
                                    value={isPriceDisabled ? "" : v.price} 
                                    disabled={isPriceDisabled} 
                                    placeholder={isPriceDisabled ? "Inherited global" : "Enter price"}
                                    onChange={val => {
                                      const nv = [...editForm.variants]; nv[idx].price = val; setEditForm({...editForm, variants: nv});
                                    }} 
                                  />
                                </div>
                                <div className={`transition-opacity duration-200 ${isStockDisabled ? 'opacity-45 pointer-events-none' : 'opacity-100'}`}>
                                  <InputGroup 
                                    label="Stock" 
                                    value={isStockDisabled ? "" : v.stock} 
                                    disabled={isStockDisabled}
                                    placeholder={isStockDisabled ? "Inherited global" : "Enter stock"}
                                    onChange={val => {
                                      const nv = [...editForm.variants]; nv[idx].stock = val; setEditForm({...editForm, variants: nv});
                                    }} 
                                  />
                                </div>
                              </div>

                              {/* Dynamic Media Section */}
                              <div>
                                <label className="text-xs font-semibold text-slate-500 mb-2 block">Variant Media</label>
                                {isImageDisabled ? (
                                  <div className="py-3 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center gap-2 text-slate-400 select-none">
                                    <EyeOff size={14} className="text-slate-400" />
                                    <span className="text-[11px] font-medium tracking-tight">Inheriting main media gallery profiles</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-2 transition-all duration-200">
                                    {v.existingImages?.map((img, iI) => (
                                      <div key={`vex-${iI}`} className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 relative group shadow-sm">
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                        <button 
                                          type="button" 
                                          onClick={() => {
                                            const nv = [...editForm.variants];
                                            nv[idx].existingImages = nv[idx].existingImages.filter((_, xi) => xi !== iI);
                                            setEditForm({...editForm, variants: nv});
                                          }} 
                                          className="absolute inset-0 bg-red-500/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                        >
                                          <X size={14}/>
                                        </button>
                                      </div>
                                    ))}
                                    {v.newImages?.map((f, iI) => (
                                      <div key={`vnew-${iI}`} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-orange-500 relative group shadow-sm">
                                        <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="" />
                                        <button 
                                          type="button" 
                                          onClick={() => {
                                            const nv = [...editForm.variants];
                                            nv[idx].newImages = nv[idx].newImages.filter((_, xi) => xi !== iI);
                                            setEditForm({...editForm, variants: nv});
                                          }} 
                                          className="absolute -top-1 -right-1 bg-white text-red-500 p-0.5 rounded-full shadow-md border"
                                        >
                                          <X size={10}/>
                                        </button>
                                      </div>
                                    ))}
                                    <label className="w-12 h-12 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 hover:text-orange-500 cursor-pointer hover:bg-orange-50 hover:border-orange-500 transition-all">
                                      <Plus size={16}/>
                                      <input type="file" multiple className="hidden" onChange={e => handleFileSelection(e, v.id, 'image')} />
                                    </label>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <button 
                      type="button"
                      onClick={() => setEditForm({...editForm, variants: [...(editForm.variants || []), { id: Date.now(), variantName: "", price: "", stock: "", existingImages: [], newImages: [], dynamicAttributes: [{key: "", values: [""]}], settings: {priceMode: "PRODUCT", imageMode: "PRODUCT"} }]})} 
                      className="w-full py-4 border-2 border-dashed border-orange-500/60 text-orange-600 rounded-xl font-bold text-xs tracking-wide hover:bg-orange-50/50 hover:border-orange-500 transition-all"
                    >
                      + Add New Variant Profile
                    </button>
                  </div>
                </div>

                {/* Sidebar Summary Section - Sticky on Web */}
                <div className="col-span-1 xl:col-span-4 xl:sticky xl:top-0">
                  <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-md space-y-5">
                    <h3 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 flex justify-between items-center uppercase tracking-wider">
                      Sync Summary <Save className="text-orange-500" size={16}/>
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-2 block">Status Control</label>
                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                          <button type="button" onClick={() => setEditForm({...editForm, status: 'draft'})} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${editForm.status === 'draft' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>DRAFT</button>
                          <button type="button" onClick={() => setEditForm({...editForm, status: 'active'})} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${editForm.status === 'active' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400'}`}>ACTIVE</button>
                        </div>
                      </div>

                      <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                        <SummaryRow label="System SKU" value={editForm.sku || "PENDING"} active={!!editForm.sku} />
                        <SummaryRow label="Total Variants" value={editForm.variants?.length || 0} active={true} />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button 
                        type="button" 
                        disabled={loading} 
                        onClick={(e) => { e.preventDefault(); handleUpdateProduct(); }} 
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-xs tracking-wider uppercase hover:bg-orange-500 transition-all shadow-md disabled:opacity-50"
                      >
                        {loading ? "Syncing Changes..." : "Commit Changes"}
                      </button>
                      
                      <p className="text-center text-[10px] text-slate-400 font-semibold mt-3 flex items-center justify-center gap-1">
                        <AlertCircle size={12} className="text-slate-400"/> Sync actions are permanent when pushed.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditProductModal;