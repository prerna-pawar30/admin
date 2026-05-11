import React, { useState } from "react";
import Swal from "sweetalert2";
import apiClient from "../../utils/apiClient";
import { API_ROUTES } from "../../backend/ApiRoutes"; // Adjust path as needed

export default function AddProductVideo({ productId }) {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoUrl || !title) {
      Swal.fire("Error", "Title and Video URL are required", "error");
      return;
    }

    try {
      setLoading(true);

      // Using the centralized API route
      await apiClient.post(API_ROUTES.VIDEO.ADD, {
        title,
        link: videoUrl,
        permission: "video.listing.create", // Ensure permission is included for backend authorization
        productId, 
      });

      Swal.fire({
        icon: "success",
        title: "Video Added Successfully",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });

      setTitle("");
      setVideoUrl("");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to add video",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-35 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl  max-w-md w-full border border-orange-200"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Add Product Video</h2>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Video Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Product Unboxing"
            className="w-full border border-orange-200 rounded-xl px-4 py-2 outline-none focus:border-[#E68736]"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">YouTube URL</label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=xxxx"
            className="w-full border border-orange-200 rounded-xl px-4 py-2 outline-none focus:border-[#E68736]"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#E68736] text-white py-3 rounded-xl font-bold hover:bg-white hover:text-[#E68736] border-2 border-transparent hover:border-[#E68736] transition-all disabled:bg-gray-400"
        >
          {loading ? "Saving..." : "Add Video"}
        </button>
      </form>
    </div>
  );
}