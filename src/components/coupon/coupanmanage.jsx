/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { 
  Plus, Tag, Users, Trash2, X, Box,  Sparkles, Zap, Settings2,
  Inbox, Power, FileText, CheckCircle2, Loader2
} from "lucide-react";

// ✅ CORRECTED IMPORT: Points to your apiservice.js
import { CouponService } from "../../backend/ApiService";

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");

 // ... inside CouponManager component

  const fetchCoupons = async (tabId) => {
    setLoading(true);
    try {
      // Map UI tabs to backend expected path values
      const statusMap = {
        "ALL": "all",
        "ACTIVE": "true",
        "DRAFT": "false"
      };
      
      const backendStatus = statusMap[tabId || activeTab] || "all";
      const data = await CouponService.getCoupons(backendStatus);
      
      setCoupons(data || []);
    } catch (err) {
      console.error("Fetch Coupons Error:", err);
      setCoupons([]);
    } finally { 
      setLoading(false); 
    }
  };

  // Update tab click to trigger a new fetch
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    fetchCoupons(tabId);
  };

  // Initial load
  useEffect(() => { 
    fetchCoupons("ALL"); 
  }, []);

const handleEditClick = async (couponId) => {
    setIsFetchingDetail(true);
    try {
      const result = await CouponService.getCouponById(couponId);
      
      // Based on your Postman structure, the coupon object is inside result.data
      if (result && result.success) {
        setEditingCoupon(result.data); 
        setShowForm(true);
      } else {
        Toast.fire({ icon: 'error', title: 'Coupon not found' });
      }
    } catch (err) {
      Toast.fire({ icon: 'error', title: 'Server Error' });
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const filteredCoupons = useMemo(() => {
    if (activeTab === "ACTIVE") return coupons.filter(c => c.isActive);
    if (activeTab === "DRAFT") return coupons.filter(c => !c.isActive);
    return coupons;
  }, [coupons, activeTab]);

  const deleteCoupon = async (couponId) => {
    const result = await Swal.fire({
      title: 'Remove Campaign?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E68736',
      confirmButtonText: 'Yes, Delete',
    });

    if (result.isConfirmed) {
      try {
        const data = await CouponService.deleteCoupon(couponId);
        if (data.success) {
          Toast.fire({ icon: 'success', title: 'Campaign Deleted' });
          fetchCoupons();
        }
      } catch (err) {
        Swal.fire('Error', 'Failed to reach server', 'error');
      }
    }
  };

  const toggleStatus = async (couponId, currentStatus) => {
    try {
      const res = await CouponService.updateStatus(couponId, !currentStatus);
      if (res.success) {
        Toast.fire({ icon: 'success', title: `Coupon ${!currentStatus ? 'Live' : 'Paused'}` });
        fetchCoupons();
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  return (
    <div className="py-20 min-h-screen text-slate-900 p-4 md:p-10 font-sans bg-[#FDFDFD]">
      {isFetchingDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <Loader2 className="text-[#E68736] animate-spin" size={40} />
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#E68736]">
               <Zap size={18} fill="currentColor" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">Marketing Engine</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Campaign<span className="text-[#E68736]"> Manager</span></h1>
          </div>
          
          <button 
            onClick={() => { setEditingCoupon(null); setShowForm(true); }}
            className="flex items-center gap-3 bg-[#E68736] hover:bg-orange-400 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg"
          >
            <Plus size={20} strokeWidth={3} />
            CREATE NEW OFFER
          </button>
        </div>

        {/* Tab Navigation */}

        <div className="flex items-center gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
          {[
            { id: "ALL", label: "All", icon: Inbox },
            { id: "ACTIVE", label: "Active", icon: Power },
            { id: "DRAFT", label: "Drafts", icon: Settings2 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)} // <--- Updated this
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === tab.id ? "bg-white text-[#E68736] shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
              {/* Note: The counts below will now reflect the currently loaded list */}
              <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] ${activeTab === tab.id ? "bg-orange-100" : "bg-slate-200 text-slate-500"}`}>
                {tab.id === activeTab ? coupons.length : "-"}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-[#E68736] rounded-full animate-spin" />
          </div>
        ) : filteredCoupons.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCoupons.map((coupon) => (
              <CouponCard 
                key={coupon._id} 
                coupon={coupon} 
                onDelete={() => deleteCoupon(coupon.couponId)} 
                onToggle={() => toggleStatus(coupon.couponId, coupon.isActive)}
                onEdit={() => handleEditClick(coupon.couponId)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
             <Inbox className="mx-auto text-slate-300 mb-4" size={48} />
             <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No campaigns found</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-5xl bg-white h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-orange-50/50">
               <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                  {editingCoupon ? 'Edit Campaign' : 'New Campaign'}
               </h2>
               <button onClick={() => setShowForm(false)} className="p-2 hover:bg-orange-100 text-[#E68736] rounded-xl transition-all"><X size={24} /></button>
            </div>
            <CouponForm 
              initialData={editingCoupon} 
              onSuccess={() => { setShowForm(false); fetchCoupons(); }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

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

  // ✅ VITE Environment Variable Usage
  const BackendUrl = import.meta.env.VITE_API_BASE_URL;

useEffect(() => {
  if (initialData) {
    // Determine which tab to show for BOGO
    let detectedTab = "BRAND";
    if (initialData.buyXGetY?.buyProducts?.length > 0) detectedTab = "PRODUCT";
    else if (initialData.buyXGetY?.buyCategory) detectedTab = "CATEGORY";
    setBogoTab(detectedTab);

    setFormData({
      ...initialData,
      // Ensure dates are in YYYY-MM-DD format for the HTML5 date input
      startDate: initialData.startDate?.split('T')[0] || "",
      endDate: initialData.endDate?.split('T')[0] || "",
      // Ensure arrays exist to prevent .map errors
      applicableProducts: initialData.applicableProducts || [],
      applicableCategories: initialData.applicableCategories || [],
      applicableBrands: initialData.applicableBrands || [],
      buyXGetY: {
        ...initialData.buyXGetY,
        buyProducts: initialData.buyXGetY?.buyProducts || [],
        getProducts: initialData.buyXGetY?.getProducts || [],
        buyBrand: initialData.buyXGetY?.buyBrand || null,
        getBrand: initialData.buyXGetY?.getBrand || null,
      }
    });
  }
}, [initialData]);

  // ✅ Updated Fetch Logic with Error Handling to avoid 404/JSON crash
// Inside CouponForm component
useEffect(() => {
  const fetchOptions = async () => {
    try {
      // ✅ Call the new service method
      const data = await CouponService.getCouponOptions();
      
      setOptions({
        brands: data.brands,
        categories: data.categories,
        products: data.products
      });
    } catch (err) { 
      console.error("Error loading form data:", err); 
    }
  };
  
  fetchOptions();
}, []);

const handleSubmit = async (e) => {
  e.preventDefault();

  // 1. Destructure to remove 'usageLimit' and any other UI-only state
  // eslint-disable-next-line no-unused-vars
  const { usageLimit, stackable, autoApply, ...payload } = formData;

  // 2. Clean up the buyXGetY object
  // Backend fails if these are null; they must be strings or removed
  const cleanedBuyXGetY = { ...payload.buyXGetY };
  
  if (cleanedBuyXGetY.buyBrand === null) delete cleanedBuyXGetY.buyBrand;
  if (cleanedBuyXGetY.getBrand === null) delete cleanedBuyXGetY.getBrand;
  if (cleanedBuyXGetY.buyCategory === null) delete cleanedBuyXGetY.buyCategory;
  if (cleanedBuyXGetY.getCategory === null) delete cleanedBuyXGetY.getCategory;

  // 3. Construct the final payload
  const finalPayload = {
    ...payload,
    buyXGetY: cleanedBuyXGetY,
    // Ensure numeric fields are actually numbers
    discountValue: Number(payload.discountValue) || 0,
    maxDiscountAmount: payload.maxDiscountAmount === null ? 0 : Number(payload.maxDiscountAmount),
  };

  try {
    const result = await CouponService.saveCoupon(finalPayload, initialData?.couponId);
    if (result.success) {
      Swal.fire('Success', result.message, 'success');
      onSuccess();
    }
  } catch (err) {
    // This will now show you the exact detail if another validation fails
    const errorMsg = err.response?.data?.error?.details?.join('<br/>') || 'Check your inputs';
    Swal.fire({
      title: 'Validation Error',
      html: `<div class="text-left text-sm font-mono">${errorMsg}</div>`,
      icon: 'error'
    });
  }
};

  return (
    <form className="flex-1 overflow-y-auto p-8 space-y-10" onSubmit={handleSubmit}>
      {/* Form sections (Basic Info, Reward Configuration, etc.) remain as in your original structure */}
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

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
        <textarea value={formData.description} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" onChange={e => setFormData({...formData, description: e.target.value})} />
      </div>

      {/* Reward Configuration */}
      <div className="space-y-4">
        <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Reward Type</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
              {/* Buy Side */}
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
                    {bogoTab === "PRODUCT" && options.products.map(product => (
                      <option key={product._id} value={product.productId}>📦 {product.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Get Side */}
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
                    {bogoTab === "PRODUCT" && options.products.map(product => (
                      <option key={product._id} value={product.productId}>🎁 {product.name}</option>
                    ))}
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
            <div className="p-4 bg-slate-50 rounded-2xl">
              <label className="text-[10px] font-black text-slate-400 block mb-1">Min Order (₹)</label>
              <input value={formData.minOrderAmount} type="number" className="w-full bg-transparent text-2xl font-black outline-none" onChange={e => setFormData({...formData, minOrderAmount: Number(e.target.value)})} />
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <label className="text-[10px] font-black text-slate-400 block mb-1">Max Cap (₹)</label>
              <input value={formData.maxDiscountAmount || ""} type="number" className="w-full bg-transparent text-2xl font-black outline-none" placeholder="No Limit" onChange={e => setFormData({...formData, maxDiscountAmount: e.target.value ? Number(e.target.value) : null})} />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase">Applicable To</label>
          <select value={formData.applicableTo} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" onChange={e => setFormData({...formData, applicableTo: e.target.value})}>
            <option value="ALL">Entire Store</option>
            <option value="BRAND">By Brand</option>
            <option value="CATEGORY">By Category</option>
            <option value="PRODUCT">By Product</option>
          </select>
        </div>

        {formData.applicableTo !== "ALL" && (
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase">Select {formData.applicableTo.toLowerCase()}</label>
            <select 
              className="w-full p-4 bg-orange-50 border-2 border-orange-100 rounded-2xl font-bold outline-none"
              value={formData.applicableTo === "BRAND" ? formData.applicableBrands[0] || "" : formData.applicableTo === "CATEGORY" ? formData.applicableCategories[0] || "" : formData.applicableProducts[0] || ""}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({
                  ...formData,
                  applicableBrands: formData.applicableTo === "BRAND" ? [val] : [],
                  applicableCategories: formData.applicableTo === "CATEGORY" ? [val] : [],
                  applicableProducts: formData.applicableTo === "PRODUCT" ? [val] : []
                });
              }}
            >
              <option value="">Choose {formData.applicableTo}...</option>
              {formData.applicableTo === "BRAND" && options.brands.map(b => <option key={b._id} value={b._id}>{b.brandName}</option>)}
              {formData.applicableTo === "CATEGORY" && options.categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              {formData.applicableTo === "PRODUCT" && options.products.map(p => <option key={p.productId} value={p.productId}>{p.name}</option>)}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase">Start Date</label>
          <input value={formData.startDate} type="date" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" onChange={e => setFormData({...formData, startDate: e.target.value})} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase">End Date</label>
          <input value={formData.endDate} type="date" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" onChange={e => setFormData({...formData, endDate: e.target.value})} />
        </div>
      </div>

      <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Campaign Visibility</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Toggle whether this offer is live or saved as a draft</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isActive: true })}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${
              formData.isActive ? "bg-[#E68736] text-white shadow-md" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Power size={14} fill={formData.isActive ? "currentColor" : "none"} />
            ACTIVE
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isActive: false })}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${
              !formData.isActive ? "bg-slate-700 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <FileText size={14} fill={!formData.isActive ? "currentColor" : "none"} />
            DRAFT
          </button>
        </div>
      </div>

      <button type="submit" className={`w-full py-6 text-white rounded-[2rem] font-black text-xl transition-all shadow-xl flex items-center justify-center gap-3 ${formData.isActive ? 'bg-slate-900 hover:bg-[#E68736]' : 'bg-slate-500 hover:bg-slate-600'}`}>
        {formData.isActive ? <CheckCircle2 size={24} /> : <FileText size={24} />}
        {initialData ? 'Update Campaign' : 'Deploy Campaign'}
      </button>
    </form>
  );
}

// CouponCard component remains the same...
function CouponCard({ coupon, onDelete, onToggle, onEdit }) {
  return (
    <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 relative overflow-hidden group hover:border-[#E68736]/30 transition-all shadow-sm">
      <div className={`absolute left-0 top-0 bottom-0 w-2 transition-all ${coupon.isActive ? 'bg-[#E68736]' : 'bg-slate-300'}`} />
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-4 flex-1">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">{coupon.code}</h3>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-all ${coupon.isActive ? 'bg-orange-100 text-[#E68736]' : 'bg-slate-100 text-slate-400'}`}>
                {coupon.isActive ? 'LIVE' : 'DRAFT'}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{coupon.title}</p>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2 text-slate-600">
                <Tag size={14} className="text-[#E68736]"/>
                <span className="text-[10px] font-black uppercase">{coupon.couponType?.replace(/_/g, ' ')}</span>
             </div>
             <div className="flex items-center gap-2 text-slate-400">
                <Users size={14}/>
                <span className="text-[10px] font-black">{coupon.usedCount || 0} Uses</span>
             </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3 relative z-10">
            <button 
              onClick={onToggle}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all font-black text-[9px] ${
                coupon.isActive 
                  ? 'border-orange-100 text-[#E68736] hover:bg-orange-50' 
                  : 'border-slate-100 text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Power size={12} fill={coupon.isActive ? "currentColor" : "none"} />
              {coupon.isActive ? "ACTIVE" : "DRAFT"}
            </button>
            
            <div className="flex gap-2">
              <button onClick={onEdit} className="p-3 bg-slate-50 text-slate-400 hover:text-[#E68736] rounded-xl transition-all"><Settings2 size={20}/></button>
              <button onClick={onDelete} className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"><Trash2 size={20}/></button>
            </div>
        </div>
      </div>
    </div>
  );
}