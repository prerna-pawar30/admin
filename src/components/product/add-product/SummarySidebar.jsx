import React from "react";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

const SummaryRow = ({ label, value, active }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
    <span className="text-xs text-gray-500">{label}</span>
    <span className={`text-sm font-medium ${active ? "text-[#E68736]" : "text-gray-400"}`}>
      {value}
    </span>
  </div>
);

export default function SummarySidebar({ commonForm, setCommonForm, variants, loading, handleCreateProduct }) {
  const isReady =
    commonForm.name &&
    commonForm.category &&
    commonForm.sku &&
    variants.length > 0;

  return (
    <div className="sticky top-6 space-y-4">
      {/* Summary card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">
          Summary
        </h3>

        {/* Status toggle */}
        <div className="mb-5">
          <p className="text-xs font-medium text-gray-500 mb-2">Product status</p>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setCommonForm({ ...commonForm, status: "draft" })}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors
                ${commonForm.status === "draft"
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              <EyeOff size={13} /> Draft
            </button>
            <button
              type="button"
              onClick={() => setCommonForm({ ...commonForm, status: "active" })}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border-l border-gray-200 transition-colors
                ${commonForm.status === "active"
                  ? "bg-[#E68736] text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              <Eye size={13} /> Active
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">
            {commonForm.status === "draft"
              ? "Draft products are not visible to customers."
              : "Active products are live and visible to customers."}
          </p>
        </div>

        {/* Summary rows */}
        <div className="mb-5">
          <SummaryRow
            label="SKU"
            value={commonForm.sku || "Not generated"}
            active={!!commonForm.sku}
          />
          <SummaryRow
            label="Base price"
            value={commonForm.globalPrice ? `₹${Number(commonForm.globalPrice).toLocaleString("en-IN")}` : "Not set"}
            active={!!commonForm.globalPrice}
          />
          <SummaryRow
            label="Variants"
            value={variants.length > 0 ? `${variants.length} variant${variants.length > 1 ? "s" : ""}` : "None added"}
            active={variants.length > 0}
          />
          <SummaryRow
            label="Category"
            value={commonForm.category ? "Selected" : "Not selected"}
            active={!!commonForm.category}
          />
        </div>

        {/* Checklist */}
        <div className="space-y-1.5 mb-5 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">
            Checklist
          </p>
          {[
            { label: "Product name", done: !!commonForm.name },
            { label: "Category selected", done: !!commonForm.category },
            { label: "Base price set", done: !!commonForm.globalPrice },
            { label: "At least one variant", done: variants.length > 0 },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center gap-2">
              <CheckCircle2
                size={13}
                className={done ? "text-green-500" : "text-gray-300"}
              />
              <span className={`text-xs ${done ? "text-gray-700" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Submit button */}
        <button
          disabled={loading}
          onClick={handleCreateProduct}
          className={`w-full py-3 rounded-lg text-sm font-semibold transition-colors
            ${loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#E68736] text-white hover:bg-[#c96f24]"}`}
        >
          {loading ? "Saving product…" : "Create product"}
        </button>

        {!isReady && !loading && (
          <p className="text-[11px] text-center text-gray-400 mt-2">
            Complete the checklist above before submitting.
          </p>
        )}
      </div>
    </div>
  );
}