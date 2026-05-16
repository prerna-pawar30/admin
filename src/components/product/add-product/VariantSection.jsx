/* eslint-disable no-unused-vars */
import React from "react";
import { Trash2, Plus, PlusCircle, X, Settings2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InputGroup from "../../ui/InputGroup";

const inputCls =
  "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 outline-none focus:border-[#E68736] focus:ring-2 focus:ring-orange-100 transition-colors placeholder-gray-300";

/* ── two-option toggle ── */
const ModeToggle = ({ label, value, optionA, optionB, onChange }) => (
  <div>
    <p className="text-xs font-medium text-gray-500 mb-1.5">{label}</p>
    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(optionA.value)}
        className={`flex-1 py-2 text-xs font-medium transition-colors
          ${value === optionA.value ? "bg-[#E68736] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
      >
        {optionA.label}
      </button>
      <button
        type="button"
        onClick={() => onChange(optionB.value)}
        className={`flex-1 py-2 text-xs font-medium border-l border-gray-200 transition-colors
          ${value === optionB.value ? "bg-[#E68736] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
      >
        {optionB.label}
      </button>
    </div>
  </div>
);

/* ── disabled placeholder field ── */
const DisabledField = ({ label, text }) => (
  <div>
    <p className="text-xs font-medium text-gray-400 mb-1.5">{label}</p>
    <div className="w-full px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 text-xs text-gray-400 italic">
      {text}
    </div>
  </div>
);

export default function VariantSection({
  variants, setVariants, selectionSettings, commonForm,
  updateVariant, handleFileSelection,
  updateAttributeValue, addAttributeValue, removeAttributeValue, addVariantRow
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      {/* Section heading */}
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-6 h-6 rounded-full bg-[#E68736] text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
          4
        </span>
        <Settings2 size={15} className="text-[#E68736]" />
        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
          Product variants
        </h2>
      </div>

      {/* Empty state */}
      {variants.length === 0 && (
        <div className="py-8 text-center border border-dashed border-gray-200 rounded-lg mb-4">
          <p className="text-sm text-gray-400">No variants added yet</p>
          <p className="text-xs text-gray-300 mt-1">
            At least one variant is required to create a product.
          </p>
        </div>
      )}

      {/* Variant cards */}
      <AnimatePresence>
        {variants.map((v, idx) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="border border-gray-200 rounded-xl overflow-hidden mb-4"
          >
            {/* Variant header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Variant #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => setVariants(variants.filter(x => x.id !== v.id))}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Mode toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <ModeToggle
                  label="Price mode"
                  value={v.settings.priceMode}
                  optionA={{ value: "PRODUCT", label: "Use product price" }}
                  optionB={{ value: "VARIANT", label: "Set custom price" }}
                  onChange={val => updateVariant(v.id, "settings", { ...v.settings, priceMode: val })}
                />
                <ModeToggle
                  label="Image mode"
                  value={v.settings.imageMode}
                  optionA={{ value: "PRODUCT", label: "Use product images" }}
                  optionB={{ value: "VARIANT", label: "Upload own" }}
                  onChange={val => updateVariant(v.id, "settings", { ...v.settings, imageMode: val })}
                />
              </div>

              {/* Variant label + stock/price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <InputGroup
                    label="Variant label"
                    value={v.variantName}
                    onChange={val => updateVariant(v.id, "variantName", val)}
                    placeholder="e.g. Large / Silver"
                  />
                </div>

                {/* Price */}
                {v.settings.priceMode === "VARIANT" ? (
                  <InputGroup
                    label="Custom price (₹)"
                  
                    value={v.price}
                    onChange={val => updateVariant(v.id, "price", val)}
                    placeholder="0.00"
                  />
                ) : (
                  <DisabledField label="Price" text="Using base product price" />
                )}

                {/* Stock */}
                {selectionSettings.stockMode === "VARIANT" ? (
                  <InputGroup
                    label="Stock count"
                    
                    value={v.stock}
                    onChange={val => updateVariant(v.id, "stock", val)}
                    placeholder="0"
                  />
                ) : (
                  <DisabledField label="Stock" text="Managed globally" />
                )}
              </div>

              {/* Variant images */}
              {v.settings.imageMode === "VARIANT" && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Variant images</p>
                  <div className="flex flex-wrap gap-2">
                    {v.images.map((file, i) => (
                      <div
                        key={i}
                        className="relative w-14 h-14 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          className="w-full h-full object-cover"
                          alt="variant"
                        />
                        <button
                          onClick={() =>
                            updateVariant(v.id, "images", v.images.filter((_, idx) => idx !== i))
                          }
                          className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/50 rounded-full flex items-center justify-center"
                        >
                          <X size={9} className="text-white" />
                        </button>
                      </div>
                    ))}
                    <label className="w-14 h-14 border border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#E68736] hover:bg-orange-50 transition-colors flex-shrink-0">
                      <Plus size={16} className="text-gray-400" />
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={e => handleFileSelection(e, v.id, "image")}
                      />
                    </label>
                  </div>
                </div>
              )}
              {v.settings.imageMode === "PRODUCT" && (
                <p className="text-xs text-gray-400 italic px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                  This variant uses the product's main gallery images.
                </p>
              )}

              {/* Attributes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-gray-500">Attributes</p>
                  <button
                    type="button"
                    onClick={() =>
                      updateVariant(v.id, "dynamicAttributes", [
                        ...v.dynamicAttributes,
                        { key: "", values: [""] },
                      ])
                    }
                    className="flex items-center gap-1 text-xs text-[#E68736] hover:opacity-70 transition-opacity"
                  >
                    <PlusCircle size={13} /> Add attribute
                  </button>
                </div>

                <div className="space-y-3">
                  {v.dynamicAttributes.map((attr, aIdx) => (
                    <div
                      key={aIdx}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50/50"
                    >
                      {/* Attribute key row */}
                      <div className="flex items-center gap-2 mb-2.5">
                        <input
                          className="flex-1 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide border border-gray-200 rounded-lg bg-white text-[#E68736] outline-none focus:border-[#E68736] focus:ring-2 focus:ring-orange-100"
                          placeholder="Attribute name (e.g. Color)"
                          value={attr.key}
                          onChange={e => {
                            const na = [...v.dynamicAttributes];
                            na[aIdx].key = e.target.value;
                            updateVariant(v.id, "dynamicAttributes", na);
                          }}
                        />
                        {v.dynamicAttributes.length > 1 && (
                          <button
                            onClick={() =>
                              updateVariant(
                                v.id,
                                "dynamicAttributes",
                                v.dynamicAttributes.filter((_, i) => i !== aIdx)
                              )
                            }
                            className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      {/* Attribute values */}
                      <div className="flex flex-wrap gap-2 items-center">
                        {attr.values.map((val, vIdx) => (
                          <div
                            key={vIdx}
                            className="flex items-center gap-1 border border-gray-200 rounded-full px-3 py-1 bg-white"
                          >
                            <input
                              className="bg-transparent text-xs text-gray-700 outline-none w-16"
                              placeholder="Value…"
                              value={val}
                              onChange={e => updateAttributeValue(v.id, aIdx, vIdx, e.target.value)}
                            />
                            {attr.values.length > 1 && (
                              <button
                                onClick={() => removeAttributeValue(v.id, aIdx, vIdx)}
                                className="text-gray-300 hover:text-red-400 transition-colors"
                              >
                                <X size={10} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addAttributeValue(v.id, aIdx)}
                          className="w-7 h-7 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-[#E68736] hover:text-[#E68736] transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add variant button */}
      <button
        type="button"
        onClick={addVariantRow}
        className="w-full py-2.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#E68736] hover:text-[#E68736] flex items-center justify-center gap-2 transition-colors"
      >
        <Plus size={15} /> Add new variant
      </button>
    </div>
  );
}