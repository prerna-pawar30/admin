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

/* ── small reusable label ── */
const FieldLabel = ({ children }) => (
  <p className="text-xs font-medium text-gray-500 mb-1.5">{children}</p>
);

/* ── section card wrapper ── */
const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-gray-200 rounded-xl p-5 ${className}`}>
    {children}
  </div>
);

/* ── section heading row ── */
const SectionHeading = ({ step, icon: Icon, title }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <span className="w-6 h-6 rounded-full bg-[#E68736] text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
      {step}
    </span>
    {Icon && <Icon size={16} className="text-[#E68736]" />}
    <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">{title}</h2>
  </div>
);

/* ── stock mode toggle ── */
const StockToggle = ({ value, onChange }) => (
  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
    {["PRODUCT", "VARIANT"].map((mode) => (
      <button
        key={mode}
        type="button"
        onClick={() => onChange(mode)}
        className={`flex-1 py-2 text-xs font-medium transition-colors
          ${value === mode
            ? "bg-[#E68736] text-white"
            : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
      >
        {mode === "PRODUCT" ? "Shared (product)" : "Per variant"}
      </button>
    ))}
  </div>
);

export default function BasicInfoSection({
  commonForm, setCommonForm, categories, brands,
  selectionSettings, setSelectionSettings,
  handleCategorySelection, handleFileSelection
}) {
  return (
    <Card>
      <SectionHeading step="1" title="Basic information" />

      {/* Row 1 — name & category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <InputGroup
          label="Product name"
          value={commonForm.name}
          onChange={v => setCommonForm({ ...commonForm, name: v })}
          placeholder="e.g. Titanium Abutment Pro"
        />
        <DropdownGroup
          label="Category"
          options={categories}
          value={commonForm.category}
          onChange={handleCategorySelection}
        />
      </div>

      {/* Row 2 — brand & material */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <MultiSelectGroup
          label="Brand"
          options={brands}
          values={commonForm.brand}
          onChange={vals => setCommonForm({ ...commonForm, brand: vals })}
        />
        <DropdownGroup
          label="Material"
          options={MaterialOptions}
          value={commonForm.material}
          onChange={v => setCommonForm({ ...commonForm, material: v })}
        />
      </div>

      {/* Divider */}
      <hr className="border-gray-100 mb-5" />

      {/* Stock mode */}
      <div className="mb-4">
        <FieldLabel>Stock mode</FieldLabel>
        <StockToggle
          value={selectionSettings.stockMode}
          onChange={v => setSelectionSettings({ ...selectionSettings, stockMode: v })}
        />
        <p className="text-[11px] text-gray-400 mt-1.5">
          "Shared" = one stock pool for the product · "Per variant" = each variant tracks its own stock
        </p>
      </div>

      {/* Price & stock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <InputGroup
          label="Base price (₹)"
          
          value={commonForm.globalPrice}
          onChange={v => setCommonForm({ ...commonForm, globalPrice: v })}
          placeholder="0.00"
        />
        {selectionSettings.stockMode === "PRODUCT" && (
          <InputGroup
            label="Global stock count"
            
            value={commonForm.globalStock}
            onChange={v => setCommonForm({ ...commonForm, globalStock: v })}
            placeholder="0"
          />
        )}
      </div>

      {/* Divider */}
      <hr className="border-gray-100 mb-5" />

      {/* Gallery */}
      <div className="mb-5">
        <FieldLabel>Product gallery</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {commonForm.globalImages.map((file, i) => (
            <div
              key={i}
              className="relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0"
            >
              <img
                src={URL.createObjectURL(file)}
                className="w-full h-full object-cover"
                alt="product"
              />
              <button
                onClick={() =>
                  setCommonForm({
                    ...commonForm,
                    globalImages: commonForm.globalImages.filter((_, idx) => idx !== i),
                  })
                }
                className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/50 rounded-full flex items-center justify-center"
              >
                <X size={9} className="text-white" />
              </button>
            </div>
          ))}
          <label className="w-16 h-16 border border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#E68736] hover:bg-orange-50 transition-colors flex-shrink-0">
            <Plus size={18} className="text-gray-400" />
            <input
              type="file"
              multiple
              className="hidden"
              onChange={e => handleFileSelection(e, null, "globalImage")}
            />
          </label>
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">
          Upload one or more images. First image will be the thumbnail.
        </p>
      </div>

      {/* Divider */}
      <hr className="border-gray-100 mb-5" />

      {/* Series / SKU */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <InputGroup
          label="Series number"
          value={commonForm.seriesNumber}
          onChange={v => setCommonForm({ ...commonForm, seriesNumber: v })}
          placeholder="e.g. 01"
        />
        <InputGroup
          label="Sub-series number"
          value={commonForm.subSeriesNumber}
          onChange={v => setCommonForm({ ...commonForm, subSeriesNumber: v })}
          placeholder="e.g. A"
        />
      </div>

      {/* SKU display */}
      <div className="flex items-center justify-between px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg">
        <span className="text-xs text-orange-600 font-medium uppercase tracking-wide">
          Generated SKU
        </span>
        <span className="text-lg font-semibold text-[#E68736] tracking-widest">
          {commonForm.sku || "---"}
        </span>
      </div>
    </Card>
  );
}