/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Filter, Calendar, Tag, ChevronLeft, ChevronRight, FileText, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { BlogService } from '../../../backend/ApiService'; 
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const BlogList = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ 
    currentPage: 1, totalPages: 1, totalItems: 0, nextPage: false, prevPage: false 
  });

  useEffect(() => { fetchBlogs(1); }, []);

  const fetchBlogs = async (page) => {
    setLoading(true);
    try {
      const response = await BlogService.getAllBlogs('blog.listing.read', page); 
      if (response?.success) {
        setBlogs(response.data.blogs || []);
        setPagination(response.data.pagination || pagination);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await BlogService.deleteBlog(blogId, { permission: "blog.post.delete" });
        if (res.success) {
          Swal.fire('Deleted!', '', 'success');
          fetchBlogs(pagination.currentPage);
        }
      } catch (error) {
        Swal.fire('Error', 'Delete failed', 'error');
      }
    }
  };

  const filteredBlogs = blogs.filter(blog => blog.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
            <p className="text-gray-500 text-sm">Manage your articles and news.</p>
          </div>
          {/* Note the path change here */}
          <Link to="/catalog/blogs/add" className="flex items-center gap-2 bg-[#E68736] text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-[#cf7a31]">
            <Plus size={18} /> Create New Post
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><FileText size={24}/></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.totalItems || 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={24}/></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Published</p>
              <p className="text-2xl font-bold text-gray-900">{blogs.filter(b => b.status === 'published').length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Clock size={24}/></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Pages</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.totalPages}</p>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between bg-gray-50/50">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by title..." 
                className="w-full pl-10 pr-4 py-2 border-gray-200 rounded-lg focus:ring-[#E68736] focus:border-[#E68736] text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50">
              <Filter size={16} /> Filters
            </button>
          </div>

<div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                  <th className="px-6 py-4">Article</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr className="animate-pulse"><td colSpan="5" className="h-32 bg-gray-50"></td></tr>
                ) : filteredBlogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50/80 group transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0">
                          {blog.featuredImage && <img src={blog.featuredImage} className="w-full h-full object-cover rounded" alt="" />}
                        </div>
                        <div className="max-w-xs truncate font-semibold">{blog.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{blog.category || 'General'}</td>
                    <td className="px-6 py-4 text-sm">{new Date(blog.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${blog.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100">
                        <Link to={`/catalog/blogs/update/${blog.blogId}`} className="p-2 text-gray-400 hover:text-blue-600">
                          <Edit2 size={18} />
                        </Link>
                        <button onClick={() => handleDelete(blog.blogId)} className="p-2 text-gray-400 hover:text-red-600">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t flex justify-between items-center bg-gray-50/30">
             <span className="text-sm text-gray-500">Page {pagination.currentPage} of {pagination.totalPages}</span>
             <div className="flex gap-2">
                <button onClick={() => fetchBlogs(pagination.currentPage - 1)} disabled={!pagination.prevPage} className="p-2 border rounded disabled:opacity-30"><ChevronLeft size={18}/></button>
                <button onClick={() => fetchBlogs(pagination.currentPage + 1)} disabled={!pagination.nextPage} className="p-2 border rounded disabled:opacity-30"><ChevronRight size={18}/></button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogList;