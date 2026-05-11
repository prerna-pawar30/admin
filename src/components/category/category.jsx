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
      formData.append("permission", "category.listing.create"); // Ensure permission is included for backend authorization

      // Create using CategoryService
      await CategoryService.createCategory(formData);

      await Swal.fire("Success", "Category created successfully 🎉", "success");
      
      // Cleanup and redirect
      setName("");
      setFile(null);
      setPreviewImg("");
      navigate("catlog/categories"); 
    } catch (err) {
      const errMsg = err.response?.data?.message || "Something went wrong";
      Swal.fire("Error", errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ">
      <div className="w-full max-w-md bg-white rounded-2xl  p-8 border-t-8 border-[#E68736] shadow-lg shadow-orange-50">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">New Category</h2>
        <p className="text-gray-400 text-center mb-8 text-sm uppercase tracking-widest font-bold">Catalog Management</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dental Implants"
              className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-[#E68736] outline-none transition-all font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Upload Icon/Image</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer" 
            />
          </div>

          {previewImg && (
            <div className="flex justify-center animate-in fade-in zoom-in">
              <img src={previewImg} alt="preview" className="w-32 h-32 object-contain border-2 border-dashed border-orange-200 rounded-2xl p-3 bg-white shadow-sm" />
            </div>
          )}

          <div className="pt-4 flex gap-3">
             <button
              type="button"
              onClick={() => navigate("/category-list")}
              className="flex-1 py-4 rounded-xl text-gray-500 font-bold border-2 border-gray-100 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-4 rounded-xl text-white font-bold shadow-lg shadow-orange-100 transition-all ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#E68736] hover:bg-[#cf6e2e] active:scale-95"
              }`}
            >
              {loading ? "Creating..." : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}