/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Swal from 'sweetalert2';
import { Layout, Eye, Edit3, Send, Image as ImageIcon, Tag, Hash, Loader2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BlogService } from '../../backend/ApiService';

const CreateBlog = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('split');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentMarkdown: '',
    category: '',
    tags: '',
    featuredImage: null,
    status: 'published'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
const handleSubmit = async (e, overrideStatus = null) => {
  if (e) e.preventDefault();

  // Validation
  if (!formData.title || !formData.contentMarkdown) {
    Swal.fire({
      icon: "warning",
      title: "Wait!",
      text: "Title and Content are required.",
      confirmButtonColor: "#E68736",
    });
    return;
  }

  setLoading(true);

  const targetStatus = overrideStatus || formData.status;

  try {
    // ==============================
    // CREATE FORMDATA
    // ==============================
    const formPayload = new FormData();

    // Basic Fields
    formPayload.append("title", formData.title);
    formPayload.append("description", formData.description);
    formPayload.append(
      "contentMarkdown",
      formData.contentMarkdown
    );
    formPayload.append("category", formData.category);
    formPayload.append("status", targetStatus);

    // Permission
    formPayload.append("permission", "blog.list.read");

    // Tags Array
    if (formData.tags) {
      formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .forEach((tag) => {
          formPayload.append("tags[]", tag);
        });
    }

    // Featured Image File
    if (formData.featuredImage) {
      formPayload.append(
        "featuredImage",
        formData.featuredImage
      );
    }

    // ==============================
    // API CALL
    // ==============================
    const res = await BlogService.createBlog(formPayload);

    // ==============================
    // SUCCESS
    // ==============================
    if (res.success) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text:
          targetStatus === "draft"
            ? "Draft saved successfully!"
            : "Blog published successfully!",
        confirmButtonColor: "#E68736",
      }).then(() => {
        navigate("/catalog/blogs");
      });
    }
  } catch (err) {
    console.error("BLOG CREATE ERROR:", err);

    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        err?.response?.data?.message ||
        "Failed to create blog.",
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen text-slate-800 bg-slate-50/50">
      {/* Dynamic Navigation Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-10 backdrop-blur-md bg-white/90 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div>
            <h1 className="text-base font-bold text-slate-800">New Content Node</h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">Compose and configure platform publication entries.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
      
          <button 
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={loading}
            className="flex items-center gap-2 bg-[#E68736] hover:bg-[#cf7a31] text-white px-5 py-2 rounded-xl font-bold text-xs transition-all shadow-sm shadow-orange-500/10 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Publish Now
          </button>
        </div>
      </div>

      <main className="max-w-[1500px] mx-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        
        {/* Left Column: Distraction-Free Canvas Workspace */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Header Metadata Meta Card */}
          <div className="bg-white rounded-2xl border border-orange-100 p-6 lg:p-8 space-y-3 shadow-sm">
            <input
              type="text"
              name="title"
              placeholder="Post Title Here..."
              className="w-full text-3xl font-black border-none p-0 focus:outline-none focus:ring-0 placeholder-slate-200 text-slate-800 bg-transparent tracking-tight"
              value={formData.title}
              onChange={handleChange}
            />
            <textarea
              name="description"
              placeholder="Add an executive entry summary description context layer..."
              className="w-full border-none p-0 focus:outline-none focus:ring-0 text-[13px] text-slate-400 font-medium resize-none bg-transparent"
              rows="2"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Interactive Split Layout Workspace Frame */}
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden flex flex-col">
            
            {/* Control Strip Strip Row */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Markdown Editor</span>
              <div className="flex p-0.5 bg-slate-200/60 rounded-xl border border-slate-200/20">
                <button 
                  onClick={() => setViewMode('edit')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all ${viewMode === 'edit' ? 'bg-white shadow-sm text-[#E68736]' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  WRITE
                </button>
                <button 
                  onClick={() => setViewMode('split')}
                  className={`hidden md:block px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all ${viewMode === 'split' ? 'bg-white shadow-sm text-[#E68736]' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  SPLIT
                </button>
                <button 
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all ${viewMode === 'preview' ? 'bg-white shadow-sm text-[#E68736]' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  PREVIEW
                </button>
              </div>
            </div>

            {/* Split Writing Engine Field Map Layout */}
            <div className={`grid ${viewMode === 'split' ? 'grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100' : 'grid-cols-1'} min-h-[550px]`}>
              
              {(viewMode === 'edit' || viewMode === 'split') && (
                <textarea
                  name="contentMarkdown"
                  className="p-6 lg:p-8 focus:outline-none focus:ring-0 border-none font-mono text-[13px] leading-relaxed text-slate-600 bg-slate-50/20 resize-none min-h-[450px]"
                  placeholder="Draft your thoughts using markdown syntax blocks..."
                  value={formData.contentMarkdown}
                  onChange={handleChange}
                />
              )}
              
              {(viewMode === 'preview' || viewMode === 'split') && (
                <div className="p-6 lg:p-8 prose prose-slate prose-sm max-w-none overflow-y-auto max-h-[650px] bg-white prose-headings:text-slate-800 prose-headings:font-bold prose-p:text-slate-500 prose-strong:text-slate-800">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {formData.contentMarkdown || "_Your post content rendering output target placeholder..._"}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Sidebar Configurations Dashboard */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-orange-100 p-6 space-y-5 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 pb-2.5 border-b border-slate-50">
              <Hash size={14} className="text-[#E68736]" /> Parameters
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Category</label>
                <input
                  type="text"
                  name="category"
                  placeholder="e.g. Surgical Supplies"
                  className="w-full text-xs font-bold rounded-xl border-slate-200/80 focus:border-[#E68736] focus:ring-[#E68736] bg-slate-50/40 px-3.5 py-2.5 text-slate-700 placeholder-slate-300 transition-all"
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Tags Matrix</label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-[11px] text-slate-300" size={13}/>
                  <input
                    type="text"
                    name="tags"
                    placeholder="implants, custom..."
                    className="w-full pl-9 text-xs font-bold rounded-xl border-slate-200/80 focus:border-[#E68736] focus:ring-[#E68736] bg-slate-50/40 pr-3.5 py-2.5 text-slate-700 placeholder-slate-300 transition-all"
                    value={formData.tags}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Cover Image Asset</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3.5 top-[11px] text-slate-300" size={13}/>
                  <input
  type="file"
  name="featuredImage"
  accept="image/*"
  className="w-full text-xs font-bold rounded-xl border-slate-200/80 
  focus:border-[#E68736] focus:ring-[#E68736] bg-slate-50/40 
  px-3.5 py-2.5 text-slate-700"
  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      featuredImage: e.target.files[0],
    }))
  }
/>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Visibility state</span>
                <select 
                  className="text-xs font-bold bg-orange-50/70 border border-orange-100 rounded-xl px-3 py-1.5 text-[#E68736] cursor-pointer focus:ring-0 focus:outline-none transition-all"
                  value={formData.status}
                  onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                >
                  <option value="published">Public</option>
                  <option value="draft">Draft State</option>
                </select>
              </div>
            </div>
          </div>

          {/* Context Layout Tips Element */}
          <div className="bg-orange-50/40 border border-orange-100/60 p-5 rounded-2xl shadow-sm shadow-orange-500/[0.01]">
            <h4 className="text-orange-800 text-[10px] font-black uppercase mb-1.5 tracking-widest">Editor Guidelines</h4>
            <p className="text-orange-700/80 text-[11px] leading-relaxed font-medium">
              Use classic markdown properties for headings and emphasis structures. Global static images link directly via clean destination endpoint source addresses inside the composition node layout body matrix.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateBlog;