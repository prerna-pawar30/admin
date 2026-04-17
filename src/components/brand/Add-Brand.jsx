/* eslint-disable no-unused-vars */
import { useState } from "react";
// Changed import to use BrandService
import { BrandService } from "../../backend/ApiService"; 
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { HiPlus, HiX, HiCloudUpload } from "react-icons/hi";

export default function AddBrand() {
  const navigate = useNavigate();
  // Keep state casing as is for internal use, but we will fix the outgoing key
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
      // FIX: Changed "Name" to "name" to satisfy backend validation
      formData.append("name", Name); 
      formData.append("logoUrl", logoFile);
      formData.append("permission", "brand.listing.create"); // Ensure permission is included for backend authorization

      extraFiles.forEach((item) => {
        if (item.file && item.categoryId) {
          formData.append("file", item.file);
          formData.append("categories", item.categoryId); 
        }
      });

      // Using BrandService instead of direct API call
      const response = await BrandService.createBrand(formData);
      if (response?.success) {
        Swal.fire("Success", "Brand created successfully", "success");
        navigate("catlog/brands");
      }
    } catch (err) {
      Swal.fire("Error", "Failed to create brand.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen   px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem]   p-8 md:p-12 border border-orange-200">
        <h2 className="text-3xl font-black text-[#072434] mb-10 text-center uppercase tracking-tight">
          Create Brand
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Brand Name</label>
              <input
                type="text"
                value={Name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Osstem"
                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-orange-200 rounded-2xl outline-none focus:border-orange-200 transition-all font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Brand Logo</label>
              <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-xs file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 cursor-pointer transition-all" />
            </div>
          </div>

          {previewImg && (
            <div className="flex justify-center">
              <img src={previewImg} alt="Preview" className="w-32 h-32 object-contain border-2 border-dashed border-orange-200 rounded-[2rem] p-4 bg-white" />
            </div>
          )}

          <div className="border-t border-gray-100 pt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest">Library Assets</h3>
              <button type="button" onClick={addFileRow} className="bg-[#E68736] text-white px-5 py-2 rounded-xl text-[10px] font-black hover:bg-[#E68736] transition-all">+ ADD FILE</button>
            </div>

            <div className="space-y-4">
              {extraFiles.map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-4 p-6 bg-gray-50 rounded-[1.5rem] border border-orange-200 relative group">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] uppercase font-black text-gray-400">Category</label>
                    <select 
                      value={item.categoryId} 
                      onChange={(e) => updateFileRow(index, "categoryId", e.target.value)}
                      className="w-full text-sm border-2 border-orange-200 rounded-xl p-3 bg-white outline-none focus:border-orange-200 font-bold text-gray-600"
                    >
                      <option value="">Select Category</option>
                      {staticCategories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] uppercase font-black text-gray-400">Upload (ZIP/PDF)</label>
                    <div className="relative">
                      <input type="file" accept=".zip,.pdf" onChange={(e) => updateFileRow(index, "file", e.target.files[0])} className="w-full text-xs file:hidden p-3 bg-white rounded-xl border-2 border-transparent focus:border-orange-200" />
                      <span className="absolute right-3 top-3 text-gray-300 pointer-events-none">
                        {item.file ? <span className="text-orange-500 font-bold">{item.file.name.substring(0,15)}...</span> : <HiCloudUpload size={20}/>}
                      </span>
                    </div>
                  </div>
                  {extraFiles.length > 1 && (
                    <button type="button" onClick={() => removeFileRow(index)} className="absolute -top-2 -right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md hover:bg-red-50"><HiX size={16}/></button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-xl text-white font-black text-sm uppercase tracking-[0.2em]   transition-all ${loading ? "bg-gray-400" : "bg-[#E68736] hover:bg-[#E68736] hover:-translate-y-1"}`}
          >
            {loading ? "Creating Brand..." : "Finish & Save Brand"}
          </button>
        </form>
      </div>
    </div>
  );
}