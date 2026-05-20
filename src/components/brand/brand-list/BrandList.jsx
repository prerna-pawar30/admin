/* eslint-disable no-unused-vars */
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
    <div className="min-h-screen bg-slate-50/40 p-4 sm:p-8 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col justify-between">
        
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/40 overflow-hidden mb-6">
          <BrandTableHeader
            onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }}
            onCreate={() => navigate("/catalog/brands/add")}
          />

          {loading ? (
            <div className="flex justify-center items-center py-32">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-[#E68736]" />
            </div>
          ) : currentBrands.length === 0 ? (
            <div className="text-center py-24 bg-white max-w-md mx-auto p-6">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#E68736] flex items-center justify-center mx-auto mb-4 text-xl">
                📦
              </div>
              <h3 className="font-bold text-slate-700 text-base">No Brands Located</h3>
              <p className="text-slate-400 text-xs mt-1">
                Try transforming your query parameter search keywords or configure a fresh identity node.
              </p>
            </div>
          ) : (
            <div className="px-4 sm:px-8 pb-8 pt-2">
              
              {/* Responsive Interface Wrapper */}
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle p-4 sm:p-0">
                  
                  {/* Clean Uniform Desktop Table Base Layout Structure */}
                  <table className="min-w-full border-separate border-spacing-y-3 hidden md:table">
                    <thead>
                      <tr className="text-slate-400 uppercase text-[10px] font-black tracking-widest">
                        <th className="text-left pl-6 pr-4 py-2">Brand Identity</th>
                        <th className="text-left px-4 py-2">Timestamps</th>
                        <th className="text-left px-4 py-2">System Catalog Assets</th>
                        <th className="text-center pr-6 pl-4 py-2 w-22">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
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

                  {/* Clean Alternative Layout for Compact Mobile Matrix viewports */}
                  <div className="space-y-4 md:hidden">
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

                </div>
              </div>

            </div>
          )}
        </div>

        {/* Global Pagination Area Anchor footer section panel wrapper */}
        {!loading && filteredBrands.length > ITEMS_PER_PAGE && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/40 px-4 py-3">
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