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
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!initialized.current) {
      fetchData();
      initialized.current = true;
    }
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E68736',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await BrandService.deleteBrand(id);
        if (response?.success) {
          fetchData();
          Swal.fire('Deleted!', 'Brand removed.', 'success');
        }
      } catch (error) { Swal.fire('Error!', 'Delete failed.', 'error'); }
    }
  };

  // Change this line
const filteredBrands = Array.isArray(brands) 
  ? brands.filter(b => b.brandName?.toLowerCase().includes(searchTerm.toLowerCase()))
  : [];
  const currentBrands = filteredBrands.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="py-6 md:py-12 px-3 md:px-8 min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto bg-white overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] border border-orange-100 shadow-sm">
        
        <BrandTableHeader 
          onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }} 
          onCreate={() => navigate("/add-brand")} 
        />

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#E68736]"></div></div>
        ) : (
          <div className="px-6 md:px-10 pb-6">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-4">
                <thead className="text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="text-left px-8 py-2">Brand Identity</th>
                    <th className="text-left px-8 py-2">Assets</th>
                    <th className="text-center px-8 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBrands.map((brand) => (
                    <BrandTableRow 
                      key={brand._id || brand.brandId} 
                      brand={brand} 
                      onEdit={() => { setSelectedBrand(brand); setShowModal(true); }}
                      onDelete={() => handleDelete(brand.brandId || brand._id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            <Pagination 
              totalItems={filteredBrands.length} 
              itemsPerPage={ITEMS_PER_PAGE} 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
            />
          </div>
        )}

        {showModal && (
          <EditBrandModal 
            brand={selectedBrand} 
            onClose={() => setShowModal(false)} 
            onRefresh={fetchData} 
          />
        )}
      </div>
    </div>
  );
}