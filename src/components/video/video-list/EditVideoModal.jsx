/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import apiClient from "../../../utils/apiClient";
import Swal from "sweetalert2";
import { API_ROUTES } from "../../../backend/ApiRoutes";
import { X } from "lucide-react";

const EditVideoModal = ({ video, onClose, onSuccess }) => {
  const [title, setTitle] = useState(video.title || "");
  const [url, setUrl] = useState(video.link || "");
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!title.trim() || !url.trim()) {
      Swal.fire("Validation Error", "All fields require valid text entries before updating storage states.", "error");
      return;
    }

    try {
      setUpdating(true);
      await apiClient.put(API_ROUTES.VIDEO.UPDATE(video.ytVideoId), {
        title: title,
        link: url,
        permission: "video.listing.update"
      });

      Swal.fire({
        icon: "success",
        title: "Saved Successfully",
        toast: true,
        position: "top-end",
        timer: 1500,
        showConfirmButton: false,
      });

      onSuccess();
      onClose();
    } catch (error) {
      Swal.fire("Update Exception", "Cloud data storage synchronization encountered an issue.", "error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-2xl w-full max-w-md border border-slate-100 shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Modal Top Brand Indicator Accent Strip */}
        <div className="h-1.5 w-full bg-[#E68736]" />

        {/* Header Module Row */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-50">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
              Edit Video Details
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">Update entry configuration details</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Input Parameters Container Workspace */}
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Video Title Display Name
            </label>
            <input
              type="text"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:bg-white focus:border-[#E68736] focus:ring-4 focus:ring-orange-500/5 bg-slate-50 outline-none text-sm font-semibold text-slate-700 transition-all"
              placeholder="Enter context catalog descriptor title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Verified YouTube Stream URL
            </label>
            <input
              type="url"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:bg-white focus:border-[#E68736] focus:ring-4 focus:ring-orange-500/5 bg-slate-50 outline-none text-sm font-semibold text-slate-700 transition-all"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>

        {/* Footer Actions Controls Operations Block */}
        <div className="flex items-center gap-3 p-6 pt-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={updating}
            className="flex-1 bg-white border border-slate-200 text-slate-500 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel Actions
          </button>
          <button
            onClick={handleUpdate}
            disabled={updating || !title.trim() || !url.trim()}
            className="flex-1 bg-[#E68736] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#cf6e2e] active:scale-[0.99] transition-all shadow-md shadow-orange-100 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {updating ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditVideoModal;