import { useState } from "react";
import { HiX as HiXIcon, HiCloudUpload } from "react-icons/hi";
import { BrandService } from "../../../backend/ApiService";
import Swal from "sweetalert2";
import { ChevronDown, ImagePlus } from "lucide-react";

export default function EditBrandModal({ brand, onClose, onRefresh }) {
  const [Name, setName] = useState(brand.brandName || "");
  const [logoFile, setLogoFile] = useState(null);
  const [previewImg, setPreviewImg] = useState(brand.logoUrl || "");
  const [updating, setUpdating] = useState(false);

  const [extraFiles, setExtraFiles] = useState(
    brand.files && brand.files.length > 0
      ? brand.files.map((f) => ({
          id: f.fileId,
          fileLink: f.fileLink,
          categoryId: Array.isArray(f.category) ? f.category[0] : (f.category?.name || f.category || ""),
        }))
      : [{ file: null, categoryId: "" }]
  );

  const [removeFileIds, setRemoveFileIds] = useState([]);
  const staticCategories = ["Abutment-Level", "General", "Screw-Retained"];

  const addFileRow = () => setExtraFiles([...extraFiles, { file: null, categoryId: "" }]);

  const updateFileRow = (index, field, value) => {
    const updated = [...extraFiles];
    updated[index][field] = value;
    setExtraFiles(updated);
  };

  const removeFileRow = (index) => {
    const rowToRemove = extraFiles[index];
    if (rowToRemove.id) setRemoveFileIds((prev) => [...prev, rowToRemove.id]);
    if (extraFiles.length > 1) {
      setExtraFiles(extraFiles.filter((_, i) => i !== index));
    } else {
      setExtraFiles([{ file: null, categoryId: "" }]);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("brandName", Name);
      formData.append("permission", "brand.listing.update");
      if (logoFile) formData.append("logoUrl", logoFile);

      extraFiles.forEach((item) => {
        if (item.file && item.categoryId) {
          formData.append("categories", item.categoryId);
          formData.append("file", item.file);
        }
      });

      removeFileIds.forEach((id) => formData.append("removeFileIds", id));

      const res = await BrandService.updateBrand(brand.brandId || brand._id, formData);
      if (res?.success) {
        Swal.fire({ icon: "success", title: "Updated!", timer: 1500, showConfirmButton: false });
        onRefresh();
        onClose();
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update brand assets", "error");
    } finally {
      setUpdating(false);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all font-semibold text-slate-700 text-sm";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl sm:rounded-[2rem] w-full max-w-xl shadow-2xl border border-orange-100 max-h-[90vh] flex flex-col">

        {/* Modal Header */}
        <div className="flex justify-between items-center px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex-shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
              Edit Brand <span className="text-[#E68736]">Assets</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">{brand.brandName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
          >
            <HiXIcon size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5">
          <form onSubmit={handleUpdate} id="edit-brand-form" className="space-y-5">

            {/* Brand Name & Logo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Name</label>
                <input
                  type="text"
                  value={Name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Logo</label>
                <label className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-all group">
                  <ImagePlus size={15} className="text-slate-400 group-hover:text-orange-500 flex-shrink-0 transition-colors" />
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-orange-500 transition-colors truncate">
                    {logoFile ? logoFile.name : "Click to replace logo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) { setLogoFile(file); setPreviewImg(URL.createObjectURL(file)); }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Logo Preview */}
            {previewImg && (
              <div className="flex justify-center">
                <img
                  src={previewImg}
                  className="h-20 w-20 object-contain border-2 border-dashed border-orange-200 rounded-2xl p-2 bg-orange-50/30"
                  alt="Preview"
                />
              </div>
            )}

            {/* Library Documents */}
            <div className="border-t border-slate-100 pt-5">
              <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Library Documents</label>
                <button
                  type="button"
                  onClick={addFileRow}
                  className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  + Add Row
                </button>
              </div>

              <div className="space-y-3">
                {extraFiles.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-3 items-end bg-slate-50 p-4 rounded-xl border border-slate-100">

                    {/* Category */}
                    <div className="w-full sm:flex-1 flex flex-col gap-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                      <div className="relative">
                        <select
                          value={item.categoryId}
                          onChange={(e) => updateFileRow(index, "categoryId", e.target.value)}
                          className="w-full text-xs border-2 border-slate-100 bg-white rounded-xl px-3 py-2.5 outline-none focus:border-orange-300 font-bold text-slate-600 appearance-none cursor-pointer"
                        >
                          <option value="">-- Category --</option>
                          {staticCategories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* File */}
                    <div className="w-full sm:flex-1 flex flex-col gap-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">File</label>
                      {item.fileLink && !item.file ? (
                        <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-3 py-2.5 rounded-xl border border-emerald-100 truncate">
                          ✓ {item.fileLink.split("/").pop()}
                        </div>
                      ) : (
                        <label className="flex items-center gap-2 px-3 py-2.5 bg-white border-2 border-slate-100 rounded-xl cursor-pointer hover:border-orange-300 transition-all group">
                          <HiCloudUpload size={13} className="text-slate-400 group-hover:text-orange-500 flex-shrink-0" />
                          <span className="text-[10px] font-semibold text-slate-400 truncate">
                            {item.file ? item.file.name.substring(0, 18) + "…" : "Choose file"}
                          </span>
                          <input
                            type="file"
                            onChange={(e) => updateFileRow(index, "file", e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeFileRow(index)}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all flex-shrink-0"
                    >
                      <HiXIcon size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </form>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 px-5 sm:px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 rounded-xl transition-all border-2 border-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-brand-form"
            disabled={updating}
            className="flex-1 py-3 bg-[#E68736] text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-orange-100 disabled:opacity-50 hover:bg-[#cf6e2e] active:scale-95 transition-all"
          >
            {updating ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}