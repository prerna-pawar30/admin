/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { HiPencil, HiTrash, HiPlus, HiSearch, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
// Updated to use the centralized CategoryService
import { CategoryService } from "../../backend/ApiService"; 
import Swal from "sweetalert2";

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
      // Fetch using CategoryService
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

  // --- LOGIC: FILTER & PAGINATE ---

const filteredCategories = (Array.isArray(categories) ? categories : []).filter((cat) =>
  cat.name.toLowerCase().includes(searchQuery.toLowerCase())
);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // DELETE LOGIC
  const handleDelete = async (categoryId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This category will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E68736",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        // Delete using CategoryService
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
      
      // Update using CategoryService
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
    <div className="py-6 md:py-20 px-2 sm:px-4 md:px-4 min-h-screen bg-gray-50">
      <div className="w-full bg-white p-4 md:p-8 rounded-lg md:rounded-2xl shadow-sm border border-orange-200">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-3xl font-bold text-gray-800">
            Category <span className="text-[#E68736]">Management</span>
          </h2>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 md:py-2.5 border-2 border-orange-200 rounded-lg md:rounded-xl focus:border-[#E68736] outline-none transition-all text-xs sm:text-sm md:text-base"
              />
            </div>

            <button
              onClick={() => navigate("/add-category")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E68736] text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl hover:bg-[#cf752b] transition font-bold text-sm md:text-base whitespace-nowrap"
            >
              <HiPlus className="text-lg md:text-xl" /> Create New
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#E68736] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="border border-orange-200 rounded-lg md:rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm md:text-base">
                <thead>
                  <tr className="bg-gray-50 border-b border-orange-200">
                    <th className="p-2 md:p-4 font-bold text-gray-600">Preview</th>
                    <th className="p-2 md:p-4 font-bold text-gray-600">Category Name</th>
                    <th className="p-2 md:p-4 font-bold text-gray-600 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((cat) => (
                      <tr key={cat.categoryId || cat._id} className="hover:bg-gray-50/50 transition">
                        <td className="p-2 md:p-4">
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="h-10 md:h-24 w-10 md:w-24 object-contain rounded-lg border border-orange-200 bg-white"
                          />
                        </td>
                        <td className="p-2 md:p-4 font-semibold text-gray-700 truncate">{cat.name}</td>
                        <td className="p-2 md:p-4">
                          <div className="flex justify-center gap-1 md:gap-3">
                            <button
                              onClick={() => openEditModal(cat)}
                              className="p-1.5 md:p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                              title="Edit"
                            >
                              <HiPencil size={20} />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.categoryId || cat._id)}
                              className="p-1.5 md:p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <HiTrash size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="p-10 text-center text-gray-400">
                        No categories found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 bg-gray-50 border-t border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-sm text-gray-500 font-medium">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCategories.length)} of {filteredCategories.length} entries
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="p-2 border border-orange-200 rounded-lg hover:bg-white disabled:opacity-30 transition"
                  >
                    <HiChevronLeft size={20} />
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                        currentPage === i + 1 
                          ? "bg-[#E68736] text-white shadow-md shadow-orange-200" 
                          : "bg-white border border-orange-200 text-gray-600 hover:border-orange-400"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="p-2 border border-orange-200 rounded-lg hover:bg-white disabled:opacity-30 transition"
                  >
                    <HiChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-orange-200">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Update Category</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Category Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border-2 border-orange-200 px-4 py-3 rounded-xl mt-1 focus:border-[#E68736] outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Category Image</label>
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
                  className="w-full text-sm mt-1"
                />
              </div>
              {previewImg && (
                <div className="flex justify-center py-2">
                  <img src={previewImg} alt="Preview" className="h-24 w-24 object-contain rounded-xl border border-orange-200 p-2" />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 border-2 border-orange-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleUpdate} disabled={updating} className="flex-1 py-3 bg-[#E68736] text-white rounded-xl font-bold disabled:bg-gray-300">
                {updating ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}