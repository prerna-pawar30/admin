/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Import Services
import { BannerService } from "../../../backend/ApiService";

// Import Sub-components
import HeaderActions from "./HeaderActions";
import BannerTable from "./BannerTable";
import Pagination from "../../ui/Pagination";
import EditBannerModal from "./EditBannerModal";

const BannerList = () => {
  const navigate = useNavigate();
  const itemsPerPage = 8;

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);

  // 1. Fetch data from API
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await BannerService.getBanners();
      if (res?.success) {
        // res.data contains the array of banners with isActive: true/false
        // Example: If the array is inside res.data.banners
        setBanners(res.data.banners || []);
      }
    } catch (err) {
      console.error("Fetch banners failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // 2. Process Data: Filter AND Sort (Newest First)
const processedBanners = useMemo(() => {
  // Add Array.isArray check to prevent the "not iterable" crash
  let result = Array.isArray(banners) ? [...banners] : [];

  if (searchQuery && result.length > 0) {
    result = result.filter((b) =>
      b.filterBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.filterId?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return result.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB - dateA;
  });
}, [banners, searchQuery]);

  // 3. Pagination Logic
  const totalPages = Math.ceil(processedBanners.length / itemsPerPage);
  const currentItems = processedBanners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 4. Delete Handler
  const deleteBanner = async (bannerId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Permanent removal of this graphic asset.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E68736",
      confirmButtonText: "Yes, delete it!",
      cancelButtonColor: "#64748b",
    });

    if (result.isConfirmed) {
      try {
        await BannerService.deleteBanner(bannerId);
        fetchBanners(); 
        Swal.fire({
          title: "Deleted!",
          text: "Banner removed successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
      } catch (err) {
        Swal.fire("Error", "Delete failed", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 md:py-20">
      <div className="max-w-7xl mx-auto">
        <HeaderActions 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          setCurrentPage={setCurrentPage} 
          navigate={navigate} 
        />

        <BannerTable 
          loading={loading} 
          banners={currentItems} 
          onEdit={(b) => { 
            setSelectedBanner(b); 
            setEditOpen(true); 
          }} 
          onDelete={deleteBanner} 
        />

        {totalPages > 1 && (
          <Pagination 
            totalPages={totalPages} 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
          />
        )}
      </div>

      {editOpen && (
        <EditBannerModal 
          banner={selectedBanner} 
          onClose={() => setEditOpen(false)} 
          refresh={fetchBanners} 
        />
      )}
    </div>
  );
};

export default BannerList;