/* eslint-disable no-unused-vars */
import { useState } from "react";
import { BrandService } from "../../backend/ApiService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { HiPlus, HiX, HiCloudUpload } from "react-icons/hi";
import { ImagePlus, PackagePlus, ArrowLeft } from "lucide-react";

// 1. Import your custom DropdownGroup component here
import DropdownGroup from "../../components/ui/DropdownGroup"; // Adjust path as necessary per your folder structure

export default function AddBrand() {
  const navigate = useNavigate();
  const [Name, setName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [previewImg, setPreviewImg] = useState("");
  const [loading, setLoading] = useState(false);
  const [extraFiles, setExtraFiles] = useState([{ file: null, categoryId: "" }]);

  // Formatted options to match the { value, label } structure your component expects
  const dropdownCategories = [
    { value: "Abutment-Level", label: "Abutment-Level" },
    { value: "General", label: "General" },
    { value: "Screw-Retained", label: "Screw-Retained" },
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
    } else {
      setExtraFiles([{ file: null, categoryId: "" }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!Name || !logoFile) {
      return Swal.fire({
        icon: "error",
        title: "Required Fields Missing",
        text: "Please provide both a brand name and a profile logo image.",
        confirmButtonColor: "#E68736",
      });
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
        Swal.fire({
          icon: "success",
          title: "Brand Created",
          text: "The new identity has been saved to your catalog.",
          showConfirmButton: false,
          timer: 1500,
        });
        navigate("/catalog/brands");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "An error occurred while building the brand profile records.",
        confirmButtonColor: "#E68736",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12 lg:py-12">
      <div className="max-w-2xl mx-auto">
        
        {/* Page Header Layout */}
        <div className="mb-8 text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Add New <span className="text-[#E68736]">Brand Identity</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em] mt-1.5">
            Configure metadata profile documentation rulesets for a fresh catalog vendor
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Brand Info Card Profile Component */}
          <div className="bg-white rounded-2xl border border-orange-100 shadow-xl shadow-slate-100/40 overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-white">
              <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <PackagePlus size={15} className="text-[#E68736]" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-800 tracking-tight">Brand Profile Identity</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Core Name & Visual Logo</p>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Inputs: Brand Name Text Input field wrapper */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Brand Name Descriptor</label>
                  <input
                    type="text"
                    value={Name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Osstem Surgical"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#E68736] focus:ring-4 focus:ring-orange-500/5 transition-all font-semibold text-slate-700 text-sm placeholder:text-slate-300 placeholder:font-normal"
                    required
                  />
                </div>

                {/* Inputs: Logo Binary File system selector wrapper frame element */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Brand Logo Graphic</label>
                  <label className="flex items-center gap-3 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-[#E68736] hover:bg-orange-50/10 transition-all group overflow-hidden">
                    <ImagePlus size={15} className="text-slate-400 group-hover:text-[#E68736] flex-shrink-0 transition-colors" />
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-[#E68736] transition-colors truncate">
                      {logoFile ? logoFile.name : "Choose profile vector/image"}
                    </span>
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  </label>
                </div>

              </div>

              {/* Dynamic Binary Profile Visual Logo Preview Thumbnail Box wrapper */}
              {previewImg && (
                <div className="flex justify-center pt-2 border-t border-slate-50">
                  <div className="relative p-2.5 bg-white border border-slate-100 rounded-2xl shadow-sm group">
                    <img src={previewImg} alt="Visual Logo Payload Preview" className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-xl" />
                    <button
                      type="button"
                      onClick={() => { setPreviewImg(""); setLogoFile(null); }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 rounded-full flex items-center justify-center shadow-md hover:border-rose-100 hover:bg-rose-50/50 transition-all"
                      title="Remove graphic asset"
                    >
                      <HiX size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Library Documentation Dynamic Grid Fields Array Wrapper */}
         <div className="bg-white rounded-2xl border border-orange-100 shadow-xl shadow-slate-100/40 overflow-visible">
  <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
        <HiCloudUpload size={15} className="text-slate-500" />
      </div>
      <div>
        <h2 className="text-sm font-black text-slate-800 tracking-tight">System Library Documents</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Complementary compressed ZIP / PDF specification manuals</p>
      </div>
    </div>
    <button
      type="button"
      onClick={addFileRow}
      className="flex items-center gap-1 bg-slate-900 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-[0.97]"
    >
      <HiPlus size={12} strokeWidth={2} /> Add Row
    </button>
  </div>

  <div className="p-5 sm:p-6 space-y-4 bg-slate-50/40 overflow-visible">
    {extraFiles.map((item, index) => (
      <div 
        key={index} 
     
        style={{ zIndex: extraFiles.length - index }}
        className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl border border-slate-100 relative group animate-fade-in items-stretch sm:items-end overflow-visible"
      >

        {/* Integrated Custom Dropdown Component */}
        <div className="w-full sm:flex-1">
          <DropdownGroup
            label="Classification Scope"
            options={dropdownCategories}
            value={item.categoryId}
            onChange={(value) => updateFileRow(index, "categoryId", value)}
          />
        </div>

        {/* Associated documentation attachment input file upload handler target field entry row */}
        <div className="w-full sm:flex-1 flex flex-col gap-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Asset Payload (ZIP/PDF)</label>
          <label className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-[#E68736] transition-all group/file overflow-hidden">
            <HiCloudUpload size={15} className="text-slate-400 group-hover/file:text-[#E68736] flex-shrink-0" />
            <span className="text-[11px] font-semibold text-slate-400 truncate">
              {item.file ? item.file.name : "Choose system document asset"}
            </span>
            <input type="file" accept=".zip,.pdf" onChange={(e) => updateFileRow(index, "file", e.target.files[0])} className="hidden" />
          </label>
        </div>

        {/* Splice line row mapping item delete action trigger trigger node */}
        {extraFiles.length > 1 && (
          <button
            type="button"
            onClick={() => removeFileRow(index)}
            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50/40 transition-all flex-shrink-0 sm:mb-0.5 shadow-sm"
            title="Discard attachment allocation array element row"
          >
            <HiX size={14} />
          </button>
        )}
      </div>
    ))}
  </div>
</div>

          {/* Core Master Form Save Action Trigger Commit Button Panel Node module */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.99] shadow-lg shadow-orange-500/10 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none bg-[#E68736] hover:bg-[#cf6e2e]"
          >
            {loading ? "Constructing Brand Parameters..." : "Commit & Save Corporate Identity"}
          </button>

        </form>
      </div>
    </div>
  );
}
