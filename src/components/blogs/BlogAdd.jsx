/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { BlogService } from '../../backend/ApiService';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { 
  FiUploadCloud, FiPlus, FiX, FiCheckCircle, 
  FiTrash2, FiType, FiImage, FiList, FiAlignLeft 
} from 'react-icons/fi';

const MySwal = withReactContent(Swal);

const CreateBlog = () => {
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [seoKeywordInput, setSeoKeywordInput] = useState('');
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    status: 'published',
    featured: 'true',
    tags: [],
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: [],
      canonicalUrl: '',
    },
    content: [
      { id: '1', type: 'heading', text: '', level: 2, order: 0 }
    ],
  });

  // --- Basic Input Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSeoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, [name]: value }
    }));
  };

  // --- Dynamic Content Logic ---
  const addContentBlock = (type) => {
    const order = formData.content.length;
    let newBlock = { id: Date.now().toString(), type, order };

    if (type === 'heading') newBlock = { ...newBlock, text: '', level: 2 };
    else if (type === 'paragraph') newBlock = { ...newBlock, text: '' };
    else if (type === 'list') newBlock = { ...newBlock, listItems: [''] };
    else if (type === 'image') newBlock = { ...newBlock, imageFileIndex: null, file: null, preview: null };

    setFormData({ ...formData, content: [...formData.content, newBlock] });
  };

  const removeContentBlock = (id) => {
    setFormData({ 
      ...formData, 
      content: formData.content.filter(block => block.id !== id).map((b, i) => ({...b, order: i})) 
    });
  };

  const updateContentBlock = (id, updates) => {
    setFormData({
      ...formData,
      content: formData.content.map(block => block.id === id ? { ...block, ...updates } : block)
    });
  };

  // --- List & Image Logic ---
  const handleListChange = (id, index, value) => {
    const block = formData.content.find(b => b.id === id);
    const newList = [...block.listItems];
    newList[index] = value;
    updateContentBlock(id, { listItems: newList });
  };

  const addListItem = (id) => {
    const block = formData.content.find(b => b.id === id);
    updateContentBlock(id, { listItems: [...block.listItems, ''] });
  };

  const removeListItem = (blockId, itemIndex) => {
    const block = formData.content.find(b => b.id === blockId);
    const newList = block.listItems.filter((_, idx) => idx !== itemIndex);
    updateContentBlock(blockId, { listItems: newList });
  };

  const handleContentImageChange = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      updateContentBlock(id, { 
        file: file, 
        preview: URL.createObjectURL(file) 
      });
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerImage(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  // --- Tags & SEO Keywords ---
  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const removeTag = (indexToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== indexToRemove) });
  };

  const addSeoKeyword = (e) => {
    if (e.key === 'Enter' && seoKeywordInput.trim()) {
      e.preventDefault();
      const newKeywords = [...formData.seo.keywords, seoKeywordInput.trim()];
      setFormData(prev => ({
        ...prev,
        seo: { ...prev.seo, keywords: newKeywords }
      }));
      setSeoKeywordInput('');
    }
  };

  // --- Action Handlers ---
  const handleDiscard = () => {
    MySwal.fire({
      title: 'Are you sure?',
      text: "You will lose all unsaved changes!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E68736',
      cancelButtonColor: '#000',
      confirmButtonText: 'Yes, discard it!'
    }).then((result) => {
      if (result.isConfirmed) window.location.reload();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('shortDescription', formData.shortDescription);
      data.append('status', formData.status);
      data.append('featured', formData.featured);
      data.append('permission', 'blog.post.create');
      data.append('tags', JSON.stringify(formData.tags));
      data.append('seo', JSON.stringify(formData.seo));

      let imageCounter = 0;
      const finalContent = formData.content.map(({ id, file, preview, ...rest }) => {
        if (rest.type === 'image') {
          return { ...rest, imageFileIndex: imageCounter++ };
        }
        return rest;
      });

      data.append('content', JSON.stringify(finalContent));
      if (bannerImage) data.append('bannerImage', bannerImage);

      formData.content.forEach((block) => {
        if (block.type === 'image' && block.file) {
          data.append('contentImages', block.file);
        }
      });

      const response = await BlogService.createBlog(data);
      if (response.success) {
        MySwal.fire({
          title: 'Success!',
          text: 'Blog published successfully!',
          icon: 'success',
          confirmButtonColor: '#E68736',
        });
      }
    } catch (error) {
      MySwal.fire({
        title: 'Error!',
        text: error.message || 'Failed to create blog',
        icon: 'error',
        confirmButtonColor: '#000',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-black p-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Create New Post</h2>
            <p className="text-gray-400 text-sm">Fill in the details to publish a new dental blog.</p>
          </div>
          <FiCheckCircle className="text-[#E68736] text-3xl" />
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Editor Area */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Blog Title</label>
                  <input
                    type="text"
                    name="title"
                    className="w-full p-3 border-2 border-gray-100 rounded-lg focus:border-[#E68736] outline-none transition-all font-medium"
                    placeholder="Enter blog title..."
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Short Description</label>
                  <textarea
                    name="shortDescription"
                    className="w-full p-3 border-2 border-gray-100 rounded-lg focus:border-[#E68736] outline-none transition-all"
                    rows="2"
                    placeholder="Brief summary..."
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Dynamic Content Sections */}
              <div className="space-y-6">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">Content Sections</label>
                
                {formData.content.map((block) => (
                  <div key={block.id} className="relative group p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-gray-200 transition-all shadow-sm">
                    <button 
                      type="button" 
                      onClick={() => removeContentBlock(block.id)}
                      className="absolute right-4 top-4 text-gray-300 hover:text-red-500 transition-colors p-1"
                    >
                      <FiTrash2 size={18} />
                    </button>

                    {block.type === 'heading' && (
                      <div className="flex gap-6 items-end">
                        <div className="flex flex-col">
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-2">Size</label>
                          <select 
                            className="bg-gray-50 text-sm font-bold p-2 px-3 rounded-lg border border-gray-200 focus:ring-1 focus:ring-[#E68736] outline-none"
                            value={block.level}
                            onChange={(e) => updateContentBlock(block.id, { level: parseInt(e.target.value) })}
                          >
                            <option value="1">H1</option>
                            <option value="2">H2</option>
                            <option value="3">H3</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Heading Text</label>
                          <input
                            type="text"
                            className="w-full font-bold text-xl outline-none border-b-2 border-gray-100 focus:border-[#E68736] pb-1 transition-all"
                            placeholder="Type heading..."
                            value={block.text}
                            onChange={(e) => updateContentBlock(block.id, { text: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    {block.type === 'paragraph' && (
                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-2">Text Content</label>
                        <textarea
                          className="w-full outline-none border-b-2 border-gray-100 focus:border-[#E68736] py-2 resize-none transition-all"
                          placeholder="Write your content..."
                          rows="4"
                          value={block.text}
                          onChange={(e) => updateContentBlock(block.id, { text: e.target.value })}
                        />
                      </div>
                    )}

                    {block.type === 'list' && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">List Items</label>
                        {block.listItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 group/item">
                            <span className="text-[#E68736] font-bold text-sm">{idx + 1}.</span>
                            <input 
                              className="flex-1 outline-none border-b border-gray-100 focus:border-[#E68736] py-1 text-sm"
                              value={item}
                              placeholder="List item..."
                              onChange={(e) => handleListChange(block.id, idx, e.target.value)}
                            />
                            <button 
                              type="button"
                              onClick={() => removeListItem(block.id, idx)}
                              className="text-gray-300 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all"
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                        ))}
                        <button 
                          type="button" 
                          onClick={() => addListItem(block.id)} 
                          className="flex items-center gap-1 text-[11px] text-[#E68736] font-bold pt-2 uppercase tracking-wider hover:opacity-80"
                        >
                          <FiPlus size={14} /> Add Item
                        </button>
                      </div>
                    )}

                    {block.type === 'image' && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Section Image</label>
                        <div 
                          className="relative h-56 w-full border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden group/img hover:border-[#E68736] transition-all bg-gray-50/50"
                          onClick={() => document.getElementById(`file-${block.id}`).click()}
                        >
                          {block.preview ? (
                            <img src={block.preview} alt="Content" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center">
                              <FiImage className="mx-auto text-4xl text-gray-200 mb-2" />
                              <span className="text-xs text-gray-400 font-medium">Click to upload image</span>
                            </div>
                          )}
                          <input id={`file-${block.id}`} type="file" hidden onChange={(e) => handleContentImageChange(block.id, e)} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Toolbar */}
                <div className="flex flex-wrap gap-3 p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl justify-center">
                  <button type="button" onClick={() => addContentBlock('heading')} className="flex items-center gap-2 py-2 px-4 rounded-xl bg-gray-50 text-gray-600 hover:bg-[#E68736] hover:text-white transition-all text-xs font-bold uppercase tracking-tight"><FiType /> Heading</button>
                  <button type="button" onClick={() => addContentBlock('paragraph')} className="flex items-center gap-2 py-2 px-4 rounded-xl bg-gray-50 text-gray-600 hover:bg-[#E68736] hover:text-white transition-all text-xs font-bold uppercase tracking-tight"><FiAlignLeft /> Text</button>
                  <button type="button" onClick={() => addContentBlock('list')} className="flex items-center gap-2 py-2 px-4 rounded-xl bg-gray-50 text-gray-600 hover:bg-[#E68736] hover:text-white transition-all text-xs font-bold uppercase tracking-tight"><FiList /> List</button>
                  <button type="button" onClick={() => addContentBlock('image')} className="flex items-center gap-2 py-2 px-4 rounded-xl bg-gray-50 text-gray-600 hover:bg-[#E68736] hover:text-white transition-all text-xs font-bold uppercase tracking-tight"><FiImage /> Image</button>
                </div>
              </div>

              {/* SEO Section */}
              <div className="p-6 bg-gray-50/50 border-2 border-gray-100 rounded-2xl space-y-4">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">SEO Settings</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Meta Title</label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.seo.metaTitle}
                      onChange={handleSeoChange}
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#E68736] outline-none bg-white text-sm"
                      placeholder="SEO Title..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Canonical URL</label>
                    <input
                      type="text"
                      name="canonicalUrl"
                      value={formData.seo.canonicalUrl}
                      onChange={handleSeoChange}
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#E68736] outline-none bg-white text-sm"
                      placeholder="https://example.com/blog-post"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Meta Description</label>
                  <textarea
                    name="metaDescription"
                    value={formData.seo.metaDescription}
                    onChange={handleSeoChange}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#E68736] outline-none bg-white text-sm"
                    rows="2"
                    placeholder="Brief description for search results..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">SEO Keywords</label>
                  <div className="flex flex-wrap gap-2 p-2 bg-white border border-gray-200 rounded-lg min-h-[40px]">
                    {formData.seo.keywords.map((kw, i) => (
                      <span key={i} className="bg-gray-800 text-white px-2 py-1 rounded text-[10px] flex items-center gap-1">
                        {kw} 
                        <FiX 
                          className="cursor-pointer" 
                          onClick={() => setFormData(p => ({
                            ...p, 
                            seo: {...p.seo, keywords: p.seo.keywords.filter((_, idx) => idx !== i)}
                          }))} 
                        />
                      </span>
                    ))}
                    <input
                      value={seoKeywordInput}
                      onKeyDown={addSeoKeyword}
                      onChange={(e) => setSeoKeywordInput(e.target.value)}
                      className="outline-none flex-1 text-xs"
                      placeholder="Type keyword and press Enter..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6 sticky top-8">
                <h3 className="font-bold text-black border-b border-gray-200 pb-3 text-sm uppercase tracking-widest">Post Settings</h3>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-3">Banner Image</label>
                  <div 
                    className="relative h-44 border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden flex flex-col items-center justify-center bg-white cursor-pointer hover:border-[#E68736] transition-all"
                    onClick={() => document.getElementById('banner-upload').click()}
                  >
                    {bannerPreview ? (
                      <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <FiUploadCloud className="text-3xl text-gray-200 mx-auto mb-2" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Upload Banner</span>
                      </div>
                    )}
                  </div>
                  <input id="banner-upload" type="file" hidden onChange={handleBannerChange} />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-3">Tags</label>
                  <div className="flex flex-wrap gap-2 p-3 bg-white border border-gray-200 rounded-xl min-h-[46px]">
                    {formData.tags.map((tag, i) => (
                      <span key={i} className="bg-[#E68736] text-white pl-3 pr-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-2 uppercase tracking-tight">
                        {tag} <FiX onClick={() => removeTag(i)} className="cursor-pointer hover:bg-black/10 rounded" />
                      </span>
                    ))}
                    <input
                      value={tagInput}
                      onKeyDown={addTag}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="outline-none flex-1 text-xs font-medium"
                      placeholder="Add tag..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-3">Visibility</label>
                  <select name="status" onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm font-bold outline-none focus:border-[#E68736]">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 pt-8 border-t border-gray-100">
            <button 
              type="button" 
              onClick={handleDiscard}
              className="px-8 py-3 font-bold text-gray-400 hover:text-black transition-colors uppercase text-xs tracking-widest"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#E68736] text-white px-12 py-4 rounded-xl font-bold hover:bg-black transition-all flex items-center gap-3 shadow-lg shadow-orange-200 disabled:opacity-50 uppercase text-xs tracking-widest"
            >
              {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <>Publish Now <FiPlus /></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlog;