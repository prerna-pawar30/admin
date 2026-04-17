/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import apiClient from "../../../utils/apiClient";
import Swal from "sweetalert2";
import { API_ROUTES } from "../../../backend/ApiRoutes";

const EditVideoModal = ({ video, onClose, onSuccess }) => {
  const [title, setTitle] = useState(video.title || "");
  const [url, setUrl] = useState(video.link || "");
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!title || !url) {
      Swal.fire("Error", "Title and URL are required", "error");
      return;
    }

    try {
      setUpdating(true);
      await apiClient.put(API_ROUTES.VIDEO.UPDATE(video.ytVideoId), {
        title: title,
        link: url,
        permission: "video.listing.update" // Ensure permission is included for backend authorization,
      });

      Swal.fire({
        icon: "success",
        title: "Updated Successfully",
        toast: true,
        position: "top-end",
        timer: 1500,
        showConfirmButton: false,
      });

      onSuccess();
      onClose();
    } catch (error) {
      Swal.fire("Error", "Update failed", "error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-3xl w-full border border-orange-200 max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-black mb-6 text-gray-800">Edit Video Details</h2>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Title</label>
            <input
              className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-semibold"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">YouTube URL</label>
            <input
              className="w-full border border-orange-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-semibold"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={updating}
            className="flex-1 bg-[#E68736] text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {updating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditVideoModal;