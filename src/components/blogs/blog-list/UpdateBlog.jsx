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
    const formPayload = new FormData();

    // Basic Fields
    formPayload.append("title", formData.title || "");
    formPayload.append("description", formData.description || "");
    formPayload.append(
      "contentMarkdown",
      formData.contentMarkdown || ""
    );
    formPayload.append("category", formData.category || "");
    formPayload.append("status", formData.status || "published");

    // Permission
    formPayload.append("permission", "blog.post.update");

    // Tags
    if (formData.tags) {
      const tagsArray =
        typeof formData.tags === "string"
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag !== "")
          : formData.tags;

      tagsArray.forEach((tag) => {
        formPayload.append("tags[]", tag);
      });
    }

    // Featured Image
    // ONLY append if new file selected
    if (
      formData.featuredImage &&
      typeof formData.featuredImage !== "string"
    ) {
      formPayload.append(
        "featuredImage",
        formData.featuredImage
      );
    }

    const res = await BlogService.updateBlog(
      blogId,
      formPayload
    );

    if (res.success) {
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Blog updated successfully",
        timer: 2000,
      });

      navigate("/catalog/blogs");
    }
  } catch (err) {
    console.error("Update Error:", err);

    Swal.fire(
      "Error",
      err?.response?.data?.message ||
        "Failed to update blog",
      "error"
    );
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