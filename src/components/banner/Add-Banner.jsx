/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Upload, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BannerService, BrandService, CategoryService } from "../../backend/ApiService";
import Swal from "sweetalert2";

const AddBannerForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: "",
    brandId: "",
    categoryId: "",
    order: 1,
    status: "active",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

const fetchOptions = async (type) => {
  try {
    if (type === "brand") {
      const res = await BrandService.getAllBrands();
      
      // FIX: Since BrandService returns res.data.data, 
      // 'res' here is already the object { brands: [...], pagination: ... }
      if (res && Array.isArray(res.brands)) {
        setBrands(res.brands);
      } else {
        console.error("Brand array not found. Check if res.brands exists:", res);
        setBrands([]);
      }
      
    } else if (type === "category") {
      const res = await CategoryService.getCategories();
      // Apply similar logic if CategoryService also returns res.data.data
      const catList = res?.categories || (Array.isArray(res) ? res : []);
      setCategories(catList);
    }
  } catch (err) {
    console.error(`Failed to fetch ${type}s`, err);
    setBrands([]);
    setCategories([]);
  }
};
  // ---------------- IMAGE HANDLING ----------------
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData({ ...formData, image: file });
    setPreview(URL.createObjectURL(file));
  };

  // ---------------- SUBMIT LOGIC ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image) return Swal.fire("Required", "Please upload a banner image", "info");
    if (!formData.type) return Swal.fire("Required", "Please select a banner type", "info");
    
    const selectedFilterId = formData.type === "brand" ? formData.brandId : formData.categoryId;
    if (!selectedFilterId) return Swal.fire("Required", `Please select a ${formData.type}`, "info");

    try {
      setLoading(true);
      
      const data = new FormData();
      data.append("imageUrl", formData.image); 
      data.append("filterBy", formData.type);
      data.append("filterId", selectedFilterId);
      data.append("displayOrder", String(formData.order));
      data.append("isActive", formData.status === "active" ? "true" : "false"); 

      const res = await BannerService.createBanner(data);

      if (res.success || res.status === 200 || res.status === 201) {
        await Swal.fire({
            title: "Success",
            text: "Banner published successfully 🎉",
            icon: "success",
            confirmButtonColor: "#E68736"
        });
        navigate("/banner-list");
      }
    } catch (err) {
      console.error("Submission Error:", err);
      Swal.fire("Error", err.response?.data?.message || "Failed to create banner", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 font-bold mb-6 hover:text-orange-600 transition-colors"
        >
            <ArrowLeft size={18} /> BACK TO LIST
        </button>

        <div className="bg-white rounded-[2rem] border border-orange-200 shadow-xl shadow-orange-900/5 overflow-hidden">
          <div className="bg-gradient-to-r from-[#E68736] to-[#ff9d4d] px-10 py-8">
            <h2 className="text-3xl font-black text-white tracking-tight">Create Promotional Banner</h2>
            <p className="text-orange-100 font-medium mt-1">Design and link your homepage marketing assets</p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Left: Image Upload */}
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Banner Graphic</label>
              <div className="relative h-96 border-4 border-dashed border-orange-50 rounded-[2rem] flex flex-col items-center justify-center hover:bg-orange-50/30 hover:border-orange-200 transition-all group overflow-hidden cursor-pointer">
                {preview ? (
                  <div className="w-full h-full relative">
                    <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-bold uppercase text-xs border-2 border-white px-4 py-2 rounded-full">Change Image</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="inline-flex p-5 bg-white rounded-2xl border border-orange-100 mb-4 group-hover:scale-110 transition-transform shadow-sm">
                      <Upload className="text-[#E68736]" size={32} />
                    </div>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-tighter">Click to select asset</p>
                    <p className="text-[10px] text-slate-400 mt-2">Recommended: 1920x600px</p>
                  </div>
                )}
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>
            </div>

            {/* Right: Configuration */}
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link Destination</label>
                <select
                  className="mt-2 w-full p-4 border border-orange-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all appearance-none bg-slate-50"
                  value={formData.type}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, type: val, brandId: "", categoryId: "" });
                    if (val) fetchOptions(val);
                  }}
                >
                  <option value="">-- SELECT TARGET --</option>
                  <option value="brand">BRAND PAGE</option>
                  <option value="category">CATEGORY PAGE</option>
                </select>
              </div>

              {/* Brand Selection - Fixed .map error here */}
              {formData.type === "brand" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Brand</label>
                  <select
                    className="mt-2 w-full p-4 border border-orange-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all bg-white"
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  >
                    <option value="">CHOOSE BRAND...</option>
                    {Array.isArray(brands) && brands.map((b) => (
                      <option key={b._id || b.brandId} value={b.brandId}>
                        {b.brandName || b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category Selection - Fixed .map error here */}
              {formData.type === "category" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Category</label>
                  <select
                    className="mt-2 w-full p-4 border border-orange-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all bg-white"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="">CHOOSE CATEGORY...</option>
                    {Array.isArray(categories) && categories.map((c) => (
                      <option key={c._id || c.categoryId} value={c.categoryId}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Order</label>
                  <input
                    type="number"
                    className="mt-2 w-full p-4 border border-orange-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visibility Status</label>
                  <select
                    className="mt-2 w-full p-4 border border-orange-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">PUBLISHED (LIVE)</option>
                    <option value="draft">DRAFT (HIDDEN)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-5 rounded-[1.5rem] font-black text-white text-sm uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${
                    loading 
                        ? "bg-slate-300 cursor-not-allowed shadow-none" 
                        : "bg-[#E68736] hover:bg-[#d17a31] hover:-translate-y-1 shadow-orange-200"
                  }`}
                >
                  {loading ? "Publishing Assets..." : "Publish Banner Now"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBannerForm;