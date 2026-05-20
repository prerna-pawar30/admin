/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Filter, Calendar, Tag, ChevronLeft, ChevronRight, FileText, CheckCircle, Clock, Loader2, Inbox } from 'lucide-react';
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
      text: "This operation cannot be reversed.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl text-sm px-4 py-2 font-bold',
        cancelButton: 'rounded-xl text-sm px-4 py-2 font-bold'
      }
    });

    if (result.isConfirmed) {
      try {
        const res = await BlogService.deleteBlog(blogId, { permission: "blog.post.delete" });
        if (res.success) {
          Swal.fire({
            title: 'Deleted!',
            text: 'The article entry has been removed.',
            icon: 'success',
            confirmButtonColor: '#E68736'
          });
          fetchBlogs(pagination.currentPage);
        }
      } catch (error) {
        Swal.fire('Error', 'Delete failed token parameters verification.', 'error');
      }
    }
  };

  const filteredBlogs = blogs.filter(blog => 
    blog.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen text-slate-800 bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Top Header Panel Section */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-orange-100">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Article Hub</h1>
            <p className="text-slate-400 text-xs md:text-sm font-medium mt-0.5">Manage, track, and publish content configurations.</p>
          </div>
          <Link 
            to="/catalog/blogs/add-blog" 
            className="flex items-center justify-center gap-2 bg-[#E68736] hover:bg-[#cf7a31] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-orange-500/10 whitespace-nowrap self-start sm:self-auto"
          >
            <Plus size={16} /> Create New Post
          </Link>
        </div>

        {/* Dynamic Metric Metrics Stats Grid Counter blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-orange-100 flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-[#E68736] rounded-xl"><FileText size={22}/></div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Total Posts</p>
              <p className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">{pagination.totalItems || 0}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-orange-100  flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle size={22}/></div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Live Content</p>
              <p className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">
                {blogs.filter(b => b.status === 'published').length}
              </p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-orange-100  flex items-center gap-4">
            <div className="p-3 bg-slate-50 text-slate-500 rounded-xl"><Clock size={22}/></div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Total Pages</p>
              <p className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">{pagination.totalPages || 1}</p>
            </div>
          </div>
        </div>

        {/* Master Controlled Data Grid Base wrapper element */}
        <div className="bg-white rounded-2xl  border border-orange-100 overflow-hidden">
          
          {/* Functional Input Filter Management bar panel block */}
          <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between bg-slate-50/40">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-[11px] text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search articles by text string title..." 
                className="w-full pl-10 pr-4 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-[#E68736] focus:border-[#E68736] placeholder-slate-300 text-slate-700 transition-all bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-all">
              <Filter size={14} /> Refine Filters
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-widest bg-slate-50/20">
                  <th className="px-6 py-4">Article Specimen</th>
                  <th className="px-6 py-4 hidden md:table-cell">Category Node</th>
                  <th className="px-6 py-4 hidden sm:table-cell">Creation Date</th>
                  <th className="px-6 py-4">Status Anchor</th>
                  <th className="px-6 py-4 text-right">Actions Core</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  // Elegant Animated Shimmer Skeleton Framework
                  [...Array(4)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0" />
                          <div className="h-3.5 w-40 bg-slate-100 rounded-md" />
                        </div>
                      </td>
                      <td className="px-6 py-5 hidden md:table-cell"><div className="h-3 w-20 bg-slate-100 rounded-md" /></td>
                      <td className="px-6 py-5 hidden sm:table-cell"><div className="h-3 w-24 bg-slate-100 rounded-md" /></td>
                      <td className="px-6 py-5"><div className="h-5 w-16 bg-slate-100 rounded-full" /></td>
                      <td className="px-6 py-5 text-right"><div className="h-8 w-16 bg-slate-100 rounded-lg ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredBlogs.length === 0 ? (
                  // Dynamic Empty State Fallback Layout
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                        <div className="p-4 bg-slate-50 rounded-2xl text-slate-300 border border-slate-100"><Inbox size={32} /></div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-slate-700">No Articles Located</h3>
                          <p className="text-slate-400 text-xs leading-relaxed">We couldn't track down any database elements matching your current query requirements.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBlogs.map((blog) => (
                    <tr key={blog._id || blog.blogId} className="hover:bg-slate-50/50 group transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-slate-300">
                            {blog.featuredImage ? (
                              <img src={blog.featuredImage} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <FileText size={18} className="text-slate-300" />
                            )}
                          </div>
                          <div className="max-w-[180px] md:max-w-xs truncate font-bold text-slate-700 group-hover:text-slate-900 text-sm transition-colors">{blog.title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500 hidden md:table-cell">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/20">{blog.category || 'General'}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-400 hidden sm:table-cell">
                        {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '---'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase inline-flex items-center ${
                          blog.status === 'published' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {blog.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <Link 
                            to={`/catalog/blogs/${blog.blogId}`} 
                            className="p-2 text-slate-400 hover:text-[#E68736] hover:bg-orange-50/50 rounded-xl transition-all border border-transparent hover:border-orange-100"
                            title="Edit Entry"
                          >
                            <Edit2 size={15} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(blog.blogId)} 
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                            title="Delete Entry"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Core App Navigation Controls Footer element */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => fetchBlogs(pagination.currentPage - 1)} 
                disabled={!pagination.prevPage || loading} 
                className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
              >
                <ChevronLeft size={16}/>
              </button>
              <button 
                onClick={() => fetchBlogs(pagination.currentPage + 1)} 
                disabled={!pagination.nextPage || loading} 
                className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
              >
                <ChevronRight size={16}/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogList;