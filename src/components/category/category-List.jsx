/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { HiPencil, HiTrash, HiPlus, HiSearch, HiX } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { CategoryService } from "../../backend/ApiService"; 
import Swal from "sweetalert2";
import Pagination from "../../components/ui/Pagination"; 

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal & Edit States
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [previewImg, setPreviewImg] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchList = async () => {
    try {
      setLoading(true);
      const data = await CategoryService.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Helper function to format MongoDB ISO dates neatly
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // --- LOGIC: FILTER & PAGINATE ---
  const filteredCategories = (Array.isArray(categories) ? categories : []).filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

  // DELETE LOGIC
  const handleDelete = async (categoryId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This category will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E68736",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await CategoryService.deleteCategory(categoryId);
        Swal.fire("Deleted!", "Category has been removed.", "success");
        fetchList();
      } catch (err) {
        Swal.fire("Error", "Failed to delete category", "error");
      }
    }
  };

  // EDIT MODAL LOGIC
  const openEditModal = (cat) => {
    setEditCategory(cat);
    setEditName(cat.name);
    setPreviewImg(cat.image);
    setEditFile(null);
    setShowModal(true);
  };

  const handleUpdate = async () => {
    if (!editName.trim()) return Swal.fire("Error", "Name is required", "error");
    try {
      setUpdating(true);
      const formData = new FormData();
      formData.append("name", editName);
      if (editFile) formData.append("image", editFile);
      
      await CategoryService.updateCategory(editCategory.categoryId || editCategory._id, formData);
      
      setShowModal(false);
      Swal.fire("Success", "Category updated successfully", "success");
      fetchList();
    } catch (err) {
      Swal.fire("Error", "Update failed", "error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="w-full bg-transparent p-4 sm:p-6 font-sans antialiased">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-100/50 border border-slate-100 p-6 md:p-8">
        
        {/* Header Action Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Category <span className="text-[#E68736]">Management</span>
            </h2>
            <p className="text-slate-400 text-sm mt-1">Manage product classification catalog listings</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#E68736] focus:ring-1 focus:ring-[#E68736] outline-none text-sm font-medium text-slate-700 placeholder-slate-400"
              />
            </div>

            <button
              onClick={() => navigate("/catalog/categories/add")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E68736] text-white px-5 py-2.5 rounded-xl hover:bg-[#cf6e2e] active:scale-[0.98] transition-all font-bold text-sm shadow-md shadow-orange-100 whitespace-nowrap"
            >
              <HiPlus className="text-lg" /> Create New
            </button>
          </div>
        </div>

        {/* Content Table Section */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 gap-3">
            <div className="w-10 h-10 border-[3px] border-[#E68736] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fetching Catalog...</p>
          </div>
        ) : (
          <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/60">
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider w-24">Preview</th>
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Category Name</th>
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">Created At</th>
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell">Updated At</th>
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-center w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {currentItems.length > 0 ? (
                    currentItems.map((cat) => (
                      <tr key={cat.categoryId || cat._id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="p-4">
                          <div className="w-14 h-14 rounded-xl border border-slate-200/60 bg-slate-50 p-1 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="max-w-full max-h-full object-contain rounded-lg"
                            />
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-700 text-sm tracking-tight block max-w-xs truncate">
                            {cat.name}
                          </span>
                        </td>
                        {/* Created At - Hidden on small mobile screens to prevent layout break */}
                        <td className="p-4 text-slate-500 text-xs font-medium hidden md:table-cell">
                          {formatDate(cat.createdAt)}
                        </td>
                        {/* Updated At - Hidden on extra-small screens */}
                        <td className="p-4 text-slate-500 text-xs font-medium hidden sm:table-cell">
                          {formatDate(cat.updatedAt)}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center items-center gap-1">
                            <button
                              onClick={() => openEditModal(cat)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                              title="Edit Category"
                            >
                              <HiPencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.categoryId || cat._id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                              title="Delete Category"
                            >
                              <HiTrash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-16 text-center text-slate-400 font-medium text-sm">
                        No categories found matching your search options.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Segment */}
            <div className="bg-white border-t border-slate-100 p-4">
              <Pagination 
                totalItems={filteredCategories.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Update Category</h3>
                <p className="text-xs text-slate-400 mt-0.5">Modify listing name and asset files</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close dialog"
              >
                <HiX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Category Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:border-[#E68736] focus:ring-1 focus:ring-[#E68736] outline-none text-sm font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Category Image Asset</label>
                <div className="flex items-center justify-between border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                  <label className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg cursor-pointer transition-colors shadow-sm">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setEditFile(file);
                          setPreviewImg(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-slate-400 mr-2 truncate max-w-[200px]">
                    {editFile ? editFile.name : "Change asset file..."}
                  </span>
                </div>
              </div>

              {previewImg && (
                <div className="flex justify-center pt-2">
                  <div className="w-24 h-24 rounded-xl border border-dashed border-orange-200 p-1.5 bg-slate-50 flex items-center justify-center">
                    <img src={previewImg} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg" />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setShowModal(false)} 
                className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate} 
                disabled={updating} 
                className="flex-1 py-2.5 bg-[#E68736] hover:bg-[#cf6e2e] text-white rounded-xl font-bold text-sm disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-md shadow-orange-100"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}