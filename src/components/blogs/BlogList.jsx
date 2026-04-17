/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { BlogService } from '../../backend/ApiService';
import { toast } from 'react-hot-toast'; // Kept for quick notifications
import Swal from 'sweetalert2'; // Added SweetAlert2
import { 
  FiUploadCloud, FiPlus, FiX, FiCheckCircle, 
  FiTrash2, FiType, FiImage, FiList, FiAlignLeft, FiEdit3, FiLoader
} from 'react-icons/fi';

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingSingle, setFetchingSingle] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- Form State ---
  const [tagInput, setTagInput] = useState('');
  const [selectedBlogId, setSelectedBlogId] = useState(null); 
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    status: 'published',
    tags: [],
    content: [],
  });
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await BlogService.getAllBlogs();
      setBlogs(data);
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch blogs', 'error');
    } finally {
      setLoading(false);
    }
  };

//   const resetForm = () => {
//     setFormData({
//       title: '',
//       shortDescription: '',
//       status: 'published',
//       tags: [],
//       content: [],
//     });
//     setBannerPreview(null);
//     setBannerImage(null);
//     setSelectedBlogId(null);
//     setTagInput('');
//   };

  const handleEditTrigger = async (blog) => {
    // Show a small loading toast using Swal
    Swal.fire({
      title: 'Fetching details...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    setFetchingSingle(true);
    const blogId = blog.blogId;
    
    try {
      const fullBlogData = await BlogService.getBlogById(blogId);
      
      setSelectedBlogId(blogId); 
      setFormData({
        title: fullBlogData.title || '',
        shortDescription: fullBlogData.shortDescription || '',
        status: fullBlogData.status || 'published',
        tags: fullBlogData.tags || [],
        content: fullBlogData.content || []
      });
      setBannerPreview(fullBlogData.bannerImage);
      setIsEditOpen(true);
      Swal.close(); // Close loading modal
    } catch (err) {
      Swal.fire('Error', 'Could not retrieve full blog details', 'error');
    } finally {
      setFetchingSingle(false);
    }
  };

  const addContentBlock = (type) => {
  const newBlock = { 
      id: Date.now().toString(), 
      type, 
      ...(type === 'heading' ? { text: '', level: 2 } : {}),
      ...(type === 'paragraph' ? { text: '' } : {}),
      ...(type === 'list' ? { listItems: [''] } : {}), // Initialize with one empty item
      ...(type === 'image' ? { file: null, preview: null, image: '' } : {})
  };
  setFormData({ ...formData, content: [...formData.content, newBlock] });
};

const updateContentBlock = (id, updates) => {
  setFormData((prev) => ({
    ...prev,
    content: prev.content.map((block) => {
      // Check all possible ID fields coming from MongoDB/API
      const currentBlockId = block.blockId || block.id || block._id;
      return currentBlockId === id ? { ...block, ...updates } : block;
    })
  }));
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return toast.error("Title is required");

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('shortDescription', formData.shortDescription);
      data.append('status', formData.status);
      data.append('tags', JSON.stringify(formData.tags));
      
      if (bannerImage) {
        data.append('bannerImage', bannerImage);
      }
      let newImageCounter = 0;

      const cleanedContent = formData.content.map((block) => {
      // Create a copy of the block to modify for the payload
      const blockCopy = { ...block };
      
      // Remove local UI properties
      delete blockCopy.preview;
      delete blockCopy.file;

      // If it's a new image block with a local file selected
      if (block.type === 'image' && block.file) {
        blockCopy.imageFileIndex = newImageCounter; // Link JSON to File array
        data.append('contentImages', block.file);   // Add binary to File array
        newImageCounter++;
      }

      return blockCopy;
    });
      data.append('content', JSON.stringify(cleanedContent));

      if (selectedBlogId) {
        await BlogService.updateBlog(selectedBlogId, data);
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Blog updated successfully', timer: 2000, showConfirmButton: false });
      } else {
        await BlogService.createBlog(data);
        Swal.fire({ icon: 'success', title: 'Published!', text: 'Blog published successfully', timer: 2000, showConfirmButton: false });
      }

      setIsEditOpen(false);
    //   resetForm();
      fetchBlogs();
    } catch (err) { 
      const errorMsg = err.response?.data?.message || "Operation failed";
      Swal.fire('Error', errorMsg, 'error');
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleDelete = async (blogId) => {
    // SweetAlert Confirmation Dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This blog will be permanently removed!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      borderRadius: '2rem'
    });

    if (result.isConfirmed) {
      try {
        await BlogService.deleteBlog(blogId);
        Swal.fire('Deleted!', 'The blog has been deleted.', 'success');
        fetchBlogs();
      } catch (err) {
        Swal.fire('Failed!', 'Delete operation failed.', 'error');
      }
    }
  };

  return (
    <div className="p-8 bg-[#F8F9FA] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Blog CMS</h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Manage Digident Articles</p>
          </div>
        </div>

        {/* Blog Table */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Banner</th>
                <th className="p-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Title & Status</th>
                <th className="p-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="3" className="p-20 text-center text-gray-400 font-medium animate-pulse">Fetching blog data...</td></tr>
              ) : blogs.length === 0 ? (
                <tr><td colSpan="3" className="p-10 text-center text-gray-400">No blogs found.</td></tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.blogId} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="p-6 w-40">
                      <div className="relative overflow-hidden rounded-xl border border-gray-100 h-16 w-28 bg-gray-50">
                        {blog.bannerImage && <img src={blog.bannerImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />}
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-gray-800 text-base mb-1">{blog.title}</p>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${blog.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                          {blog.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          disabled={fetchingSingle}
                          onClick={() => handleEditTrigger(blog)} 
                          className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-black hover:text-white transition-all disabled:opacity-50"
                        >
                          <FiEdit3 size={18} />
                        </button>
                        <button onClick={() => handleDelete(blog.blogId)} className="p-3 bg-gray-50 text-red-300 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditOpen(false)} />
          
          <div className="relative w-full max-w-5xl mx-auto bg-white rounded-[2.5rem] h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
            
            <div className="bg-black p-6 md:p-8 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">
                    {selectedBlogId ? 'Update Post' : 'Create New Post'}
                </h2>
                <p className="text-gray-400 text-[10px] md:text-xs mt-1">Refine your content for the dental community.</p>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <FiX size={28}/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-10">
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                
                <div className="flex-1 space-y-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">Blog Title</label>
                      <input
                        type="text" 
                        required
                        className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:border-[#E68736] outline-none transition-all text-gray-800 font-medium"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">Short Description</label>
                      <textarea
                        className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:border-[#E68736] outline-none transition-all resize-none min-h-[100px]"
                        value={formData.shortDescription}
                        onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                      />
                    </div>
                  </div>

{/* Article Body */}
<div className="space-y-6">
  <label className="block text-xs font-black text-gray-900 uppercase tracking-widest">Article Body</label>
  {formData.content.map((block) => (
    <div key={block.id || block._id || block.blockId} className="group relative p-6 md:p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
      <button 
          type="button" 
          onClick={() => setFormData({...formData, content: formData.content.filter(b => (b.id||b._id||b.blockId) !== (block.id||block._id||block.blockId))})}
          className="absolute -top-3 -right-3 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 border border-gray-50 z-10"
      >
          <FiTrash2 size={14} />
      </button>

      {/* HEADING BLOCK */}
      {block.type === 'heading' && (
        <div className="flex gap-4 md:gap-8 items-end">
          <select 
              className="bg-gray-50 border-none text-sm font-bold p-3 rounded-xl cursor-pointer"
              value={block.level} 
              onChange={(e) => updateContentBlock(block.id || block._id || block.blockId, { level: parseInt(e.target.value) })}
          >
              <option value="1">H1</option><option value="2">H2</option><option value="3">H3</option>
          </select>
          <input 
              className="flex-1 text-lg font-bold outline-none border-b border-gray-100 focus:border-orange-400 pb-2" 
              value={block.text} 
              onChange={(e) => updateContentBlock(block.id || block._id || block.blockId, { text: e.target.value })} 
          />
        </div>
      )}

      {/* PARAGRAPH BLOCK */}
      {block.type === 'paragraph' && (
         <textarea 
          className="w-full text-gray-600 outline-none border-b border-gray-100 focus:border-orange-400 py-2 resize-none" 
          rows="4" 
          value={block.text} 
          onChange={(e) => updateContentBlock(block.id || block._id || block.blockId, { text: e.target.value })} 
         />
      )}

      {/* LIST BLOCK (Added this section) */}
      {block.type === 'list' && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-2">List Items</p>
          {block.listItems?.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-400 rounded-full shrink-0" />
              <input 
                className="flex-1 text-sm text-gray-600 outline-none border-b border-gray-50 focus:border-orange-400"
                value={item}
                onChange={(e) => {
                  const newList = [...block.listItems];
                  newList[index] = e.target.value;
                  updateContentBlock(block.id || block._id || block.blockId, { listItems: newList });
                }}
              />
            </div>
          ))}
        </div>
      )}


{/* IMAGE BLOCK */}
{block.type === 'image' && (
  <div 
    className="relative h-48 border-2 border-dashed border-gray-100 rounded-[1.5rem] flex flex-col items-center justify-center bg-gray-50/50 overflow-hidden cursor-pointer"
    onClick={() => document.getElementById(`img-${block.blockId || block.id || block._id}`).click()}
  >
    {/* Use block.image (from API) or block.preview (from local upload) */}
    {(block.preview || block.image) ? (
        <img 
          src={block.preview || block.image} 
          className="w-full h-full object-cover" 
          alt="Content" 
        />
    ) : (
        <div className="text-center">
          <FiImage className="mx-auto text-4xl text-gray-200" />
          <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">Click to upload</p>
        </div>
    )}
    
    <input 
      id={`img-${block.blockId || block.id || block._id}`} 
      type="file" 
      hidden 
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          const currentId = block.blockId || block.id || block._id;
          updateContentBlock(currentId, { 
            file: file, 
            preview: URL.createObjectURL(file) 
          });
        }
      }} 
    />
  </div>
)}
    </div>
  ))}
  
  {/* Controls for adding new blocks */}
  <div className="flex justify-center gap-3 p-4 border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/30">
    <button type="button" onClick={() => addContentBlock('heading')} className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white shadow-sm text-[10px] font-black uppercase tracking-widest hover:border-orange-400 transition-all"><FiType className="text-orange-500"/> Heading</button>
    <button type="button" onClick={() => addContentBlock('paragraph')} className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white shadow-sm text-[10px] font-black uppercase tracking-widest hover:border-orange-400 transition-all"><FiAlignLeft className="text-orange-500"/> Text</button>
    <button type="button" onClick={() => addContentBlock('list')} className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white shadow-sm text-[10px] font-black uppercase tracking-widest hover:border-orange-400 transition-all"><FiList className="text-orange-500"/> List</button>
    <button type="button" onClick={() => addContentBlock('image')} className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white shadow-sm text-[10px] font-black uppercase tracking-widest hover:border-orange-400 transition-all"><FiImage className="text-orange-500"/> Image</button>
  </div>
