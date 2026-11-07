import PageHeader from "../ui/PageHeader";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Hook for routing redirection
import Swal from "sweetalert2";
import apiClient from "../../utils/apiClient";
import { API_ROUTES } from "../../backend/ApiRoutes"; // Adjust path as needed
import { Video } from "lucide-react";

export default function AddProductVideo({ productId }) {
  const navigate = useNavigate(); // Initialize routing engine context
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClear = () => {
    setTitle("");
    setVideoUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !videoUrl.trim()) {
      Swal.fire("Validation Error", "Both Title and Video URL fields are required.", "error");
      return;
    }

    try {
      setLoading(true);

      // Using the centralized API route
      await apiClient.post(API_ROUTES.VIDEO.ADD, {
        title: title.trim(),
        link: videoUrl.trim(),
        permission: "cms.video.create", // Backend authorization scope key
        productId, 
      });

      // Show toast alert confirmation 
      Swal.fire({
        icon: "success",
        title: "Video Added Successfully",
        toast: true,
        position: "top-end",
        timer: 1500,
        showConfirmButton: false,
      });

      handleClear();

      // REDIRECTION FIX: Navigate user back to video management list interface
      navigate("/marketing/videos");

    } catch (error) {
      Swal.fire(
        "Action Failed",
        error.response?.data?.message || "Failed to catalog video asset entry.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader icon={Video} title="Add Video" description="Add a YouTube video to show on the website." />
      <form
        onSubmit={handleSubmit}
        className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
      >
        <div className="space-y-5 p-5 sm:p-7">
          
          {/* Title Field Input Block */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600">
              Video title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Product Unboxing & Setup Overview"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:border-[#E68736] focus:ring-4 focus:ring-orange-500/5 bg-slate-50 outline-none text-sm font-semibold text-slate-700 placeholder-slate-400 transition-all"
              required
              disabled={loading}
            />
          </div>

          {/* YouTube URL Field Input Block */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600">
              YouTube URL
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=xxxxxx"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:border-[#E68736] focus:ring-4 focus:ring-orange-500/5 bg-slate-50 outline-none text-sm font-semibold text-slate-700 placeholder-slate-400 transition-all"
              required
              disabled={loading}
            />
          </div>

        </div>

        {/* Footer Actions Controls Block Row */}
        <div className="flex items-center gap-4 px-8 py-5 bg-slate-50/80 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate("/marketing/videos")} // Clicking Cancel directly returns users to the list
            disabled={loading}
            className="flex-1 bg-white border border-slate-200 text-slate-500 py-3 rounded-xl text-sm font-bold hover:bg-slate-100 active:scale-[0.99] transition-all disabled:opacity-40"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#E68736] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#cf6e2e] active:scale-[0.99] transition-all shadow-md shadow-orange-100 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {loading ? "Saving Records..." : "Save Video"}
          </button>
        </div>

      </form>
    </div>
  );
}