/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Upload, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BannerService } from "../../backend/ApiService"; 
import { BrandService } from "../../backend/ApiService";
import { CategoryService } from "../../backend/ApiService";
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

  // ---------------- FETCH DATA ----------------
  const fetchOptions = async (type) => {
    try {
      if (type === "brand") {
        const data = await BrandService.getAllBrands();
        setBrands(data);
      } else if (type === "category") {
        const data = await CategoryService.getCategories();
        setCategories(data);
      }
    } catch (err) {
      console.error(`Failed to fetch ${type}s`, err);
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
      
      // Preparing Multipart Form Data
// Inside handleSubmit...
const data = new FormData();
data.append("imageUrl", formData.image); 
data.append("filterBy", formData.type);
data.append("filterId", selectedFilterId);
data.append("displayOrder", String(formData.order));

// CHANGE THIS LINE:
// Map "active" to true, and anything else (like "draft") to false
data.append("isActive", formData.status === "active" ? "true" : "false"); 

const res = await BannerService.createBanner(data);

      if (res.success) {
        Swal.fire("Success", "Banner published successfully 🎉", "success");
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
    <div className="min-h-screen py-10  px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-[2rem] border border-orange-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#E68736] to-[#ff9d4d] px-10 py-6">
            <h2 className="text-3xl font-black text-white tracking-tight">Create Promotional Banner</h2>
            
          </div>

          <form onSubmit={handleSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left: Image Upload */}
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Banner Graphic</label>
              <div className="relative h-96 border-3 border-dashed border-orange-100 rounded-[2rem] flex flex-col items-center justify-center  hover:bg-orange-50/30 hover:border-orange-200 transition-all group overflow-hidden cursor-pointer">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="text-center">
                    <div className="inline-flex p-5 bg-white rounded-2xl border border-orange-100 mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="text-[#E68736]" size={32} />
                    </div>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-tighter">Click to select asset</p>
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
                  className="mt-2 w-full p-4 border border-orange-200 rounded-2xl  focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all appearance-none"
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

              {formData.type === "brand" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Brand</label>
                  <select
                    className="mt-2 w-full p-4 border border-orange-200 rounded-2xl  focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all"
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  >
                    <option value="">CHOOSE BRAND...</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b.brandId}>{b.brandName}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.type === "category" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Category</label>
                  <select
                    className="mt-2 w-full p-4 border border-orange-200 rounded-2xl  focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="">CHOOSE CATEGORY...</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.categoryId}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Order</label>
                  <input
                    type="number"
                    className="mt-2 w-full p-4 border border-orange-200 rounded-2xl  focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                  <select
                    className="mt-2 w-full p-4 border border-orange-200 rounded-xl  focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none font-bold text-slate-700 transition-all"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">ACTIVE</option>
                    <option value="draft">DRAFT</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-5 rounded-[1rem] font-black text-white text-sm uppercase tracking-[0.2em] transition-all  active:scale-95 ${
                    loading ? "bg-slate-300 cursor-not-allowed" : "bg-[#E68736] hover:bg-[#d17a31] hover:-translate-y-1"
                  }`}
                >
                  {loading ? "Publishing..." : "Publish Banner"}
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