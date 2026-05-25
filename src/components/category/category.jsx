/* eslint-disable no-unused-vars */
import { useState } from "react";
// Updated to use the centralized CategoryService
import { CategoryService } from "../../backend/ApiService"; 
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function AddCategory() {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [previewImg, setPreviewImg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewImg(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !file) {
      return Swal.fire("Error", "Category name and image are required", "error");
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("image", file);
      formData.append("permission", "product.category.create"); // Ensure permission is included for backend authorization

      // Create using CategoryService
      await CategoryService.createCategory(formData);

      await Swal.fire("Success", "Category created successfully 🎉", "success");
      
      // Cleanup and redirect
      setName("");
      setFile(null);
      setPreviewImg("");
      navigate("/catalog/categories"); 
    } catch (err) {
      const errMsg = err.response?.data?.message || "Something went wrong";
      Swal.fire("Error", errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-transparent p-6 font-sans">
      {/* Container to align exactly with the main workspace area */}
      <div className="max-w-5xl mx-auto flex flex-col items-center mt-6">
        
        {/* Form Card */}
        <div className="w-full max-w-xl bg-white rounded-2xl p-8 border-t-[10px] border-[#E68736] border border-[#E68736] shadow-xl shadow-orange-50/50">
          <h2 className="text-3xl font-extrabold text-slate-800 mb-1 text-center tracking-tight">New Category</h2>
          <p className="text-slate-400 text-center mb-8 text-xs uppercase tracking-widest font-bold">Catalog Management</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Category Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dental Implants"
                className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:border-[#E68736] focus:ring-1 focus:ring-[#E68736] outline-none transition-all font-medium text-slate-700 placeholder-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Upload Icon/Image</label>
              <div className="flex items-center justify-between border border-orange-200 rounded-xl p-2 bg-white">
                <label className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-sm rounded-lg cursor-pointer transition-colors">
                  Choose File
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </label>
                <span className="text-sm text-slate-400 mr-2 truncate max-w-[250px]">
                  {file ? file.name : "No file chosen"}
                </span>
              </div>
            </div>

            {previewImg && (
              <div className="flex justify-center pt-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="relative group">
                  <img src={previewImg} alt="preview" className="w-28 h-28 object-contain border border-dashed border-orange-200 rounded-xl p-2 bg-white shadow-inner" />
                  <button 
                    type="button"
                    onClick={() => { setFile(null); setPreviewImg(""); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600 shadow"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/catalog/categories")}
                className="flex-1 py-3.5 rounded-xl text-slate-500 font-bold border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3.5 rounded-xl text-white font-bold transition-all ${
                  loading 
                    ? "bg-slate-400 cursor-not-allowed" 
                    : "bg-[#E68736] hover:bg-[#cf6e2e] active:scale-[0.98] shadow-md shadow-orange-200"
                }`}
              >
                {loading ? "Creating..." : "Save Category"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}