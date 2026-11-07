/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import apiClient from "../../../utils/apiClient";
import Swal from "sweetalert2";
import { API_ROUTES } from "../../../backend/ApiRoutes";
import { Video } from "lucide-react";
import { Dialog, DialogBody, DialogButton, DialogFooter, DialogHeader } from "../../ui/Dialog";

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
        permission: "cms.video.update", // Backend authorization scope key
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
    <Dialog open onClose={onClose} size="md" label="Edit video">
      <DialogHeader icon={Video} title="Edit video" subtitle="Update the title and YouTube link" onClose={onClose} />
      <DialogBody className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Title</label>
          <input type="text" className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10" placeholder="Video title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">YouTube URL</label>
          <input
            type="url"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
      </DialogBody>
      <DialogFooter>
        <DialogButton tone="ghost" onClick={onClose} disabled={updating}>
          Cancel
        </DialogButton>
        <DialogButton tone="primary" onClick={handleUpdate} isLoading={updating} disabled={!title.trim() || !url.trim()} className="flex-1 sm:flex-none">
          {updating ? "Saving..." : "Save changes"}
        </DialogButton>
      </DialogFooter>
    </Dialog>
  );
};

export default EditVideoModal;
