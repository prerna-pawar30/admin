import React, { useState, useEffect } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { BannerService, BrandService, CategoryService } from "../../../backend/ApiService";

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
  // Fetch initial options based on the existing banner type
  useEffect(() => {
    if (form.type) fetchOptions(form.type);
  }, []);

  const fetchOptions = async (type) => {
    try {
      if (type === "brand") {
        const data = await BrandService.getAllBrands();
        setBrands(data || []);
      } else if (type === "category") {
        const data = await CategoryService.getCategories();
        setCategories(data || []);
      }
    } catch (err) {
      console.error(`Failed to fetch ${type}s`, err);
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-10">
      <div className=" bg-white w-full max-w-4xl rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-white animate-in zoom-in-95 duration-200 max-h-[75vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 md:top-10 md:right-10 p-3 text-slate-300 hover:text-slate-800 bg-slate-50 rounded-2xl transition-all z-10"
        >
          <X size={24} />
        </button>

        <div className="p-8 md:p-14">
          <header className="mb-10">
            <h2 className="text-3xl font-black text-slate-800 mb-2">Refine Banner Asset</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Adjust placement and visibility settings</p>
          </header>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14">
            
            {/* Left Side: Image Upload */}
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Graphic Update</label>
              <div className="relative h-64 md:h-80 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex items-center justify-center bg-slate-50/50 overflow-hidden group transition-all hover:border-orange-200">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" alt="preview" />
                ) : (
                  <div className="text-slate-300 flex flex-col items-center">
                    <Upload size={40} strokeWidth={1} />
                    <span className="text-[10px] font-bold mt-2">No Image Selected</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-orange-600/10 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-all cursor-pointer">
                  <div className="bg-orange-500 p-4 rounded-full shadow-xl">
                    <Upload size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest mt-4 drop-shadow-md">Replace File</span>
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
            <div className="space-y-6">
              
              {/* Link Type Select */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Link Configuration</label>
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 ring-orange-100 transition-all appearance-none"
                  value={form.type} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({ ...form, type: val, brandId: "", categoryId: "" });
                    fetchOptions(val);
                  }}
                >
                  <option value="brand">Brand Landing Page</option>
                  <option value="category">Category Grid View</option>
                </select>
              </div>

              {/* Dynamic Target Select */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">
                  Target {form.type === 'brand' ? 'Brand' : 'Category'}
                </label>
                {form.type === "brand" ? (
                  <select 
                    required
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 ring-orange-100" 
                    value={form.brandId} 
                    onChange={(e) => setForm({...form, brandId: e.target.value})}
                  >
                    <option value="">Choose Specific Brand...</option>
                    {brands.map(b => <option key={b._id} value={b.brandId}>{b.brandName}</option>)}
                  </select>
                ) : (
                  <select 
                    required
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 ring-orange-100" 
                    value={form.categoryId} 
                    onChange={(e) => setForm({...form, categoryId: e.target.value})}
                  >
                    <option value="">Choose Specific Category...</option>
                    {categories.map(c => <option key={c._id} value={c.categoryId}>{c.name}</option>)}
                  </select>
                )}
              </div>

              {/* Order and Status Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sequence</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 ring-orange-100" 
                    value={form.order} 
                    onChange={(e) => setForm({...form, order: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Live Status</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 ring-orange-100" 
                    value={form.status} 
                    onChange={(e) => setForm({...form, status: e.target.value})}
                  >
                    <option value="active">Online</option>
                    <option value="draft">Paused (Draft)</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-full py-5 bg-[#E68736] text-white rounded-[1.8rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-orange-100 hover:bg-[#d17a31] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
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