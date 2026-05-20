import React from "react";
import { Edit3, Trash2, Play } from "lucide-react";

const getYoutubeId = (url) => {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const VideoCard = ({ video, onEdit, onDelete }) => {
  const videoId = getYoutubeId(video.link);
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` 
    : "/api/placeholder/400/225";

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-orange-200 shadow-xl shadow-slate-200/40 group flex flex-col h-full transition-all duration-300 hover:-translate-y-1">
      
      {/* Media Cover Frame */}
      <div className="relative aspect-video bg-slate-900 overflow-hidden flex-shrink-0">
        <img 
          src={thumbnailUrl} 
          alt={video.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
          onError={(e) => {
            e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
        
        <a 
          href={video.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/95 text-[#E68736] shadow-md transform transition-all duration-300 group-hover:scale-110 group-hover:bg-[#E68736] group-hover:text-white backdrop-blur-xs">
            <Play size={18} className="ml-0.5" fill="currentColor" />
          </div>
        </a>
      </div>

      {/* Content Meta Space */}
      <div className="p-5 flex flex-col flex-grow justify-start bg-white space-y-1">
        <span className="text-[10px] uppercase tracking-widest text-[#E68736] font-black block flex-shrink-0">
          YouTube Asset
        </span>
        
        {/* Row Layout: Places Title on Left and Action Buttons immediately on Right */}
        <div className="flex items-start justify-between gap-3 w-full">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug line-clamp-2 flex-grow">
            {video.title || "Untitled Video Reference"}
          </h3>
          
          {/* Action Controls Side-Panel (Aligned Right) */}
          <div className="flex items-center gap-0.5 bg-slate-50/80 p-1 rounded-xl border border-slate-100 flex-shrink-0">
            <button
              onClick={onEdit}
              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg transition-all"
              title="Edit Asset Details"
            >
              <Edit3 size={15} strokeWidth={2.5} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all"
              title="Delete Asset From Server"
            >
              <Trash2 size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default VideoCard;