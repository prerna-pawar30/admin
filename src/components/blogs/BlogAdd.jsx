/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Swal from 'sweetalert2';
import { Layout, Eye, Edit3, Send, Image as ImageIcon, Tag, Hash, Loader2, ChevronLeft } from 'lucide-react';
import { BlogService } from '../../backend/ApiService';

const CreateBlog = () => {
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('split');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentMarkdown: '',
    category: '',
    tags: '',
    featuredImage: '',
    status: 'published'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.contentMarkdown) {
      Swal.fire({ icon: 'warning', title: 'Wait!', text: 'Title and Content are required.', confirmButtonColor: '#E68736' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        permission: "blog.list.read"
      };
      const res = await BlogService.createBlog(payload);
      if (res.success) {
        Swal.fire({ icon: 'success', title: 'Success', text: 'Blog published!', confirmButtonColor: '#E68736' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  text-[#111827]">
      {/* Sub-Header / Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        
        
        <div className="flex gap-3">
          <button className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
            Save Draft
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-[#E68736] hover:bg-[#cf7a31] text-white px-6 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm shadow-orange-200"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Publish Now
          </button>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Editor */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <input
              type="text"
              name="title"
              placeholder="Article Title"
              className="w-full text-3xl font-bold border-none focus:ring-0 placeholder-gray-300"
              value={formData.title}
              onChange={handleChange}
            />
            <textarea
              name="description"
              placeholder="Enter a brief summary..."
              className="w-full border-none focus:ring-0 text-gray-500 italic resize-none"
              rows="1"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50/50">
              <div className="flex p-1 bg-gray-200/50 rounded-md">
                <button 
                  onClick={() => setViewMode('edit')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${viewMode === 'edit' ? 'bg-white shadow-sm text-[#E68736]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  WRITE
                </button>
                <button 
                  onClick={() => setViewMode('split')}
                  className={`hidden md:block px-3 py-1 rounded text-xs font-bold transition-all ${viewMode === 'split' ? 'bg-white shadow-sm text-[#E68736]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  SPLIT
                </button>
                <button 
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${viewMode === 'preview' ? 'bg-white shadow-sm text-[#E68736]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  PREVIEW
                </button>
              </div>
            </div>

            <div className={`grid ${viewMode === 'split' ? 'grid-cols-2' : 'grid-cols-1'} min-h-[500px]`}>
              {(viewMode === 'edit' || viewMode === 'split') && (
                <textarea
                  name="contentMarkdown"
                  className="p-8 focus:ring-0 border-none font-mono text-sm text-gray-700 bg-gray-50/30 resize-none border-r border-gray-100"
                  placeholder="Tell your story using Markdown..."
                  value={formData.contentMarkdown}
                  onChange={handleChange}
                />
              )}
              {(viewMode === 'preview' || viewMode === 'split') && (
                <div className="p-8 prose prose-orange max-w-none overflow-y-auto max-h-[600px] bg-white">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {formData.contentMarkdown || "_Preview content here..._"}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Hash size={16} className="text-[#E68736]" /> Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase">Category</label>
                <input
                  type="text"
                  name="category"
                  placeholder="e.g. Technology"
                  className="mt-1 w-full text-sm rounded-lg border-gray-200 focus:border-[#E68736] focus:ring-[#E68736]"
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase">Tags</label>
                <div className="relative mt-1">
                  <Tag className="absolute left-3 top-2.5 text-gray-300" size={14}/>
                  <input
                    type="text"
                    name="tags"
                    placeholder="react, web..."
                    className="w-full pl-9 text-sm rounded-lg border-gray-200 focus:border-[#E68736] focus:ring-[#E68736]"
                    value={formData.tags}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase">Featured Image</label>
                <div className="relative mt-1">
                  <ImageIcon className="absolute left-3 top-3 text-gray-300" size={14}/>
                  <input
                    type="text"
                    name="featuredImage"
                    placeholder="Image URL"
                    className="w-full pl-9 text-sm rounded-lg border-gray-200 focus:border-[#E68736] focus:ring-[#E68736]"
                    value={formData.featuredImage}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">Visibility</span>
                <select 
                  className="text-xs font-bold bg-gray-50 border-none rounded-md text-[#E68736] focus:ring-0"
                  value={formData.status}
                  onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                >
                  <option value="published">Public</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-100 p-5 rounded-xl">
            <h4 className="text-orange-800 text-xs font-bold uppercase mb-2">Editor Tip</h4>
            <p className="text-orange-700 text-xs leading-relaxed">
              Use **bold** for emphasis and `###` for headings. Images can be added via URL in the markdown body.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateBlog;