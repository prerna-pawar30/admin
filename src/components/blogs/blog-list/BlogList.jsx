/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  Plus, Search, Edit3, Trash2, Eye, Loader2,
  FileText, Tag, Calendar, TrendingUp, Hash, Filter, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BlogService } from '../../../backend/ApiService';

const statusBadge = (status) => {
  const map = {
    published: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    draft: 'bg-amber-50 text-amber-600 border border-amber-100',
  };
  return map[status] || 'bg-slate-100 text-slate-500';
};

const BlogList = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

const fetchBlogs = async () => {
  setLoading(true);
  try {
    const res = await BlogService.getAllBlogs('cms.blog.read');
    console.log('API RESPONSE:', res); // 👈 add this, check console

    // Safely extract array from any response shape
    const raw = res?.data ?? res;
    const list = Array.isArray(raw) ? raw
      : Array.isArray(raw?.blogs) ? raw.blogs
      : Array.isArray(raw?.data) ? raw.data
      : [];

    setBlogs(list);
  } catch (err) {
    console.error('Blog fetch error:', err);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load blogs.' });
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchBlogs(); }, []);

  const handleDelete = async (blogId, title) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Blog?',
      text: `"${title}" will be permanently removed.`,
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Delete',
    });
    if (!result.isConfirmed) return;

    setDeletingId(blogId);
    try {
      const res = await BlogService.deleteBlog(blogId);
      if (res?.success) {
        Swal.fire({ icon: 'success', title: 'Deleted', text: 'Blog removed successfully.', confirmButtonColor: '#E68736' });
        setBlogs(prev => prev.filter(b => b.blogId !== blogId));
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message || 'Delete failed.' });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = blogs.filter(blog => {
    const matchSearch =
      blog.title?.toLowerCase().includes(search.toLowerCase()) ||
      blog.category?.toLowerCase().includes(search.toLowerCase()) ||
      blog.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || blog.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: blogs.length,
    published: blogs.filter(b => b.status === 'published').length,
    draft: blogs.filter(b => b.status === 'draft').length,
  };

  return (
    <div className="min-h-screen text-slate-800 bg-slate-50/50">
      {/* Sticky Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-10 backdrop-blur-md bg-white/90 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-800">Content Nodes</h1>
          <p className="text-[11px] text-slate-400 font-medium tracking-wide">Manage and configure platform publication entries.</p>
        </div>
        <button
          onClick={() => navigate('/catalog/blogs/add-blog')}
          className="flex items-center gap-2 bg-[#E68736] hover:bg-[#cf7a31] text-white px-5 py-2 rounded-xl font-bold text-xs transition-all shadow-sm shadow-orange-500/10"
        >
          <Plus size={14} />
          Create Blog
        </button>
      </div>

      <main className="max-w-[1500px] mx-auto p-6 lg:p-8 space-y-6">

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Posts', value: stats.total, icon: FileText, color: 'text-slate-500', bg: 'bg-slate-50' },
            { label: 'Published', value: stats.published, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Drafts', value: stats.draft, icon: Edit3, color: 'text-amber-500', bg: 'bg-amber-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm flex items-center gap-4">
              <div className={`${bg} p-3 rounded-xl`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">{value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3.5 top-[11px] text-slate-300" />
            <input
              type="text"
              placeholder="Search by title, category, or tag..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200/80 focus:border-[#E68736] focus:ring-[#E68736] bg-slate-50/40 text-slate-700 placeholder-slate-300 transition-all"
            />
          </div>
          <div className="relative">
            <Filter size={12} className="absolute left-3 top-[11px] text-slate-300" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="pl-8 pr-8 py-2.5 text-xs font-bold rounded-xl border border-slate-200/80 focus:border-[#E68736] focus:ring-[#E68736] bg-slate-50/40 text-slate-700 appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <ChevronDown size={11} className="absolute right-3 top-[11px] text-slate-300 pointer-events-none" />
          </div>
        </div>

        {/* Blog Table */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-50 bg-slate-50/50">
            {['Cover', 'Title & Meta', 'Category', 'Tags', 'Status', 'Date', 'Actions'].map((h, i) => (
              <span
                key={h}
                className={`text-[9px] font-black uppercase tracking-widest text-slate-400 ${
                  i === 0 ? 'col-span-1' :
                  i === 1 ? 'col-span-4' :
                  i === 2 ? 'col-span-2' :
                  i === 3 ? 'col-span-2' :
                  i === 4 ? 'col-span-1' :
                  i === 5 ? 'col-span-1' : 'col-span-1'
                }`}
              >{h}</span>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3">
              <Loader2 size={20} className="animate-spin text-[#E68736]" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading content nodes...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                <FileText size={20} className="text-[#E68736]" />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No blogs found</p>
              <button
                onClick={() => navigate('/catalog/blogs/create')}
                className="flex items-center gap-2 text-[#E68736] text-xs font-bold hover:underline mt-1"
              >
                <Plus size={12} /> Create your first blog
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((blog) => (
                <div key={blog.blogId} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/40 transition-colors group">
                  {/* Cover */}
                  <div className="col-span-1">
                    {blog.featuredImage ? (
                      <img
                        src={blog.featuredImage}
                        alt={blog.title}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
                        <FileText size={14} className="text-[#E68736]" />
                      </div>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="col-span-4 min-w-0">
                    <p className="text-xs font-black text-slate-800 truncate">{blog.title}</p>
                    <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{blog.description || 'No description'}</p>
                  </div>

                  {/* Category */}
                  <div className="col-span-2">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg truncate block max-w-full">
                      {blog.category || '—'}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="col-span-2 flex flex-wrap gap-1">
                    {(blog.tags || []).slice(0, 2).map(tag => (
                      <span key={tag} className="text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md bg-orange-50 text-[#E68736] border border-orange-100">
                        {tag}
                      </span>
                    ))}
                    {(blog.tags || []).length > 2 && (
                      <span className="text-[9px] font-black text-slate-400">+{blog.tags.length - 2}</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <span className={`text-[9px] font-black uppercase tracking-wide px-2.5 py-1 rounded-lg ${statusBadge(blog.status)}`}>
                      {blog.status}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-1">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center gap-1.5">
                    <button
                      onClick={() => navigate(`/catalog/blogs/${blog.blogId}`)}
                      className="w-7 h-7 rounded-lg bg-orange-50 hover:bg-[#E68736] text-[#E68736] hover:text-white flex items-center justify-center transition-all border border-orange-100 hover:border-[#E68736]"
                      title="Edit"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(blog.blogId, blog.title)}
                      disabled={deletingId === blog.blogId}
                      className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition-all border border-red-100 hover:border-red-500 disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === blog.blogId
                        ? <Loader2 size={12} className="animate-spin" />
                        : <Trash2 size={12} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Count */}
        {!loading && filtered.length > 0 && (
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
            Showing {filtered.length} of {blogs.length} content nodes
          </p>
        )}
      </main>
    </div>
  );
};

export default BlogList;