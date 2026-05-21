import React, { useState, useEffect } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { BannerService, BrandService, CategoryService } from "../../../backend/ApiService";

// 1. Import your custom DropdownGroup component here
import DropdownGroup from "../../../components/ui/DropdownGroup"; // Adjust path as necessary per your folder structure

const EditBannerModal = ({ banner, onClose, refresh }) => {
  /* ================= STATE ================= */
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(banner?.imageUrl || null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    type: banner?.filterBy || "brand",
    brandId: banner?.filterBy === "brand" ? banner?.filterId : "",
    categoryId: banner?.filterBy === "category" ? banner?.filterId : "",
    order: banner?.displayOrder || 1,
    status: banner?.isActive ? "active" : "draft",
    image: null,
  });

  /* ================= EFFECTS ================= */
  useEffect(() => {
    if (form.type) fetchOptions(form.type);
  }, []);

  /* ================= FETCH OPTIONS ================= */
  const fetchOptions = async (type) => {
    try {
      if (type === "brand") {
        const res = await BrandService.getAllBrands();
        if (res && Array.isArray(res.brands)) {
          setBrands(res.brands);
        } else {
          console.error("Brands array not found in service response:", res);
          setBrands([]);
        }
      } else if (type === "category") {
        const res = await CategoryService.getCategories();
        const catList = res?.categories || (Array.isArray(res) ? res : []);
        setCategories(catList);
      }
    } catch (err) {
      console.error(`Failed to fetch ${type}s`, err);
      setBrands([]);
      setCategories([]);
    }
  };

  /* ================= HANDLERS ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, image: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("filterBy", form.type);
      fd.append("filterId", form.type === "brand" ? form.brandId : form.categoryId);
      fd.append("displayOrder", String(form.order));
      fd.append("isActive", String(form.status === "active"));
      
      if (form.image) {
        fd.append("imageUrl", form.image);
      }

      const res = await BannerService.updateBanner(banner.bannerId, fd);
      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "Asset Updated",
          text: "The storefront banner has been successfully modified.",
          timer: 2000,
          showConfirmButton: false
        });
        refresh();
        onClose();
      }
    } catch (err) {
      Swal.fire("Update Failed", err.response?.data?.message || "Internal Server Error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= DROPDOWN DATA MAPPING ================= */
  const bannerTypeOptions = [
    { value: "brand", label: "Select Brand" },
    { value: "category", label: "Select Category" }
  ];

  const brandOptions = brands.map(b => ({
    value: b.brandId,
    label: b.brandName || b.name
  }));

  const categoryOptions = categories.map(c => ({
    value: c.categoryId,
    label: c.name
  }));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-visible">
      
      {/* Clickable backdrop overlay to close modal easily */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Modal Container — Switched inner body wrapper layout to overflow-visible so options dropdown lists never clip */}
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col overflow-visible">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all z-30"
        >
          <X size={20} />
        </button>

        {/* Inner container with calculated view fallback scroll settings */}
        <div className="p-6 md:p-10 w-full overflow-y-visible max-h-[85vh]">
          {/* Header */}
          <header className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">Refine Banner Asset</h2>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Adjust placement and visibility settings</p>
          </header>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start overflow-visible">
            
            {/* Left Side: Graphic Section */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Graphic Update</label>
              <div className="relative h-64 md:h-72 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50/50 overflow-hidden group transition-all hover:border-orange-300">
                {preview ? (
                  <img src={preview} className="w-full h-full object-contain p-4 group-hover:opacity-40 transition-opacity" alt="preview" />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center">
                    <Upload size={32} strokeWidth={1.5} />
                    <span className="text-xs font-medium mt-2">No Image Selected</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-all cursor-pointer backdrop-blur-[2px]">
                  <div className="bg-[#E68736] p-3 rounded-full shadow-lg text-white">
                    <Upload size={20} />
                  </div>
                  <span className="text-xs font-bold mt-2 drop-shadow">Replace File</span>
                </div>
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleImageChange} 
                  accept="image/*"
                />
              </div>
            </div>

            {/* Right Side: Form Controls */}
            <div className="space-y-5 overflow-visible relative z-20">
              
              {/* Link Configuration */}
              <div className="overflow-visible">
                <DropdownGroup
                  label="Link Configuration"
                  options={bannerTypeOptions}
                  value={form.type}
                  placeholder="Select destination..."
                  onChange={(val) => {
                    setForm({ ...form, type: val, brandId: "", categoryId: "" });
                    fetchOptions(val);
                  }}
                />
              </div>

              {/* Dynamic Target Select */}
              <div className="overflow-visible">
                {form.type === "brand" ? (
                  <DropdownGroup
                    label="Selected Brand"
                    options={brandOptions}
                    value={form.brandId}
                    placeholder="Choose Specific Brand..."
                    onChange={(val) => setForm({ ...form, brandId: val })}
                  />
                ) : (
                  <DropdownGroup
                    label="Selected Category"
                    options={categoryOptions}
                    value={form.categoryId}
                    placeholder="Choose Specific Category..."
                    onChange={(val) => setForm({ ...form, categoryId: val })}
                  />
                )}
              </div>

              {/* Order and Status Grid */}
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sequence</label>
                  <input 
                    type="number"
                    min="1"
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl font-medium text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 transition-all" 
                    value={form.order} 
                    onChange={(e) => setForm({...form, order: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <DropdownGroup
                    label="Live Status"
                    value={form.status}
                    options={[
                      { value: "active", label: "Online" },
                      { value: "draft", label: "Paused (Draft)" }
                    ]}
                    onChange={(val) => setForm({ ...form, status: val })}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 relative z-[1]">
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-full h-11 bg-[#E68736] hover:bg-[#d17a31] text-white rounded-xl font-bold uppercase text-xs tracking-wider shadow-md shadow-orange-500/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Processing...
                    </>
                  ) : "Commit Update"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBannerModal;