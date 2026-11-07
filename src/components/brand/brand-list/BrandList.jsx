/* eslint-disable no-unused-vars */
import { Tag } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BrandService } from "../../../backend/ApiService";
import Swal from "sweetalert2";
import Pagination from "../../ui/Pagination";
import BrandTableHeader from "./BrandTableHeader";
import BrandTableRow from "./BrandTableRow";
import EditBrandModal from "./EditBrandModal";

const ITEMS_PER_PAGE = 8;

export default function BrandList() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const navigate = useNavigate();
  const initialized = useRef(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await BrandService.getAllBrands();
      setBrands(data?.brands || []);
    } catch (error) {
      console.error("Fetch Error:", error);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized.current) {
      fetchData();
      initialized.current = true;
    }
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "All associated document records will be unlinked.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f43f5e",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await BrandService.deleteBrand(id);
        if (response?.success) {
          fetchData();
          Swal.fire({
            title: "Deleted!",
            text: "Brand removed successfully.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
          });
        }
      } catch (error) {
        Swal.fire("Error!", "Delete configuration process failed.", "error");
      }
    }
  };

  const filteredBrands = Array.isArray(brands)
    ? brands.filter((b) => b.brandName?.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const currentBrands = filteredBrands.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      <BrandTableHeader
        count={brands.length}
        onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }}
        onCreate={() => navigate("/catalog/brands/add")}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-28">
            <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-slate-100 border-t-brand-500" />
          </div>
        ) : currentBrands.length === 0 ? (
          <div className="mx-auto max-w-sm px-6 py-20 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-500">
              <Tag size={20} />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No brands found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {searchTerm ? "Try a different search term." : "Create your first brand to get started."}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3">Brand</th>
                    <th className="px-5 py-3">Created</th>
                    <th className="px-5 py-3">Updated</th>
                    <th className="px-5 py-3">Documents</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentBrands.map((brand) => (
                    <BrandTableRow
                      key={brand._id || brand.brandId}
                      brand={brand}
                      viewMode="desktop"
                      onEdit={() => { setSelectedBrand(brand); setShowModal(true); }}
                      onDelete={() => handleDelete(brand.brandId || brand._id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {currentBrands.map((brand) => (
                <BrandTableRow
                  key={brand._id || brand.brandId}
                  brand={brand}
                  viewMode="mobile"
                  onEdit={() => { setSelectedBrand(brand); setShowModal(true); }}
                  onDelete={() => handleDelete(brand.brandId || brand._id)}
                />
              ))}
            </div>
          </>
        )}

        {!loading && filteredBrands.length > ITEMS_PER_PAGE && (
          <div className="border-t border-slate-100 px-4">
            <Pagination
              totalItems={filteredBrands.length}
              itemsPerPage={ITEMS_PER_PAGE}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </div>

      {showModal && (
        <EditBrandModal
          brand={selectedBrand}
          onClose={() => setShowModal(false)}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
}