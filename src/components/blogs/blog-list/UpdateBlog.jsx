import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Swal from 'sweetalert2';
import { Send, Image as ImageIcon, Tag, Hash, Loader2, ChevronLeft, RefreshCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { BlogService } from '../../../backend/ApiService';

const UpdateBlog = () => {
  const navigate = useNavigate();
  const { blogId } = useParams();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [viewMode, setViewMode] = useState('split');

  // Tracks the existing S3 URL (for preview + fallback)
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  // Tracks the new File picked by user (null = user hasn't changed image)
  const [newImageFile, setNewImageFile] = useState(null);
  // Preview src shown in UI
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentMarkdown: '',
    category: '',
    tags: '',
    status: '',
  });

  // ─── Fetch existing blog ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchBlog = async () => {
      setFetching(true);
      try {
        const data = await BlogService.getBlogById(blogId, 'cms.blog.read');
        if (data) {
          setFormData({
            title: data.title || '',
            description: data.description || '',
            contentMarkdown: data.contentMarkdown || '',
            category: data.category || '',
            tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
            status: data.status || 'published',
          });
          if (data.featuredImage) {
            setExistingImageUrl(data.featuredImage);
            setImagePreviewUrl(data.featuredImage);
          }
        }
      } catch (err) {
        console.error('Fetch blog error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load blog data.',
          confirmButtonColor: '#E68736',
        }).then(() => navigate('/catalog/blogs'));
      } finally {
        setFetching(false);
      }
    };
    if (blogId) fetchBlog();
  }, [blogId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // User picks a new image file
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file)); // show local preview
  };

  // Remove newly selected image, revert to existing
  const handleRevertImage = () => {
    setNewImageFile(null);
    setImagePreviewUrl(existingImageUrl);
  };

  // ─── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e, overrideStatus = null) => {
    if (e) e.preventDefault();

    if (!formData.title || !formData.contentMarkdown) {
      Swal.fire({
        icon: 'warning',
        title: 'Wait!',
        text: 'Title and Content are required.',
        confirmButtonColor: '#E68736',
      });
      return;
    }

    setLoading(true);
    // Uses the override parameter if clicked directly, otherwise relies on the sidebar state selection
    const targetStatus = overrideStatus || formData.status;

    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('description', formData.description);
      formPayload.append('contentMarkdown', formData.contentMarkdown);
      formPayload.append('category', formData.category);
      formPayload.append('status', targetStatus);
      formPayload.append('permission', 'cms.blog.update');

      // Tags
      if (formData.tags) {
        formData.tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
          .forEach(tag => formPayload.append('tags[]', tag));
      }

      // IMAGE LOGIC:
      if (newImageFile) {
        formPayload.append('featuredImage', newImageFile);
      } else if (existingImageUrl) {
        formPayload.append('featuredImage', existingImageUrl);
      }

      const res = await BlogService.updateBlog(blogId, formPayload);

      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: targetStatus === 'draft' ? 'Draft saved successfully!' : 'Blog updated and published!',
          confirmButtonColor: '#E68736',
        }).then(() => navigate('/catalog/blogs'));
      }
    } catch (err) {
      console.error('BLOG UPDATE ERROR:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.response?.data?.message || 'Failed to update blog.',
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── Loading ──────────────────────────────────────────────────────────────────
  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
            <Loader2 size={20} className="animate-spin text-[#E68736]" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Loading content node...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800 bg-slate-50/50">
      {/* Sticky Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-10 backdrop-blur-md bg-white/90 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/catalog/blogs')}
            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center transition-all"
          >
            <ChevronLeft size={14} className="text-slate-500" />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-800">Edit Content Node</h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">Modify and republish your platform publication entry.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Action Header Buttons now respect the form selection by defaulting to handleSubmit(e) */}
          <button
            onClick={(e) => handleSubmit(e)}
            disabled={loading}
            className="flex items-center gap-2 bg-[#E68736] hover:bg-[#cf7a31] text-white px-5 py-2 rounded-xl font-bold text-xs transition-all shadow-sm shadow-orange-500/10 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Save Changes ({formData.status === 'draft' ? 'Draft' : 'Publish'})
          </button>
        </div>
      </div>

      <main className="max-w-[1500px] mx-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Left: Editor */}
        <div className="lg:col-span-3 space-y-6">
          {/* Title & Description */}
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

          {/* Markdown Editor */}
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Markdown Editor</span>
              <div className="flex p-0.5 bg-slate-200/60 rounded-xl border border-slate-200/20">
                {['edit', 'split', 'preview'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`${mode === 'split' ? 'hidden md:block' : ''} px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all ${
                      viewMode === mode ? 'bg-white shadow-sm text-[#E68736]' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {mode.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

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
                    {formData.contentMarkdown || '_Your post content rendering output target placeholder..._'}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-orange-100 p-6 space-y-5 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 pb-2.5 border-b border-slate-50">
              <Hash size={14} className="text-[#E68736]" /> Parameters
            </h3>

            <div className="space-y-4">
              {/* Category */}
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

              {/* Tags */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Tags Matrix</label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-[11px] text-slate-300" size={13} />
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

              {/* Cover Image */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Cover Image Asset</label>
                {imagePreviewUrl && (
                  <div className="mb-2.5 relative">
                    <img
                      src={imagePreviewUrl}
                      alt="Cover preview"
                      className="w-full h-24 object-cover rounded-xl border border-orange-100"
                    />
                    <span className={`absolute bottom-1.5 left-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md backdrop-blur-sm ${
                      newImageFile ? 'bg-[#E68736]/80 text-white' : 'bg-black/40 text-white'
                    }`}>
                      {newImageFile ? 'New' : 'Current'}
                    </span>
                    {newImageFile && (
                      <button
                        type="button"
                        onClick={handleRevertImage}
                        className="absolute top-1.5 right-1.5 text-[9px] font-black bg-red-500/80 text-white px-2 py-0.5 rounded-md"
                      >
                        Revert
                      </button>
                    )}
                  </div>
                )}

                <div className="relative">
                  <ImageIcon className="absolute left-3.5 top-[11px] text-slate-300" size={13} />
                  <input
                    type="file"
                    name="featuredImage"
                    accept="image/*"
                    className="w-full text-xs font-bold rounded-xl border border-slate-200/80 focus:border-[#E68736] focus:ring-[#E68736] bg-slate-50/40 px-3.5 py-2.5 text-slate-700 pl-9"
                    onChange={handleImageChange}
                  />
                </div>
                <p className="text-[9px] text-slate-400 font-medium mt-1.5">
                  {newImageFile ? 'New image will be uploaded on save.' : 'Leave empty to keep the current image.'}
                </p>
              </div>

              {/* Visibility State */}
              <div className="pt-4 border-t border-slate-50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Visibility state
                </span>
                <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/60 gap-1">
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, status: 'draft' }))}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      formData.status === 'draft'
                        ? 'bg-white border border-slate-200 text-slate-600 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${formData.status === 'draft' ? 'bg-slate-500' : 'bg-slate-300'}`} />
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, status: 'published' }))}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      formData.status === 'published'
                        ? 'bg-[#E68736] text-white shadow-sm shadow-orange-500/20'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${formData.status === 'published' ? 'bg-white' : 'bg-slate-300'}`} />
                    Published
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-orange-50/40 border border-orange-100/60 p-5 rounded-2xl shadow-sm shadow-orange-500/[0.01]">
            <h4 className="text-orange-800 text-[10px] font-black uppercase mb-1.5 tracking-widest">Editor Guidelines</h4>
            <p className="text-orange-700/80 text-[11px] leading-relaxed font-medium">
              Upload a new image to replace the cover. Leave the field empty to keep the existing one — it will be preserved automatically.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UpdateBlog;