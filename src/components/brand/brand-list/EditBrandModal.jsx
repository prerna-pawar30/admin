import { useState } from "react";
import { HiX as HiXIcon, HiCloudUpload } from "react-icons/hi";
import { BrandService } from "../../../backend/ApiService";
import Swal from "sweetalert2";
import { ImagePlus } from "lucide-react";

// 1. Import your custom DropdownGroup component here
import DropdownGroup from "../../../components/ui/DropdownGroup"; // Adjust path as necessary per your folder structure

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
  
  // Formatted options to match the { value, label } structure your component expects
  const dropdownCategories = [
    { value: "Abutment-Level", label: "Abutment-Level" },
    { value: "General", label: "General" },
    { value: "Screw-Retained", label: "Screw-Retained" },
  ];

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
      formData.append("permission", "product.brand.update"); // Backend authorization scope key
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

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-100 max-h-[84vh] flex flex-col overflow-hidden transform scale-100 transition-all">

        {/* Modal Module Header Control Panel */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 flex-shrink-0 bg-white">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
              Edit Brand <span className="text-[#E68736]">Assets</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Refine parameters for {brand.brandName || "Identity Node"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors border border-transparent hover:border-slate-100"
          >
            <HiXIcon size={16} />
          </button>
        </div>

        {/* Scrollable Workflow Parameters workspace viewport - Added overflow-y-auto and overflow-x-visible */}
        <div className="overflow-y-auto overflow-x-visible flex-1 px-6 py-6 bg-slate-50/30">
          <form onSubmit={handleUpdate} id="edit-brand-form" className="space-y-6 overflow-visible">

            {/* Core Identification Input parameters row segments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Brand Name Descriptor</label>
                <input
                  type="text"
                  value={Name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#E68736] focus:ring-4 focus:ring-orange-500/5 transition-all font-semibold text-slate-700 text-sm placeholder-slate-400"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Update Identity Logo</label>
                <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-[#E68736] hover:bg-orange-50/10 transition-all group overflow-hidden">
                  <ImagePlus size={15} className="text-slate-400 group-hover:text-[#E68736] flex-shrink-0 transition-colors" />
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-[#E68736] transition-colors truncate">
                    {logoFile ? logoFile.name : "Choose replacement graphic"}
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

            {/* Micro Thumbnail graphics Preview section layout panel component frame block */}
            {previewImg && (
              <div className="flex justify-center pt-2">
                <div className="relative p-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <img
                    src={previewImg}
                    className="h-16 w-16 object-contain rounded-xl"
                    alt="Logo Stream Preview"
                  />
                </div>
              </div>
            )}

            {/* Dynamic System Document Matrix rows manager panels grouping section block layout */}
            <div className="border-t border-slate-200/60 pt-5 overflow-visible">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Library Documents Mapping</label>
                  <p className="text-[10px] text-slate-400 font-medium">Link file assets directly to operational scopes</p>
                </div>
                <button
                  type="button"
                  onClick={addFileRow}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  + Add Row Item
                </button>
              </div>

              <div className="space-y-3 overflow-visible">
                {extraFiles.map((item, index) => (
                  <div 
                    key={index} 
                   
                    style={{ zIndex: extraFiles.length - index }}
                    className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative group overflow-visible"
                  >

                    {/* Integrated Custom Dropdown Component */}
                    <div className="w-full sm:flex-1">
                      <DropdownGroup
                        label="Category Node"
                        options={dropdownCategories}
                        value={item.categoryId}
                        onChange={(value) => updateFileRow(index, "categoryId", value)}
                      />
                    </div>

                    {/* Operational Binary stream system document selector upload link target */}
                    <div className="w-full sm:flex-1 flex flex-col gap-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Document Resource Payload</label>
                      {item.fileLink && !item.file ? (
                        <div className="text-[11px] text-emerald-600 font-bold bg-emerald-50/60 px-3 py-2.5 rounded-xl border border-emerald-100/60 truncate" title={item.fileLink}>
                          ✓ {item.fileLink.split("/").pop()}
                        </div>
                      ) : (
                        <label className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-[#E68736] transition-all group/file overflow-hidden">
                          <HiCloudUpload size={15} className="text-slate-400 group-hover/file:text-[#E68736] flex-shrink-0" />
                          <span className="text-[11px] font-semibold text-slate-400 truncate">
                            {item.file ? item.file.name : "Select device asset payload"}
                          </span>
                          <input
                            type="file"
                            onChange={(e) => updateFileRow(index, "file", e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Dynamic array listing tracking dynamic line items record drops elements button triggers */}
                    <button
                      type="button"
                      onClick={() => removeFileRow(index)}
                      className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50/40 transition-all flex-shrink-0 sm:mb-0.5"
                    >
                      <HiXIcon size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </form>
        </div>

        {/* Modal Controls Actions Anchor Footer Panel workspace bottom edge frame border wrapper */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white z-[10]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-slate-500 font-bold uppercase text-[10px] tracking-wider hover:bg-slate-50 rounded-xl transition-all border border-slate-200"
          >
            Close Dialog
          </button>
          <button
            type="submit"
            form="edit-brand-form"
            disabled={updating}
            className="flex-1 py-3 bg-[#E68736] text-white font-bold uppercase text-[10px] tracking-wider rounded-xl shadow-md shadow-orange-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none hover:bg-[#cf6e2e] active:scale-[0.99] transition-all"
          >
            {updating ? "Saving Changes..." : "Apply Configurations"}
          </button>
        </div>

      </div>
    </div>
  );
}