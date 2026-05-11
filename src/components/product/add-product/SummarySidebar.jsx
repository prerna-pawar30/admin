import React from "react";
import { Save, EyeOff, Eye } from "lucide-react";
import SummaryRow from "../../ui/SummaryRow";

export default function SummarySidebar({ commonForm, setCommonForm, variants, loading, handleCreateProduct }) {
  return (
    <div className="sticky top-[110px] bg-white rounded-[2.5rem] p-10  border border-orange-200">
      <h3 className="text-2xl font-black mb-8 border-b border-orange-200 pb-6 text-slate-900 flex justify-between items-center">Summary <Save className="text-[#E68736]" size={24} /></h3>
      <div className="mb-8">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Product Status</label>
        <div className="flex  p-1.5 rounded-2xl border border-orange-200">
          <button onClick={() => setCommonForm({ ...commonForm, status: 'draft' })} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all ${commonForm.status === 'draft' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}><EyeOff size={14} /> Draft</button>
          <button onClick={() => setCommonForm({ ...commonForm, status: 'active' })} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all ${commonForm.status === 'active' ? 'bg-[#E68736] text-white shadow-lg' : 'text-slate-400'}`}><Eye size={14} /> Active</button>
        </div>
      </div>
      <div className="space-y-5 mb-10 text-slate-900">
        <SummaryRow label="Live SKU" value={commonForm.sku || "N/A"} active={!!commonForm.sku} />
        <SummaryRow label="Base Price" value={commonForm.globalPrice ? `₹${commonForm.globalPrice}` : "Not Set"} active={!!commonForm.globalPrice} />
        <SummaryRow label="Variants Count" value={variants.length} active={variants.length > 0} />
      </div>
      <button disabled={loading} onClick={handleCreateProduct} className={`w-full py-5 text-white rounded-2xl font-black text-lg transition-all  ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#E68736] hover:bg-slate-900'}`}>{loading ? "Saving Product..." : "Create Product"}</button>
    </div>
  );
}