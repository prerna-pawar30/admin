import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Image as ImageIcon, Tag, Hash, Loader2, FileText } from 'lucide-react';

const BlogForm = ({ initialData, onSubmit, loading, buttonText = "Publish Now" }) => {
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

  // Sync initialData (for Edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen text-[#111827]">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-end gap-3">
        <button className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          Save Draft
        </button>
        <button 
          onClick={handleFormSubmit}
          disabled={loading}
          className="flex items-center gap-2 bg-[#E68736] hover:bg-[#cf7a31] text-white px-6 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {buttonText}
        </button>
      </div>

      <main className="max-w-[1400px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <input
              type="text" name="title" placeholder="Article Title"
              className="w-full text-3xl font-bold border-none focus:ring-0 placeholder-gray-300"
              value={formData.title} onChange={handleChange}
            />
            <textarea
              name="description" placeholder="Enter a brief summary..."
              className="w-full border-none focus:ring-0 text-gray-500 italic resize-none"
              rows="1" value={formData.description} onChange={handleChange}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50/50">
              <div className="flex p-1 bg-gray-200/50 rounded-md">
                {['edit', 'split', 'preview'].map((mode) => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 rounded text-xs font-bold uppercase transition-all ${viewMode === mode ? 'bg-white shadow-sm text-[#E68736]' : 'text-gray-500'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            <div className={`grid ${viewMode === 'split' ? 'grid-cols-2' : 'grid-cols-1'} min-h-[500px]`}>
              {(viewMode === 'edit' || viewMode === 'split') && (
                <textarea
                  name="contentMarkdown" value={formData.contentMarkdown} onChange={handleChange}
                  className="p-8 focus:ring-0 border-none font-mono text-sm text-gray-700 bg-gray-50/30 resize-none border-r border-gray-100"
                  placeholder="Tell your story using Markdown..."
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

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Hash size={16} className="text-[#E68736]" /> Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase">Category</label>
                <input type="text" name="category" className="mt-1 w-full text-sm rounded-lg border-gray-200" value={formData.category} onChange={handleChange} />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase">Tags</label>
                <div className="relative mt-1">
                  <Tag className="absolute left-3 top-2.5 text-gray-300" size={14}/>
                  <input type="text" name="tags" className="w-full pl-9 text-sm rounded-lg border-gray-200" value={formData.tags} onChange={handleChange} />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase">Featured Image</label>
                <div className="relative mt-1">
                  <ImageIcon className="absolute left-3 top-3 text-gray-300" size={14}/>
                  <input type="text" name="featuredImage" className="w-full pl-9 text-sm rounded-lg border-gray-200" value={formData.featuredImage} onChange={handleChange} />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">Visibility</span>
                <select className="text-xs font-bold text-[#E68736] bg-transparent border-none focus:ring-0" 
                        value={formData.status} onChange={(e) => setFormData(p => ({...p, status: e.target.value}))}>
                  <option value="published">Public</option>
                  <option value="draft">Draft</option>
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