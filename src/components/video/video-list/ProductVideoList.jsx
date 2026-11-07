/* eslint-disable no-unused-vars */
import { Video } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Hook for internal path routing
import apiClient from "../../../utils/apiClient";
import Swal from "sweetalert2";
import { API_ROUTES } from "../../../backend/ApiRoutes";
import { Film, Plus } from "lucide-react";

// Sub-components
import VideoCard from "./VideoCard";
import EditVideoModal from "./EditVideoModal";
import Pagination from "../../ui/Pagination"; 
import Loader from "../../ui/Loader";

export default function ProductVideoList() {
  const navigate = useNavigate(); // Initialize routing engine context
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editVideo, setEditVideo] = useState(null);
  
  // Pagination Parameters synchronized to state handlers
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 6; 

 const fetchVideos = async (pageNumber = 1) => {
  try {
    setLoading(true);
    
    const res = await apiClient.get(
      `${API_ROUTES.VIDEO.GET_ALL}?page=${pageNumber}&limit=${itemsPerPage}`
    );
    
    const fetchedVideos = res.data?.data?.videos || [];
    setVideos(fetchedVideos);
    
    // FIX: Look for totalItems instead of totalRecords
    if (res.data?.data?.pagination?.totalItems !== undefined) {
      setTotalItems(res.data.data.pagination.totalItems);
    } else {
      setTotalItems(fetchedVideos.length);
    }
  } catch (err) {
    console.error(err);
    Swal.fire({
      title: "Fetch Error",
      text: "Could not retrieve video catalog entries from the network server.",
      icon: "error",
      confirmButtonColor: "#E68736"
    });
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchVideos(currentPage);
  }, [currentPage]);

  const handleDelete = async (ytVideoId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This video file asset will be permanently deleted from database documents.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f43f5e",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await apiClient.delete(API_ROUTES.VIDEO.DELETE(ytVideoId), {
        data: { permission: "cms.video.delete" },
      });
      Swal.fire({
        title: "Deleted!",
        text: "Video asset has been dropped successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
      fetchVideos(currentPage);
    } catch (error) {
      Swal.fire("Error", "Failed to execute backend secure data deletion request.", "error");
    }
  };

  return (
    <div className="flex flex-col">
      <div className="w-full flex-grow flex flex-col justify-between">
        
        <div>
          {/* Main Module Component Title Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Video size={20} /></span>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Product Videos</h1>
                <p className="mt-1 text-sm text-slate-500">YouTube videos shown on product pages.</p>
              </div>
            </div>

            {/* Dynamic Interactive Action - Routing Button Link */}
            <button
              onClick={() => navigate("/marketing/videos/add")}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 transition-all self-start sm:self-auto"
            >
              <Plus size={16} strokeWidth={3} />
              <span>Add Video</span>
            </button>
          </div>

          {/* Core Grid Template System */}
          {loading ? (
            <div className="flex justify-center items-center py-32">
              <Loader />
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 max-w-md mx-auto p-6 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#E68736] flex items-center justify-center mx-auto mb-4">
                <Film size={24} />
              </div>
              <h3 className="font-bold text-slate-700 text-base">No Videos Added</h3>
              <p className="text-slate-400 text-xs mt-1 mb-5">
                There are no videos in your directory. Get started by inserting your first configuration link.
              </p>
              <button
                onClick={() => navigate("/marketing/videos/add")}
                className="inline-flex items-center gap-1.5 bg-[#E68736] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#cf6e2e] transition-all"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>Create Entry Now</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {videos.map((v) => (
                <div key={v.ytVideoId} className="flex flex-col h-full">
                  <VideoCard 
                    video={v} 
                    onEdit={() => setEditVideo(v)} 
                    onDelete={() => handleDelete(v.ytVideoId)} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Pagination Footer Attachment Module */}
        {!loading && totalItems > 0 && (
          <div className="mt-12 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <Pagination
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </div>

      {editVideo && (
        <EditVideoModal 
          video={editVideo} 
          onClose={() => setEditVideo(null)} 
          onSuccess={() => fetchVideos(currentPage)} 
        />
      )}
    </div>
  );
}