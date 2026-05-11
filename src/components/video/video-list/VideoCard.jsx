import React from "react";
import { HiPencil, HiTrash } from "react-icons/hi";

const getYoutubeId = (url) => {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const VideoCard = ({ video, onEdit, onDelete }) => (
  <div className="bg-white rounded-2xl  transition-shadow overflow-hidden border border-orange-200 group">
    <div className="relative pt-[56.25%] bg-black">
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube.com/embed/${getYoutubeId(video.link)}`}
        title={video.title}
        allowFullScreen
      />
    </div>

    <div className="p-4">
      <h3 className="font-bold text-gray-800 truncate group-hover:text-[#E68736] transition-colors">
        {video.title || "Untitled Video"}
      </h3>
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onEdit}
          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
        >
          <HiPencil size={20} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
        >
          <HiTrash size={20} />
        </button>
      </div>
    </div>
  </div>
);

export default VideoCard;