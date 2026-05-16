/* eslint-disable no-unused-vars */
import { useState } from "react";
import { BrandService } from "../../backend/ApiService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { HiPlus, HiX, HiCloudUpload } from "react-icons/hi";
import { ChevronDown, ImagePlus, PackagePlus } from "lucide-react";

export default function AddBrand() {
  const navigate = useNavigate();
  const [Name, setName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [previewImg, setPreviewImg] = useState("");
  const [loading, setLoading] = useState(false);
  const [extraFiles, setExtraFiles] = useState([{ file: null, categoryId: "" }]);

  const staticCategories = [
    { id: "1", name: "Abutment-Level" },
    { id: "2", name: "General" },
    { id: "3", name: "Screw-Retained" },
  ];

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setPreviewImg(URL.createObjectURL(file));
    }
  };

  const addFileRow = () => setExtraFiles([...extraFiles, { file: null, categoryId: "" }]);

  const updateFileRow = (index, field, value) => {
    const updated = [...extraFiles];
    updated[index][field] = value;
    setExtraFiles(updated);
  };

  const removeFileRow = (index) => {
    if (extraFiles.length > 1) {
      setExtraFiles(extraFiles.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!Name || !logoFile) {
      return Swal.fire("Error", "Brand name and logo are required", "error");
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("brandName", Name);
      formData.append("logoUrl", logoFile);
      formData.append("permission", "brand.listing.create");

      extraFiles.forEach((item) => {
        if (item.file && item.categoryId) {
          formData.append("file", item.file);
          formData.append("categories", item.categoryId);
        }
      });

      const response = await BrandService.createBrand(formData);
      if (response?.success) {
        Swal.fire("Success", "Brand created successfully", "success");
        navigate("/catalog/brands");
      }
    } catch (err) {
      Swal.fire("Error", "Failed to create brand.", "error");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all font-semibold text-slate-700 text-sm placeholder:text-slate-300 placeholder:font-normal";

  return (
    <div className="min-h-screen px-4 py-8 sm:py-20">
      <div className="max-w-2xl mx-auto">

        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Create Brand</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Add a new brand to your catalog library</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Brand Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <PackagePlus size={15} className="text-orange-600" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-800 tracking-tight">Brand Identity</h2>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Name & logo</p>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Name</label>
                  <input
                    type="text"
                    value={Name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Osstem"
                    className={inputCls}
                  />
                </div>

                {/* Logo Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Logo</label>
                  <label className="flex items-center gap-3 w-full px-4 py-3 bg-white border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-all group">
                    <ImagePlus size={16} className="text-slate-400 group-hover:text-orange-500 flex-shrink-0 transition-colors" />
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-orange-500 transition-colors truncate">
                      {logoFile ? logoFile.name : "Click to upload image"}
                    </span>
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Logo Preview */}
              {previewImg && (
                <div className="flex justify-center pt-2">
                  <div className="relative">
                    <img src={previewImg} alt="Preview" className="w-24 h-24 sm:w-28 sm:h-28 object-contain border-2 border-dashed border-orange-200 rounded-2xl p-3 bg-orange-50/30" />
                    <button
                      type="button"
                      onClick={() => { setPreviewImg(""); setLogoFile(null); }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 hover:border-red-200 transition-all"
                    >
                      <HiX size={12} className="text-slate-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Library Assets Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <HiCloudUpload size={15} className="text-slate-600" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 tracking-tight">Library Assets</h2>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">ZIP or PDF files</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addFileRow}
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                <HiPlus size={13} /> Add File
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-3">
              {extraFiles.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 relative">

                  {/* Category */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                    <div className="relative">
                      <select
                        value={item.categoryId}
                        onChange={(e) => updateFileRow(index, "categoryId", e.target.value)}
                        className="w-full text-sm border-2 border-slate-100 bg-white rounded-xl px-4 py-2.5 outline-none focus:border-orange-300 font-semibold text-slate-600 appearance-none cursor-pointer"
                      >
                        <option value="">Select Category</option>
                        {staticCategories.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload (ZIP/PDF)</label>
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-100 rounded-xl cursor-pointer hover:border-orange-300 transition-all group">
                      <HiCloudUpload size={15} className="text-slate-400 group-hover:text-orange-500 flex-shrink-0 transition-colors" />
                      <span className="text-xs font-semibold text-slate-400 truncate">
                        {item.file ? item.file.name.substring(0, 20) + (item.file.name.length > 20 ? "…" : "") : "Choose file"}
                      </span>
                      <input type="file" accept=".zip,.pdf" onChange={(e) => updateFileRow(index, "file", e.target.files[0])} className="hidden" />
                    </label>
                  </div>

                  {/* Remove */}
                  {extraFiles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFileRow(index)}
                      className="self-end sm:self-center w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm flex-shrink-0"
                    >
                      <HiX size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-orange-100 disabled:opacity-50 disabled:cursor-not-allowed bg-[#E68736] hover:bg-[#d5762a]"
          >
            {loading ? "Creating Brand…" : "Finish & Save Brand"}
          </button>

        </form>
      </div>
    </div>
  );
}