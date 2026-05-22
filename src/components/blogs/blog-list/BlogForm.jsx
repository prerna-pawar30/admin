import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Image as ImageIcon, Tag, Hash, Loader2, FileText, X, Eye, Columns, Edit3, Globe, Lock } from 'lucide-react';

const BlogForm = ({ initialData, onSubmit = () => {}, loading, buttonText = "Publish Now" }) => {
  const [viewMode, setViewMode] = useState('split');
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentMarkdown: '',
    category: '',
    tags: '',
    featuredImage: null,
    status: 'published'
  });

  // Sync initialData (for Edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags
      });
      if (initialData.featuredImage && typeof initialData.featuredImage === 'string') {
        setImagePreview(initialData.featuredImage);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, featuredImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, featuredImage: null }));
    setImagePreview(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 text-[#111827] antialiased">
      {/* Top sticky action header bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-[#E68736]/10 p-2 rounded-lg">
            <FileText size={18} className="text-[#E68736]" />
          </div>
          <span className="text-sm font-semibold text-gray-500">
            {initialData ? 'Editing Draft' : 'New Article'}
          </span>
        </div>
        
        <button 
          onClick={handleFormSubmit}
          disabled={loading}
          className="flex items-center gap-2 bg-[#E68736] hover:bg-[#cf7a31] disabled:bg-gray-300 text-white px-5 py-2 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow active:scale-[0.98]"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {buttonText}
        </button>
      </header>

      {/* Main Form Layout Structure */}
      <main className="max-w-[1440px] mx-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Text Canvas & Markdown Sandbox Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Header Canvas (Title & Description Input) */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-8 space-y-4 shadow-sm focus-within:border-gray-300 transition-all">
            <input
              type="text" 
              name="title" 
              placeholder="Untitled Article"
              className="w-full text-4xl font-extrabold border-none p-0 focus:ring-0 placeholder-gray-200 tracking-tight text-gray-900"
              value={formData.title} 
              onChange={handleChange}
            />
            <textarea
              name="description" 
              placeholder="Write a short, engaging description introduction..."
              className="w-full border-none p-0 focus:ring-0 text-base text-gray-500 placeholder-gray-300 italic resize-none leading-relaxed"
              rows="2" 
              value={formData.description} 
              onChange={handleChange}
            />
          </div>

          {/* Markdown Split Layout Editor Module */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col min-h-[650px]">
            {/* Split controls bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50/50">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Content Sandbox</span>
              <div className="flex p-1 bg-gray-200/60 rounded-xl gap-0.5">
                {[
                  { id: 'edit', label: 'Write', icon: <Edit3 size={13} /> },
                  { id: 'split', label: 'Split View', icon: <Columns size={13} /> },
                  { id: 'preview', label: 'Preview', icon: <Eye size={13} /> }
                ].map((mode) => (
                  <button 
                    key={mode.id} 
                    type="button"
                    onClick={() => setViewMode(mode.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      viewMode === mode.id 
                        ? 'bg-white shadow-sm text-[#E68736]' 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {mode.icon}
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Split Content View Panels */}
            <div className="grid flex-1 divide-x divide-gray-100 grid-cols-1 md:grid-cols-2 relative">
              {/* Write Mode Component */}
              {(viewMode === 'edit' || viewMode === 'split') && (
                <textarea
                  name="contentMarkdown" 
                  value={formData.contentMarkdown} 
                  onChange={handleChange}
                  className={`p-8 focus:ring-0 border-none font-mono text-[14px] text-gray-700 bg-gray-50/20 resize-none h-full outline-none leading-relaxed min-h-[500px] ${
                    viewMode === 'edit' ? 'col-span-2' : ''
                  }`}
                  placeholder="Tell your story using Markdown syntax styling..."
                />
              )}
              
              {/* Rendered Preview Window Component */}
              {(viewMode === 'preview' || viewMode === 'split') && (
                <div className={`p-8 prose prose-orange max-w-none overflow-y-auto max-h-[650px] bg-white ${
                  viewMode === 'preview' ? 'col-span-2' : ''
                }`}>
                  {formData.contentMarkdown ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {formData.contentMarkdown}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-gray-300 italic">Your markdown preview text architecture will render live right here...</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Configuration Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-6 shadow-sm sticky top-[84px]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-gray-100">
              <Hash size={14} className="text-[#E68736]" /> Settings & Metadata
            </h3>
            
            <div className="space-y-5">
              {/* Category Dropdown Container */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Category</label>
                <input 
                  type="text" 
                  name="category" 
                  placeholder="e.g., Technology"
                  className="w-full text-sm rounded-xl border-gray-200 focus:border-[#E68736] focus:ring focus:ring-[#E68736]/10 transition-shadow bg-gray-50/30 py-2.5" 
                  value={formData.category} 
                  onChange={handleChange} 
                />
              </div>

              {/* Tag System Field Container */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Tags</label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-3.5 text-gray-400" size={14}/>
                  <input 
                    type="text" 
                    name="tags" 
                    placeholder="react, webdev, architecture"
                    className="w-full pl-10 text-sm rounded-xl border-gray-200 focus:border-[#E68736] focus:ring focus:ring-[#E68736]/10 transition-shadow bg-gray-50/30 py-2.5" 
                    value={formData.tags} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
              
              {/* Custom Uploader Component Container */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Featured Cover Image
                </label>

                {imagePreview ? (
                  <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-inner">
                    <img
                      src={imagePreview}
                      alt="Featured Preview"
                      className="w-full h-44 object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={removeImage}
                        className="bg-white/90 hover:bg-white text-red-600 p-2.5 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center gap-1.5 text-xs font-semibold"
                      >
                        <X size={15} /> Remove Cover
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-gray-200 hover:border-[#E68736] bg-gray-50/30 hover:bg-[#E68736]/5 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group text-center">
                    <div className="p-2.5 rounded-full bg-white shadow-sm border border-gray-100 text-gray-400 group-hover:text-[#E68736] group-hover:border-[#E68736]/20 transition-all">
                      <ImageIcon size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-gray-600 block">Click to upload file</span>
                      <span className="text-[10px] text-gray-400 block">PNG, JPG, or WEBP up to 5MB</span>
                    </div>
                    <input
                      type="file"
                      name="featuredImage"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              {/* Status Visibility Toggle Panel */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  {formData.status === 'published' ? <Globe size={14} className="text-emerald-500" /> : <Lock size={14} className="text-amber-500" />}
                  <span className="text-xs font-semibold text-gray-600">Visibility Status</span>
                </div>
                <select 
                  className="text-xs font-bold text-[#E68736] bg-transparent border-none focus:ring-0 cursor-pointer pr-8 py-1 rounded-lg hover:bg-gray-50 transition-colors" 
                  value={formData.status} 
                  onChange={(e) => setFormData(p => ({...p, status: e.target.value}))}
                >
                  <option value="published">Public Global</option>
                  <option value="draft">Private Draft</option>
                </select>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default BlogForm;