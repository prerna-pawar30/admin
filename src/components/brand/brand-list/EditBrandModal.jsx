import { useState } from "react";
import { HiX as HiXIcon } from "react-icons/hi";
import { BrandService } from "../../../backend/ApiService";
import Swal from "sweetalert2";

export default function EditBrandModal({ brand, onClose, onRefresh }) {
  // --- FORM STATES ---
  const [Name, setName] = useState(brand.brandName || "");
  const [logoFile, setLogoFile] = useState(null);
  const [previewImg, setPreviewImg] = useState(brand.logoUrl || "");
  const [updating, setUpdating] = useState(false);

  // --- FILE LIBRARY STATES ---
  // We map existing brand files or start with one empty row
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

  // --- HANDLERS ---
  const addFileRow = () => {
    setExtraFiles([...extraFiles, { file: null, categoryId: "" }]);
  };

  const updateFileRow = (index, field, value) => {
    const updated = [...extraFiles];
    updated[index][field] = value;
    setExtraFiles(updated);
  };

  const removeFileRow = (index) => {
    const rowToRemove = extraFiles[index];
    // If the file already exists on the server, track its ID for deletion
    if (rowToRemove.id) {
      setRemoveFileIds((prev) => [...prev, rowToRemove.id]);
    }

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
      formData.append("permission", "ubrand.listing.update"); // Ensure permission is included for backend authorization

      // Handle Logo
      if (logoFile) {
        formData.append("logoUrl", logoFile);
      }

      // Handle Library Files
      extraFiles.forEach((item) => {
        if (item.file && item.categoryId) {
          // New file being uploaded
          formData.append("categories", item.categoryId);
          formData.append("file", item.file);
        } else if (item.id && !removeFileIds.includes(item.id)) {
          // Existing file being kept (just send category)
          formData.append("categories", item.categoryId);
        }
      });

      // Handle Removals
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-8 shadow-2xl border border-orange-100 my-8">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            Edit Brand <span className="text-[#E68736]">Assets</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <HiXIcon size={24} />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Brand Name & Logo Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Brand Name</label>
              <input
                type="text"
                value={Name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-orange-100 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/5 font-bold text-slate-700"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Update Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setLogoFile(file);
                    setPreviewImg(URL.createObjectURL(file));
                  }
                }}
                className="w-full text-[10px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-orange-50 file:text-orange-600"
              />
            </div>
          </div>

          {/* Logo Preview */}
          {previewImg && (
            <div className="flex justify-center">
              <img src={previewImg} className="h-20 w-20 object-contain border border-orange-200 rounded-2xl p-2 bg-white" alt="Preview" />
            </div>
          )}

          {/* Library Documents Section */}
          <div className="border-t border-slate-100 pt-6">
            <div className="flex justify-between items-center mb-4">
              <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Library Documents</label>
              <button
                type="button"
                onClick={addFileRow}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black hover:bg-slate-700 transition-all"
              >
                + ADD ROW
              </button>
            </div>

            <div className="space-y-3">
              {extraFiles.map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-3 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-full md:flex-1">
                    <select
                      value={item.categoryId}
                      onChange={(e) => updateFileRow(index, "categoryId", e.target.value)}
                      className="w-full text-xs border border-orange-100 rounded-xl p-3 bg-white outline-none font-bold text-slate-600"
                    >
                      <option value="">-- Category --</option>
                      {staticCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-full md:flex-1">
                    {item.fileLink && !item.file ? (
                      <div className="text-[10px] text-green-600 font-bold bg-green-50 p-3 rounded-xl border border-green-100 truncate">
                        {item.fileLink.split("/").pop()}
                      </div>
                    ) : (
                      <input
                        type="file"
                        onChange={(e) => updateFileRow(index, "file", e.target.files[0])}
                        className="w-full text-[10px] bg-white p-2 rounded-xl border border-orange-50"
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFileRow(index)}
                    className="bg-white p-3 text-red-400 hover:text-red-600 rounded-xl shadow-sm transition-colors"
                  >
                    <HiXIcon size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="flex-1 py-4 bg-[#E68736] text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg shadow-orange-200 disabled:opacity-50 hover:bg-[#cf6e2e] transition-all"
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}