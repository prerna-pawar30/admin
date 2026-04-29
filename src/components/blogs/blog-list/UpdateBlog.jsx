/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { BlogService } from '../../../backend/ApiService';
import BlogForm from './BlogForm';

const UpdateBlog = () => {
  // CRITICAL: This must match the name in AppRoutes.jsx -> path="blogs/update/:blogId"
  const { blogId } = useParams(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);



useEffect(() => {
  const fetchBlogDetails = async () => {
    try {
      // This will now call: .../blogs/1f13e3d0.../blog.post.read
      const res = await BlogService.getBlogById(blogId, 'blog.post.read');
      
      if (res && (res.success || res.blogId)) {
        setInitialData(res.data || res);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };
  fetchBlogDetails();
}, [blogId]);

const handleUpdate = async (formData) => {
  setLoading(true);
  try {
    // Clean up the data before sending
    const jsonPayload = {
      ...formData,
      // Convert tags string "react, js" to ["react", "js"] if it's a string
      tags: typeof formData.tags === 'string' 
        ? formData.tags.split(',').map(t => t.trim()).filter(t => t !== "") 
        : formData.tags
    };

    const res = await BlogService.updateBlog(blogId, jsonPayload);
    
    if (res.success) {
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Blog updated successfully',
        timer: 2000
      });
      navigate('/catalog/blogs');
    }
  } catch (err) {
    console.error("Update Error:", err);
    Swal.fire('Error', 'Failed to update the blog. Please try again.', 'error');
  } finally {
    setLoading(false);
  }
};

  if (!initialData) return <div className="p-20 text-center">Loading blog content...</div>;

  return (
    <BlogForm 
      initialData={initialData} 
      onSubmit={handleUpdate} 
      loading={loading} 
      buttonText="Update Post" 
    />
  );
};

export default UpdateBlog;