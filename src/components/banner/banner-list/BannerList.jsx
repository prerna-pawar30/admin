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
 

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null); 
  const [pagination, setPagination] = useState({});
  // 1. Fetch data from API
const fetchBanners = async () => {
  try {
    setLoading(true);

    const res = await BannerService.getBanners(
      currentPage,
      12
    );

    if (res?.success) {

      setBanners(res.data?.banners || []);

      setPagination(
        res.data?.pagination || {}
      );
    }

  } catch (err) {
    console.error("Fetch banners failed", err);

  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchBanners();
}, [currentPage]);

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
    <div>
      <div>
        <HeaderActions 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          setCurrentPage={setCurrentPage} 
          navigate={navigate} 
        />

        <BannerTable 
          loading={loading} 
          banners={processedBanners} 
          onEdit={(b) => { 
            setSelectedBanner(b); 
            setEditOpen(true); 
          }} 
          onDelete={deleteBanner} 
        />

        {pagination?.totalPages > 1 && (
         <Pagination
            totalItems={pagination?.totalItems || 0}
            itemsPerPage={pagination?.limit || 12}
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