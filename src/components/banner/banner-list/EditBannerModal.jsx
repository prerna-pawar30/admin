import React, { useState, useEffect } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogBody, DialogButton, DialogFooter, DialogHeader } from "../../ui/Dialog";
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
    <Dialog open onClose={onClose} size="xl" label="Edit banner">
      <DialogHeader icon={ImageIcon} title="Edit banner" subtitle="Image, link target, order and status" onClose={onClose} />
        <DialogBody className="pb-16">
          <form id="edit-banner-form" onSubmit={handleSubmit} className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 md:gap-8">
            
            {/* Left Side: Graphic Section */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Graphic Update</label>
              <div className="relative h-52 sm:h-64 md:h-72 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50/50 overflow-hidden group transition-all hover:border-orange-300">
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
            <div className="min-w-0 space-y-5">
              
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Sequence</label>
                  <input 
                    type="number"
                    min="1"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition-all focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10" 
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

            </div>
          </form>
        </DialogBody>

      <DialogFooter>
        <DialogButton tone="ghost" onClick={onClose}>
          Cancel
        </DialogButton>
        <DialogButton tone="primary" type="submit" form="edit-banner-form" isLoading={submitting} className="flex-1 sm:flex-none">
          {submitting ? "Saving..." : "Save changes"}
        </DialogButton>
      </DialogFooter>
    </Dialog>
  );
};

export default EditBannerModal;