import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Box, Sparkles, FileText, CheckCircle2 } from "lucide-react";
import apiClient from "../../utils/apiClient"; // For specific options fetch
import { API_ROUTES } from "../../backend/ApiRoutes";
import { CouponService } from "../../backend/ApiService";

// eslint-disable-next-line react-refresh/only-export-components
function CouponForm({ onSuccess, initialData }) {
  const [formData, setFormData] = useState({
    code: "", title: "", description: "", couponType: "PERCENT",
    discountValue: 0, maxDiscountAmount: null, minOrderAmount: 0, 
    startDate: "", endDate: "", 
    applicableTo: "ALL", applicableProducts: [], applicableCategories: [], applicableBrands: [],
    stackable: false, autoApply: false, isActive: true,
    buyXGetY: { 
        buyQuantity: 0, getQuantity: 0, 
        buyBrand: null, buyCategory: null, buyProducts: [], 
        getBrand: null, getCategory: null, getProducts: [],
        getDiscountPercent: 100
    }
  });

  const [options, setOptions] = useState({ brands: [], categories: [], products: [] });
  const [bogoTab, setBogoTab] = useState("BRAND");

  useEffect(() => {
    if (initialData) {
      let detectedTab = "BRAND";
      if (initialData.buyXGetY?.buyProducts?.length > 0) detectedTab = "PRODUCT";
      else if (initialData.buyXGetY?.buyCategory) detectedTab = "CATEGORY";
      setBogoTab(detectedTab);

      setFormData({
        ...initialData,
        startDate: initialData.startDate?.split('T')[0] || "",
        endDate: initialData.endDate?.split('T')[0] || "",
      });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [b, c, p] = await Promise.all([
          apiClient.get(API_ROUTES.BRAND.GET_ALL),
          apiClient.get(API_ROUTES.CATEGORY.GET),
          apiClient.get(API_ROUTES.PRODUCT.GET_ALL)
        ]);
        setOptions({
          brands: b.data?.data?.brands || [],
          categories: Array.isArray(c.data?.data) ? c.data.data : [],
          products: p.data?.data?.products || []
        });    
         console.log("Fetched options:", { brands: b.data?.data?.brands, categories: c.data?.data, products: p.data?.data?.products });

      } catch (err) { console.error("Error fetching options", err); }
    };
    fetchOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await CouponService.saveCoupon(formData, initialData?.couponId);
      if (data.success) {
        Swal.fire('Success', data.message, 'success');
        onSuccess();
      }
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Submission failed', 'error');
    }
  };

  return (
    <form className="flex-1 overflow-y-auto p-8 space-y-10" onSubmit={handleSubmit}>
      {/* Code and Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coupon Code</label>
          <input value={formData.code} required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E68736] outline-none font-mono font-bold" onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign Title</label>
          <input value={formData.title} required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E68736] outline-none font-bold" onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>
      </div>

      {/* Reward Types */}
      <div className="space-y-4">
        <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Reward Type</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["PERCENT", "FIXED", "FREESHIP", "BUY_X_GET_Y_FREE"].map(t => (
            <button key={t} type="button" onClick={() => setFormData({...formData, couponType: t})} className={`p-3 rounded-xl text-[10px] font-black border-2 transition-all ${formData.couponType === t ? 'bg-[#E68736] border-[#E68736] text-white' : 'bg-white text-slate-400 border-slate-100'}`}>
              {t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {formData.couponType === "BUY_X_GET_Y_FREE" ? (
          <div className="p-6 bg-orange-50/50 rounded-3xl border-2 border-dashed border-orange-200 space-y-4">
            <div className="flex gap-2 justify-center mb-4">
              {["BRAND", "CATEGORY", "PRODUCT"].map(t => (
                <button key={t} type="button" onClick={() => setBogoTab(t)} className={`px-4 py-1 rounded-lg text-[10px] font-black ${bogoTab === t ? 'bg-[#E68736] text-white' : 'bg-white text-slate-400 shadow-sm'}`}>{t}</button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Buy Logic */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Box size={14} className="text-[#E68736]" /> Buy Quantity
                </label>
                <div className="space-y-2">
                  <input type="number" className="w-full p-4 rounded-xl border-2 border-white bg-white shadow-sm font-bold outline-none" value={formData.buyXGetY.buyQuantity} onChange={e => setFormData({...formData, buyXGetY: {...formData.buyXGetY, buyQuantity: Number(e.target.value)}})} />
                  <select 
                    className="w-full p-3 rounded-xl border-2 border-slate-100 font-bold text-sm outline-none" 
                    value={bogoTab === "PRODUCT" ? (formData.buyXGetY.buyProducts[0] || "") : (bogoTab === "BRAND" ? (formData.buyXGetY.buyBrand || "") : (formData.buyXGetY.buyCategory || ""))}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({
                        ...formData, 
                        buyXGetY: {
                          ...formData.buyXGetY, 
                          buyProducts: bogoTab === "PRODUCT" ? [val] : [],
                          buyBrand: bogoTab === "BRAND" ? val : null,
                          buyCategory: bogoTab === "CATEGORY" ? val : null
                        }
                      });
                    }}
                  >
                    <option value="">Select Buy {bogoTab}</option>
                    {bogoTab === "BRAND" && options.brands.map(b => <option key={b._id} value={b._id}>{b.brandName}</option>)}
                    {bogoTab === "CATEGORY" && options.categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    {bogoTab === "PRODUCT" && options.products.map(p => <option key={p._id} value={p.productId}>{p.productName}</option>)}
                  </select>
                </div>
              </div>

              {/* Get Logic */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={14} /> Get Quantity (Free)
                </label>
                <div className="space-y-2">
                  <input type="number" className="w-full p-4 rounded-xl border-2 border-emerald-100 bg-white shadow-sm font-bold outline-none" value={formData.buyXGetY.getQuantity} onChange={e => setFormData({...formData, buyXGetY: {...formData.buyXGetY, getQuantity: Number(e.target.value)}})} />
                  <select 
                    className="w-full p-3 rounded-xl border-2 border-slate-100 font-bold text-sm outline-none" 
                    value={bogoTab === "PRODUCT" ? (formData.buyXGetY.getProducts[0] || "") : (bogoTab === "BRAND" ? (formData.buyXGetY.getBrand || "") : (formData.buyXGetY.getCategory || ""))}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({
                        ...formData, 
                        buyXGetY: {
                          ...formData.buyXGetY, 
                          getProducts: bogoTab === "PRODUCT" ? [val] : [],
                          getBrand: bogoTab === "BRAND" ? val : null,
                          getCategory: bogoTab === "CATEGORY" ? val : null
                        }
                      });
                    }}
                  >
                    <option value="">Select Reward {bogoTab}</option>
                    {bogoTab === "BRAND" && options.brands.map(b => <option key={b._id} value={b._id}>{b.brandName}</option>)}
                    {bogoTab === "CATEGORY" && options.categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    {bogoTab === "PRODUCT" && options.products.map(p => <option key={p._id} value={p.productId}>{p.productName}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <label className="text-[10px] font-black text-slate-400 block mb-1">Discount {formData.couponType === 'PERCENT' ? '%' : '₹'}</label>
              <input value={formData.discountValue} type="number" className="w-full bg-transparent text-2xl font-black outline-none" onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} />
            </div>
            {/* Min Order & Max Cap Inputs... */}
          </div>
        )}
      </div>

      {/* Date and Visibility */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Start Date</label>
        <input value={formData.startDate} type="date" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" onChange={e => setFormData({...formData, startDate: e.target.value})} /></div>
        <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">End Date</label>
        <input value={formData.endDate} type="date" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" onChange={e => setFormData({...formData, endDate: e.target.value})} /></div>
      </div>

      <button type="submit" className={`w-full py-6 text-white rounded-[2rem] font-black text-xl transition-all shadow-xl flex items-center justify-center gap-3 ${formData.isActive ? 'bg-slate-900 hover:bg-[#E68736]' : 'bg-slate-500 hover:bg-slate-600'}`}>
        {formData.isActive ? <CheckCircle2 size={24} /> : <FileText size={24} />}
        {initialData ? 'Update Campaign' : 'Deploy Campaign'}
      </button>
    </form>
  );
}
export default CouponForm;