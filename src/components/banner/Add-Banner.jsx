/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Upload, ArrowLeft, Link2, Tag, Hash, Eye, EyeOff, CheckCircle2, ChevronDown, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BannerService, BrandService, CategoryService } from "../../backend/ApiService";
import Swal from "sweetalert2";

/* ─── Reusable Field Wrapper ─── */
const Field = ({ label, hint, icon: Icon, children }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-[0.18em]">
        {Icon && <Icon size={11} className="text-[#E68736]" />}
        {label}
      </label>
      {hint && <span className="text-[10px] text-slate-400 font-medium">{hint}</span>}
    </div>
    {children}
  </div>
);

/* ─── Custom Select ─── */
const StyledSelect = ({ value, onChange, children, placeholder }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className={`
        w-full appearance-none pl-4 pr-10 py-3.5
        bg-white border-2 rounded-2xl
        text-[13px] font-bold outline-none
        transition-all duration-200 cursor-pointer
        ${value
          ? "border-[#E68736] text-slate-800 shadow-[0_0_0_4px_rgba(230,135,54,0.08)]"
          : "border-slate-200 text-slate-400 hover:border-slate-300"
        }
        focus:border-[#E68736] focus:shadow-[0_0_0_4px_rgba(230,135,54,0.1)]
      `}
    >
      {children}
    </select>
    <ChevronDown size={15} className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${value ? "text-[#E68736]" : "text-slate-400"}`} />
  </div>
);

/* ─── Number Stepper ─── */
const NumberStepper = ({ value, onChange }) => (
  <div className="flex items-center border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors focus-within:border-[#E68736] focus-within:shadow-[0_0_0_4px_rgba(230,135,54,0.08)]">
    <button
      type="button"
      onClick={() => onChange(Math.max(1, Number(value) - 1))}
      className="px-4 py-3.5 text-slate-400 hover:text-[#E68736] hover:bg-orange-50 font-black text-lg transition-all select-none"
    >−</button>
    <input
     
      value={value}
      onChange={e => onChange(Math.max(1, Number(e.target.value)))}
      onWheel={e => e.target.blur()}   
      className="flex-1 text-center text-[14px] font-black text-slate-800 outline-none border-none bg-transparent py-3.5"
      min="1"
    />
    <button
      type="button"
      onClick={() => onChange(Number(value) + 1)}
      className="px-4 py-3.5 text-slate-400 hover:text-[#E68736] hover:bg-orange-50 font-black text-lg transition-all select-none"
    >+</button>
  </div>
);

/* ─── Toggle Pill ─── */
const StatusToggle = ({ value, onChange }) => (
  <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
    {[
      { val: "active", label: "Live", icon: Eye },
      { val: "draft",  label: "Draft", icon: EyeOff },
    ].map(({ val, label, icon: Icon }) => (
      <button
        key={val}
        type="button"
        onClick={() => onChange(val)}
        className={`
          flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
          text-[11px] font-black uppercase tracking-wider transition-all duration-200
          ${value === val
            ? val === "active"
              ? "bg-[#E68736] text-white shadow-md shadow-orange-200"
              : "bg-slate-700 text-white shadow-md"
            : "text-slate-400 hover:text-slate-600"
          }
        `}
      >
        <Icon size={12} />
        {label}
      </button>
    ))}
  </div>
);

/* ─── Main Component ─── */
const AddBannerForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: "", brandId: "", categoryId: "",
    order: 1, status: "active", image: null,
  });
  const [preview, setPreview] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fetchOptions = async (type) => {
    try {
      if (type === "brand") {
        const res = await BrandService.getAllBrands();
        setBrands(Array.isArray(res?.brands) ? res.brands : []);
      } else if (type === "category") {
        const res = await CategoryService.getCategories();
        setCategories(res?.categories || (Array.isArray(res) ? res : []));
      }
    } catch (err) {
      console.error(`Failed to fetch ${type}s`, err);
    }
  };

  const applyImage = (file) => {
    if (!file) return;
    setFormData(f => ({ ...f, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) applyImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) return Swal.fire("Required", "Please upload a banner image", "info");
    if (!formData.type)  return Swal.fire("Required", "Please select a banner type", "info");
    const filterId = formData.type === "brand" ? formData.brandId : formData.categoryId;
    if (!filterId) return Swal.fire("Required", `Please select a ${formData.type}`, "info");

    try {
      setLoading(true);
      const data = new FormData();
      data.append("imageUrl", formData.image);
      data.append("filterBy", formData.type);
      data.append("filterId", filterId);
      data.append("displayOrder", String(formData.order));
      data.append("isActive", formData.status === "active" ? "true" : "false");
      const res = await BannerService.createBanner(data);
      if (res.success || res.status === 200 || res.status === 201) {
        await Swal.fire({ title: "Published!", text: "Banner is now live 🎉", icon: "success", confirmButtonColor: "#E68736" });
        navigate("/banner-list");
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to create banner", "error");
    } finally {
      setLoading(false);
    }
  };

  const isComplete = formData.image && formData.type &&
    (formData.type === "brand" ? formData.brandId : formData.categoryId);

  return (
    <div className="min-h-screen bg-[#FAFAF9] py-10 px-4 font-sans">
      <div className="max-w-4xl mx-auto">

        {/* ── Back ── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest mb-8 hover:text-[#E68736] transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Banners
        </button>

        {/* ── Page Title ── */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-11 h-11 bg-[#E68736] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
            <Megaphone size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">New Promotional Banner</h1>
            <p className="text-slate-400 text-xs font-semibold mt-0.5">Upload an image and configure where it links</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

          {/* ── LEFT: Image Upload ── */}
          <div className="bg-white rounded-[28px] border-2 border-dashed border-slate-200 overflow-hidden transition-all duration-300"
            style={{ borderColor: dragOver ? "#E68736" : preview ? "#E68736" : undefined,
                     background: dragOver ? "rgba(230,135,54,0.03)" : undefined }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <label className="relative flex flex-col items-center justify-center min-h-[360px] cursor-pointer group">
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="w-full h-full object-cover absolute inset-0 rounded-[26px]" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all rounded-[26px] flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                      <Upload size={20} className="text-white" />
                    </div>
                    <p className="text-white font-black text-sm">Replace Image</p>
                    <p className="text-white/60 text-xs">Click or drag a new file</p>
                  </div>
                  {/* Checkmark badge */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 p-10 text-center">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${dragOver ? "bg-orange-100 scale-110" : "bg-slate-50"} border-2 border-dashed ${dragOver ? "border-[#E68736]" : "border-slate-200"}`}>
                    <Upload size={26} className={dragOver ? "text-[#E68736]" : "text-slate-300"} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-700">
                      {dragOver ? "Drop it here!" : "Drag & drop or click to upload"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1.5 font-medium">PNG, JPG, WEBP • Recommended: 1920 × 600px</p>
                  </div>
                  <span className="px-5 py-2.5 bg-orange-50 border border-orange-200 text-[#E68736] rounded-full text-[11px] font-black uppercase tracking-wider hover:bg-[#E68736] hover:text-white transition-all">
                    Browse Files
                  </span>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={e => applyImage(e.target.files[0])} />
            </label>
          </div>

          {/* ── RIGHT: Config Panel ── */}
          <div className="space-y-5">

            {/* Link Destination */}
            <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm space-y-5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Link2 size={10} className="text-[#E68736]" /> Link Configuration
              </p>

              <Field label="Banner Type" icon={Link2}>
                <StyledSelect
                  value={formData.type}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData(f => ({ ...f, type: val, brandId: "", categoryId: "" }));
                    if (val) fetchOptions(val);
                  }}
                >
                  <option value="">Select destination...</option>
                  <option value="brand">Brand Page</option>
                  <option value="category">Category Page</option>
                </StyledSelect>
              </Field>

              {/* Animated brand/category select */}
              {formData.type === "brand" && (
                <Field label="Brand" icon={Tag}>
                  <StyledSelect
                    value={formData.brandId}
                    onChange={e => setFormData(f => ({ ...f, brandId: e.target.value }))}
                  >
                    <option value="">Choose a brand...</option>
                    {brands.map(b => (
                      <option key={b._id || b.brandId} value={b.brandId}>
                        {b.brandName || b.name}
                      </option>
                    ))}
                  </StyledSelect>
                </Field>
              )}

              {formData.type === "category" && (
                <Field label="Category" icon={Tag}>
                  <StyledSelect
                    value={formData.categoryId}
                    onChange={e => setFormData(f => ({ ...f, categoryId: e.target.value }))}
                  >
                    <option value="">Choose a category...</option>
                    {categories.map(c => (
                      <option key={c._id || c.categoryId} value={c.categoryId}>
                        {c.name}
                      </option>
                    ))}
                  </StyledSelect>
                </Field>
              )}
            </div>

            {/* Display Settings */}
            <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm space-y-5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Display Settings</p>

              <Field label="Display Order" hint="Lower = higher priority" icon={Hash}>
                <NumberStepper
                  value={formData.order}
                  onChange={v => setFormData(f => ({ ...f, order: v }))}
                />
              </Field>

              <Field label="Visibility" icon={Eye}>
                <StatusToggle
                  value={formData.status}
                  onChange={v => setFormData(f => ({ ...f, status: v }))}
                />
              </Field>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !isComplete}
              className={`
                w-full py-4 rounded-2xl font-black text-[13px] uppercase tracking-[0.15em]
                transition-all duration-200 flex items-center justify-center gap-2.5
                ${isComplete && !loading
                  ? "bg-[#E68736] text-white shadow-xl shadow-orange-200/60 hover:bg-[#d17a31] hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }
              `}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Megaphone size={15} />
                  Publish Banner
                </>
              )}
            </button>

            {!isComplete && !loading && (
              <p className="text-center text-[10px] text-slate-400 font-semibold">
                Complete all fields above to publish
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBannerForm;