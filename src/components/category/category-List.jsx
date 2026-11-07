/* eslint-disable no-unused-vars */
import PageHeader, { SearchInput } from "../ui/PageHeader";
import { useEffect, useState } from "react";
import { HiPencil, HiTrash, HiPlus, HiSearch, HiX } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { CategoryService } from "../../backend/ApiService"; 
import Swal from "sweetalert2";
import Pagination from "../../components/ui/Pagination"; 
import { FolderTree } from "lucide-react";
import { Dialog, DialogBody, DialogButton, DialogFooter, DialogHeader } from "../ui/Dialog";

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
    <div>
      <div>
        <PageHeader
          title="Categories"
          badge={categories?.length ? `${categories.length} total` : undefined}
          description="Organise products into categories for the storefront and filters."
          actions={
            <>
              <SearchInput
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search categories…"
              />
              <button
                type="button"
                onClick={() => navigate("/catalog/categories/add")}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
              >
                <HiPlus className="text-base" /> Add category
              </button>
            </>
          }
        />

        {/* Content Table Section */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 gap-3 rounded-2xl border border-slate-200/80 bg-white">
            <div className="w-10 h-10 border-[3px] border-[#E68736] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fetching Catalog...</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/60">
                    <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider w-24">Preview</th>
                    <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Category Name</th>
                    <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider hidden md:table-cell">Created At</th>
                    <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider hidden sm:table-cell">Updated At</th>
                    <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider text-center w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {currentItems.length > 0 ? (
                    currentItems.map((cat) => (
                      <tr key={cat.categoryId || cat._id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-5 py-3">
                          <div className="w-14 h-14 rounded-xl border border-slate-200/60 bg-slate-50 p-1 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="max-w-full max-h-full object-contain rounded-lg"
                            />
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-semibold text-slate-700 text-sm tracking-tight block max-w-xs truncate">
                            {cat.name}
                          </span>
                        </td>
                        {/* Created At - Hidden on small mobile screens to prevent layout break */}
                        <td className="px-5 py-3 text-slate-500 text-xs font-medium hidden md:table-cell">
                          {formatDate(cat.createdAt)}
                        </td>
                        {/* Updated At - Hidden on extra-small screens */}
                        <td className="px-5 py-3 text-slate-500 text-xs font-medium hidden sm:table-cell">
                          {formatDate(cat.updatedAt)}
                        </td>
                        <td className="px-5 py-3">
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
      <Dialog open={showModal} onClose={() => setShowModal(false)} size="sm" label="Edit category">
        <DialogHeader icon={FolderTree} title="Edit category" subtitle="Change the name or image" onClose={() => setShowModal(false)} />
        <DialogBody className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Category name</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition-all focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Image</label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-2">
              <label className="shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
                Choose file
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
              <span className="min-w-0 truncate text-xs text-slate-500">{editFile ? editFile.name : "No new file chosen"}</span>
            </div>
          </div>

          {previewImg && (
            <div className="flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-brand-200 bg-slate-50 p-1.5">
                <img src={previewImg} alt="Preview" className="max-h-full max-w-full rounded-lg object-contain" />
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogButton tone="ghost" onClick={() => setShowModal(false)}>
            Cancel
          </DialogButton>
          <DialogButton tone="primary" onClick={handleUpdate} isLoading={updating} className="flex-1 sm:flex-none">
            {updating ? "Saving..." : "Save changes"}
          </DialogButton>
        </DialogFooter>
      </Dialog>
    </div>
  );
}