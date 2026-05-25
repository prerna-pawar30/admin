/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Check, FileText } from "lucide-react";
import { CouponService } from "../../backend/ApiService";
import DropdownGroup from "../../components/ui/DropdownGroup"; // Assuming it is in the same directory

export default function CouponForm({ onSuccess, initialData }) {
  const [formData, setFormData] = useState({
    code: "", title: "", description: "", couponType: "PERCENT",
    discountValue: 0, maxDiscountAmount: null, minOrderAmount: 0,
    startDate: "", endDate: "",
    applicableTo: "ALL", applicableProducts: [], applicableCategories: [], applicableBrands: [],
    stackable: false, autoApply: false, isActive: true,
    sequence: "100",
    buyXGetY: {
      buyQuantity: 0, getQuantity: 0,
      buyBrand: null, buyCategory: null,
      getBrand: null, getCategory: null,
      getDiscountPercent: 100
    }
  });

  const [options, setOptions] = useState({ brands: [], categories: [] });
  const [bogoTab, setBogoTab] = useState("BRAND");

  useEffect(() => {
    if (initialData) {
      let detectedTab = "BRAND";
      if (initialData.buyXGetY?.buyCategory || initialData.buyXGetY?.getCategory) {
        detectedTab = "CATEGORY";
      }
      setBogoTab(detectedTab);

      const bogoData = initialData.buyXGetY || {};
      
      const parsedBuyBrand = typeof bogoData.buyBrand === 'object' ? bogoData.buyBrand?._id : bogoData.buyBrand;
      const parsedGetBrand = typeof bogoData.getBrand === 'object' ? bogoData.getBrand?._id : bogoData.getBrand;
      
      const parsedBuyCategory = typeof bogoData.buyCategory === 'object' ? bogoData.buyCategory?._id : bogoData.buyCategory;
      const parsedGetCategory = typeof bogoData.getCategory === 'object' ? bogoData.getCategory?._id : bogoData.getCategory;

      setFormData({
        ...initialData,
        startDate: initialData.startDate?.split('T')[0] || "",
        endDate: initialData.endDate?.split('T')[0] || "",
        applicableCategories: initialData.applicableCategories || [],
        applicableBrands: initialData.applicableBrands || [],
        buyXGetY: {
          ...bogoData,
          buyQuantity: bogoData.buyQuantity || 0,
          getQuantity: bogoData.getQuantity || 0,
          buyBrand: parsedBuyBrand || null,
          getBrand: parsedGetBrand || null,
          buyCategory: parsedBuyCategory || null,
          getCategory: parsedGetCategory || null,
          getDiscountPercent: bogoData.getDiscountPercent ?? 100
        }
      });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await CouponService.getCouponOptions();
        setOptions({ brands: data.brands || [], categories: data.categories || [] });
      } catch (err) {
        console.error("Error loading form data:", err);
      }
    };
    fetchOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { usageLimit, stackable, autoApply, sequence, ...payload } = formData;

    const cleanedBuyXGetY = { ...payload.buyXGetY };
    if (cleanedBuyXGetY.buyBrand === null) delete cleanedBuyXGetY.buyBrand;
    if (cleanedBuyXGetY.getBrand === null) delete cleanedBuyXGetY.getBrand;
    if (cleanedBuyXGetY.buyCategory === null) delete cleanedBuyXGetY.buyCategory;
    if (cleanedBuyXGetY.getCategory === null) delete cleanedBuyXGetY.getCategory;

    const finalPayload = {
      ...payload,
      permission: initialData ? "marketing.coupon.update" : "marketing.coupon.create",
      buyXGetY: cleanedBuyXGetY,
      discountValue: Number(payload.discountValue) || 0,
      maxDiscountAmount: payload.maxDiscountAmount === null ? 0 : Number(payload.maxDiscountAmount),
    };

    try {
      const result = await CouponService.saveCoupon(finalPayload, initialData?.couponId);
      if (result.success) {
        Swal.fire({
          title: 'Success',
          text: result.message,
          icon: 'success',
          confirmButtonColor: '#E68736'
        });
        onSuccess();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error?.details?.join('<br/>') || 'Check your inputs';
      Swal.fire({
        title: 'Validation Error',
        html: `<div class="text-left text-sm font-mono">${errorMsg}</div>`,
        icon: 'error'
      });
    }
  };

  const labelStyle = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2";
  const inputStyle = "w-full px-4 py-3 bg-white border border-orange-100 rounded-xl focus:border-[#E68736] focus:ring-1 focus:ring-[#E68736] outline-none text-slate-700 font-medium placeholder-slate-300 transition-all text-sm";

  // Formatted options list for DropdownGroup mapping
  const brandOptions = [
    { value: "", label: `Select brand...` },
    ...options.brands.map(b => ({ value: b._id, label: b.brandName }))
  ];

  const categoryOptions = [
    { value: "", label: `Select category...` },
    ...options.categories.map(c => ({ value: c._id, label: c.name }))
  ];

  const targetScopeOptions = [
    { value: "ALL", label: "Entire Store Marketplace" },
    { value: "BRAND", label: "Filter Specific Brand" },
    { value: "CATEGORY", label: "Filter Specific Category" }
  ];

  const liveStatusOptions = [
    { value: "true", label: "Online" },
    { value: "false", label: "Draft / Offline" }
  ];

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 shadow-sm">
      <div className="mb-8 border-b border-slate-100 pb-5">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          {initialData ? 'Refine Coupon Asset' : 'Create Coupon Asset'}
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          Adjust parameters and live visibility configurations
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDE: Marketing Info & Logic Rules */}
          <div className="lg:col-span-5 space-y-5 border-r border-slate-100 lg:pr-8">
            <span className="block text-[11px] font-black text-[#E68736] uppercase tracking-widest mb-2">Campaign Identity</span>
            
            <div>
              <label className={labelStyle}>Coupon Code</label>
              <input
                value={formData.code}
                required
                placeholder="E.g., SUMMER50"
                className={`${inputStyle} font-mono tracking-wider uppercase`}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </div>

            <div>
              <label className={labelStyle}>Campaign Title</label>
              <input
                value={formData.title}
                required
                placeholder="Enter consumer facing title"
                className={inputStyle}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className={labelStyle}>Description</label>
              <textarea
                value={formData.description}
                rows={4}
                placeholder="Describe terms and eligibility definitions..."
                className={`${inputStyle} resize-none leading-relaxed`}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className={labelStyle}>Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  className={inputStyle}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className={labelStyle}>End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  className={inputStyle}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Financial Configuration & Controls */}
          <div className="lg:col-span-7 space-y-6">
            <span className="block text-[11px] font-black text-[#E68736] uppercase tracking-widest">Configuration Rules</span>

            <div>
              <label className={labelStyle}>Select Coupon Type</label>
              <div className="grid grid-cols-4 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                {["PERCENT", "FIXED", "FREESHIP", "BUY_X_GET_Y_FREE"].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, couponType: t })}
                    className={`py-2 px-1 rounded-lg text-[10px] font-bold transition-all text-center tracking-tight ${
                      formData.couponType === t
                        ? 'bg-white text-[#E68736] shadow-sm border border-orange-100 font-extrabold'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {t.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {formData.couponType === "BUY_X_GET_Y_FREE" ? (
              <div className="p-5 bg-orange-50/30 rounded-xl border border-orange-100 space-y-4">
                <div className="flex gap-2 items-center justify-between border-b border-orange-100/50 pb-3">
                  <span className="text-xs font-bold text-slate-700">BOGO Assignment Metric</span>
                  <div className="flex bg-white border border-slate-200 p-0.5 rounded-lg">
                    {["BRAND", "CATEGORY"].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setBogoTab(t)}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                          bogoTab === t ? 'bg-[#E68736] text-white' : 'text-slate-400'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Buy Condition</label>
                    <input
                      type="number"
                      placeholder="Min Qty"
                      className={inputStyle}
                      value={formData.buyXGetY.buyQuantity || ""}
                      onChange={e => setFormData({ ...formData, buyXGetY: { ...formData.buyXGetY, buyQuantity: Number(e.target.value) } })}
                    />
                    <DropdownGroup
                      value={bogoTab === "BRAND" ? (formData.buyXGetY.buyBrand || "") : (formData.buyXGetY.buyCategory || "")}
                      options={bogoTab === "BRAND" ? brandOptions : categoryOptions}
                      onChange={(val) => {
                        const fallbackVal = val || null;
                        setFormData({
                          ...formData,
                          buyXGetY: {
                            ...formData.buyXGetY,
                            buyBrand: bogoTab === "BRAND" ? fallbackVal : null,
                            buyCategory: bogoTab === "CATEGORY" ? fallbackVal : null
                          }
                        });
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#E68736] uppercase">Reward Condition</label>
                    <input
                      type="number"
                      placeholder="Free Qty"
                      className={inputStyle}
                      value={formData.buyXGetY.getQuantity || ""}
                      onChange={e => setFormData({ ...formData, buyXGetY: { ...formData.buyXGetY, getQuantity: Number(e.target.value) } })}
                    />
                    <DropdownGroup
                      value={bogoTab === "BRAND" ? (formData.buyXGetY.getBrand || "") : (formData.buyXGetY.getCategory || "")}
                      options={bogoTab === "BRAND" ? brandOptions : categoryOptions}
                      onChange={(val) => {
                        const fallbackVal = val || null;
                        setFormData({
                          ...formData,
                          buyXGetY: {
                            ...formData.buyXGetY,
                            getBrand: bogoTab === "BRAND" ? fallbackVal : null,
                            getCategory: bogoTab === "CATEGORY" ? fallbackVal : null
                          }
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelStyle}>Value ({formData.couponType === 'PERCENT' ? '%' : '₹'})</label>
                  <input
                    value={formData.discountValue}
                    type="number"
                    className={inputStyle}
                    onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Min Order (₹)</label>
                  <input
                    value={formData.minOrderAmount}
                    type="number"
                    className={inputStyle}
                    onChange={e => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Max Cap (₹)</label>
                  <input
                    value={formData.maxDiscountAmount || ""}
                    type="number"
                    placeholder="No Limit"
                    className={inputStyle}
                    onChange={e => setFormData({ ...formData, maxDiscountAmount: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <DropdownGroup
                label="Applicable Target Scope"
                value={formData.applicableTo}
                options={targetScopeOptions}
                onChange={val => setFormData({ ...formData, applicableTo: val, applicableBrands: [], applicableCategories: [] })}
              />

              {formData.applicableTo !== "ALL" && (
                <DropdownGroup
                  label="Target Entry Select"
                  value={formData.applicableTo === "BRAND" ? formData.applicableBrands[0] || "" : formData.applicableCategories[0] || ""}
                  options={formData.applicableTo === "BRAND" ? brandOptions : categoryOptions}
                  onChange={(val) => {
                    setFormData({
                      ...formData,
                      applicableBrands: formData.applicableTo === "BRAND" ? [val] : [],
                      applicableCategories: formData.applicableTo === "CATEGORY" ? [val] : [],
                    });
                  }}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className={labelStyle}>Sequence Order</label>
                <input
                  type="text"
                  value={formData.sequence || "100"}
                  className={inputStyle}
                  onChange={e => setFormData({ ...formData, sequence: e.target.value })}
                />
              </div>

              <DropdownGroup
                label="Live Status"
                value={formData.isActive ? "true" : "false"}
                options={liveStatusOptions}
                onChange={val => setFormData({ ...formData, isActive: val === "true" })}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3.5 bg-[#E68736] hover:bg-[#d47627] text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {formData.isActive ? <Check size={14} strokeWidth={3} /> : <FileText size={14} />}
                COMMIT CAMPAIGN UPDATE
              </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}