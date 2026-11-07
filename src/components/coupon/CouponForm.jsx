/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Check, FileText } from "lucide-react";
import { DialogBody, DialogButton, DialogFooter } from "../ui/Dialog";
import { CouponService } from "../../backend/ApiService";
import DropdownGroup from "../../components/ui/DropdownGroup"; // Assuming it is in the same directory

export default function CouponForm({ onSuccess, onCancel, initialData }) {
  const [isSaving, setIsSaving] = useState(false);
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

    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  const labelStyle = "mb-1.5 block text-xs font-semibold text-slate-600";
  const inputStyle = "h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10";
  const sectionTitle = "text-[11px] font-bold uppercase tracking-wider text-brand-600";

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

  const set = (patch) => setFormData({ ...formData, ...patch });
  const setBogo = (patch) => setFormData({ ...formData, buyXGetY: { ...formData.buyXGetY, ...patch } });

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <DialogBody>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* LEFT: campaign identity */}
          <section className="min-w-0 space-y-4 lg:col-span-5 lg:border-r lg:border-slate-100 lg:pr-8">
            <p className={sectionTitle}>Campaign identity</p>

            <div>
              <label className={labelStyle}>Coupon code</label>
              <input
                value={formData.code}
                required
                placeholder="e.g. SUMMER50"
                className={`${inputStyle} font-mono uppercase tracking-wider`}
                onChange={(e) => set({ code: e.target.value.toUpperCase() })}
              />
            </div>

            <div>
              <label className={labelStyle}>Campaign title</label>
              <input value={formData.title} required placeholder="Customer-facing title" className={inputStyle} onChange={(e) => set({ title: e.target.value })} />
            </div>

            <div>
              <label className={labelStyle}>Description</label>
              <textarea
                value={formData.description}
                rows={4}
                placeholder="Terms and eligibility..."
                className={`${inputStyle} h-auto resize-y py-2.5 leading-relaxed [overflow-wrap:anywhere]`}
                onChange={(e) => set({ description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <label className={labelStyle}>Start date</label>
                <input type="date" value={formData.startDate} className={inputStyle} onChange={(e) => set({ startDate: e.target.value })} />
              </div>
              <div className="min-w-0">
                <label className={labelStyle}>End date</label>
                <input type="date" value={formData.endDate} className={inputStyle} onChange={(e) => set({ endDate: e.target.value })} />
              </div>
            </div>
          </section>

          {/* RIGHT: rules */}
          <section className="min-w-0 space-y-5 lg:col-span-7">
            <p className={sectionTitle}>Configuration rules</p>

            <div>
              <label className={labelStyle}>Coupon type</label>
              <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1 sm:grid-cols-4">
                {[
                  ["PERCENT", "Percent"],
                  ["FIXED", "Fixed"],
                  ["FREESHIP", "Free ship"],
                  ["BUY_X_GET_Y_FREE", "Buy X get Y"],
                ].map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => set({ couponType: type })}
                    className={`rounded-lg px-2 py-2 text-xs font-semibold transition-all ${
                      formData.couponType === type ? "bg-white text-brand-600 shadow-sm ring-1 ring-brand-200" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {formData.couponType === "BUY_X_GET_Y_FREE" ? (
              <div className="space-y-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-100 pb-3">
                  <span className="text-xs font-bold text-slate-700">Buy X get Y applies to</span>
                  <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
                    {["BRAND", "CATEGORY"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setBogoTab(t)}
                        className={`rounded-md px-3 py-1 text-[11px] font-bold transition-all ${bogoTab === t ? "bg-brand-500 text-white" : "text-slate-500"}`}
                      >
                        {t === "BRAND" ? "Brand" : "Category"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="min-w-0 space-y-2">
                    <label className={labelStyle}>Customer buys (qty)</label>
                    <input
                      type="number"
                      placeholder="Min qty"
                      className={inputStyle}
                      value={formData.buyXGetY.buyQuantity || ""}
                      onChange={(e) => setBogo({ buyQuantity: Number(e.target.value) })}
                    />
                    <DropdownGroup
                      value={bogoTab === "BRAND" ? formData.buyXGetY.buyBrand || "" : formData.buyXGetY.buyCategory || ""}
                      options={bogoTab === "BRAND" ? brandOptions : categoryOptions}
                      onChange={(val) => {
                        const fallbackVal = val || null;
                        setBogo({
                          buyBrand: bogoTab === "BRAND" ? fallbackVal : null,
                          buyCategory: bogoTab === "CATEGORY" ? fallbackVal : null,
                        });
                      }}
                    />
                  </div>

                  <div className="min-w-0 space-y-2">
                    <label className={`${labelStyle} text-brand-600`}>Customer gets free (qty)</label>
                    <input
                      type="number"
                      placeholder="Free qty"
                      className={inputStyle}
                      value={formData.buyXGetY.getQuantity || ""}
                      onChange={(e) => setBogo({ getQuantity: Number(e.target.value) })}
                    />
                    <DropdownGroup
                      value={bogoTab === "BRAND" ? formData.buyXGetY.getBrand || "" : formData.buyXGetY.getCategory || ""}
                      options={bogoTab === "BRAND" ? brandOptions : categoryOptions}
                      onChange={(val) => {
                        const fallbackVal = val || null;
                        setBogo({
                          getBrand: bogoTab === "BRAND" ? fallbackVal : null,
                          getCategory: bogoTab === "CATEGORY" ? fallbackVal : null,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="min-w-0">
                  <label className={labelStyle}>Value ({formData.couponType === "PERCENT" ? "%" : "₹"})</label>
                  <input value={formData.discountValue} type="number" className={inputStyle} onChange={(e) => set({ discountValue: Number(e.target.value) })} />
                </div>
                <div className="min-w-0">
                  <label className={labelStyle}>Min order (₹)</label>
                  <input value={formData.minOrderAmount} type="number" className={inputStyle} onChange={(e) => set({ minOrderAmount: Number(e.target.value) })} />
                </div>
                <div className="min-w-0">
                  <label className={labelStyle}>Max cap (₹)</label>
                  <input
                    value={formData.maxDiscountAmount || ""}
                    type="number"
                    placeholder="No limit"
                    className={inputStyle}
                    onChange={(e) => set({ maxDiscountAmount: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DropdownGroup
                label="Applies to"
                value={formData.applicableTo}
                options={targetScopeOptions}
                onChange={(val) => set({ applicableTo: val, applicableBrands: [], applicableCategories: [] })}
              />
              {formData.applicableTo !== "ALL" && (
                <DropdownGroup
                  label={formData.applicableTo === "BRAND" ? "Brand" : "Category"}
                  value={formData.applicableTo === "BRAND" ? formData.applicableBrands[0] || "" : formData.applicableCategories[0] || ""}
                  options={formData.applicableTo === "BRAND" ? brandOptions : categoryOptions}
                  onChange={(val) =>
                    set({
                      applicableBrands: formData.applicableTo === "BRAND" ? [val] : [],
                      applicableCategories: formData.applicableTo === "CATEGORY" ? [val] : [],
                    })
                  }
                />
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="min-w-0">
                <label className={labelStyle}>Sequence order</label>
                <input type="text" value={formData.sequence || "100"} className={inputStyle} onChange={(e) => set({ sequence: e.target.value })} />
              </div>
              <DropdownGroup
                label="Live status"
                value={formData.isActive ? "true" : "false"}
                options={liveStatusOptions}
                onChange={(val) => set({ isActive: val === "true" })}
              />
            </div>
          </section>
        </div>
      </DialogBody>

      <DialogFooter>
        {onCancel && (
          <DialogButton tone="ghost" onClick={onCancel}>
            Cancel
          </DialogButton>
        )}
        <DialogButton tone="primary" type="submit" isLoading={isSaving} className="flex-1 sm:flex-none">
          {!isSaving && (formData.isActive ? <Check size={15} strokeWidth={2.5} /> : <FileText size={15} />)}
          {initialData ? "Save changes" : "Create coupon"}
        </DialogButton>
      </DialogFooter>
    </form>
  );
}