</div>
                </div>

                {/* Sidebar Configuration */}
                <div className="w-full lg:w-80 shrink-0">
                  <div className="lg:sticky lg:top-0 bg-[#FBFBFC] rounded-[2rem] border border-gray-100 p-6 md:p-8 space-y-8">
                    <h3 className="text-[10px] font-black text-black uppercase tracking-[0.2em] border-b border-gray-200/60 pb-4">Post Settings</h3>
                    
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Featured Banner</label>
                      <div 
                        className="aspect-video border-2 border-dashed border-gray-200 rounded-[1.5rem] overflow-hidden bg-white flex flex-col items-center justify-center cursor-pointer group hover:border-orange-400 transition-all"
                        onClick={() => document.getElementById('banner-input').click()}
                      >
                        {bannerPreview ? (
                            <img src={bannerPreview} className="w-full h-full object-cover" alt="Banner" />
                        ) : (
                            <FiUploadCloud className="text-2xl text-gray-200 group-hover:text-orange-400" />
                        )}
                      </div>
                      <input id="banner-input" type="file" hidden onChange={(e) => {
                        const file = e.target.files[0];
                        if(file) { setBannerImage(file); setBannerPreview(URL.createObjectURL(file)); }
                      }} />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Search Tags</label>
                      <input 
                          value={tagInput} 
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                              if(e.key === 'Enter' && tagInput.trim()) {
                                  e.preventDefault();
                                  if (!formData.tags.includes(tagInput.trim())) {
                                      setFormData({...formData, tags: [...formData.tags, tagInput.trim()]});
                                  }
                                  setTagInput('');
                              }
                          }}
                          className="w-full p-3 bg-white border border-gray-100 rounded-xl text-xs outline-none focus:border-orange-400" 
                          placeholder="Type and press Enter..." 
                      />
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.tags.map((tag, i) => (
                          <span key={i} className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-2">
                            {tag} <FiX className="cursor-pointer" onClick={() => setFormData({...formData, tags: formData.tags.filter((_, idx) => idx !== i)})} />
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Post Visibility</label>
                      <select 
                        className="w-full p-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase outline-none focus:border-orange-400 cursor-pointer"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="w-full bg-[#E68736] text-white py-4 rounded-[1.25rem] font-black uppercase text-[10px] tracking-[0.15em] hover:bg-black transition-all shadow-xl shadow-orange-100 disabled:opacity-50"
                        >
                            {submitting ? "Saving..." : selectedBlogId ? "Commit Changes" : "Publish Article"}
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;