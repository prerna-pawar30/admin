/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react"; // Added useRef
import apiClient from "../../../utils/apiClient";
import Swal from "sweetalert2";
import { API_ROUTES } from "../../../backend/ApiRoutes";

// Sub-components
import VideoCard from "./VideoCard";
import EditVideoModal from "./EditVideoModal";
import Loader from "../../ui/Loader";

export default function ProductVideoList() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editVideo, setEditVideo] = useState(null);
  
  // 1. Create a ref to track if the component has fetched data
  const initialized = useRef(false);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(API_ROUTES.VIDEO.GET_ALL);
      setVideos(res.data?.data?.videos );
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load videos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 2. Check the ref. Only fetch if initialized is false
    if (!initialized.current) {
      fetchVideos();
      initialized.current = true;
    }

    return () => {
      // Optional: Reset if you want it to fetch again on remount
      // initialized.current = false; 
    };
  }, []);

  const handleDelete = async (ytVideoId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This video will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await apiClient.delete(API_ROUTES.VIDEO.DELETE(ytVideoId), {
        data: { permission: "video.listing.delete" },
      });
      Swal.fire("Deleted!", "Video has been removed.", "success");
      fetchVideos();
    } catch (error) {
      Swal.fire("Error", "Failed to delete video", "error");
    }
  };

  return (
    <div className=" min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black mb-8 text-gray-800 uppercase tracking-tight leading-tight">
          Product Videos
        </h1>

        {loading ? (
          <Loader />
        ) : videos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl ">
            <p className="text-gray-500">No videos found. Add your first video above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((v) => (
              <VideoCard 
                key={v.ytVideoId} 
                video={v} 
                onEdit={() => setEditVideo(v)} 
                onDelete={() => handleDelete(v.ytVideoId)} 
              />
            ))}
          </div>
        )}
      </div>

      {editVideo && (
        <EditVideoModal 
          video={editVideo} 
          onClose={() => setEditVideo(null)} 
          onSuccess={fetchVideos} 
        />
      )}
    </div>
  );
}