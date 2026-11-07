/* eslint-disable no-unused-vars */
import PageHeader from "../ui/PageHeader";
import React, { useState, useEffect } from 'react';
import { 
  Star, MessageSquare, Filter, 
  ChevronRight, ChevronLeft, Calendar, User, 
  BarChart3, Loader2 
} from 'lucide-react';
import { ReviewService } from '../../backend/ApiService';

// --- PAGINATION COMPONENT ---
const Pagination = ({ totalItems = 0, itemsPerPage = 10, currentPage, setCurrentPage }) => {
  const safeItemsPerPage = itemsPerPage > 0 ? itemsPerPage : 10;
  const totalPages = Math.ceil(totalItems / safeItemsPerPage);

  if (totalItems <= 0 || totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="mt-12 px-10 py-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between bg-white rounded-2xl shadow-sm">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 md:mb-0">
        Showing {((currentPage - 1) * safeItemsPerPage) + 1} - {Math.min(currentPage * safeItemsPerPage, totalItems)} of {totalItems}
      </p>
      
      <div className="flex items-center gap-2">
        <button 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(1)}
          className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 disabled:opacity-20 hover:text-orange-500 transition-colors"
        >
          First
        </button>

        <button 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(prev => prev - 1)} 
          className="p-2.5 rounded-xl border border-slate-200 text-slate-400 disabled:opacity-20 hover:bg-gray-50 transition-all"
        >
          <ChevronLeft size={18}/>
        </button>

        <div className="flex gap-1">
          {getPageNumbers().map((page) => (
            <button 
              key={page} 
              onClick={() => setCurrentPage(page)} 
              className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                currentPage === page 
                  ? "bg-orange-500 text-white shadow-sm" 
                  : "text-slate-400 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button 
          disabled={currentPage === Math.ceil(totalItems / safeItemsPerPage)} 
          onClick={() => setCurrentPage(prev => prev + 1)} 
          className="p-2.5 rounded-xl border border-slate-200 text-slate-400 disabled:opacity-20 hover:bg-gray-50 transition-all"
        >
          <ChevronRight size={18}/>
        </button>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const ProductReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      try {
        const data = await ReviewService.getReviewsByProduct(filter === 'All' ? '' : filter);
        if (Array.isArray(data)) {
          setReviews(data);
          setCurrentPage(1); // Reset to page 1 on filter change
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error("Failed to fetch reviews", err);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, [filter]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReviews = reviews.slice(indexOfFirstItem, indexOfLastItem);

  const getScoreColor = (score) => {
    switch (score?.toLowerCase()) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'average': return 'text-orange-600 bg-orange-50';
      case 'dissatisfied': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="animate-spin text-brand-500" size={32} />
        <p className="text-sm text-slate-500">Loading reviews…</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Product Reviews"
        badge={reviews.length ? `${reviews.length} reviews` : undefined}
        description="Feedback and ratings submitted by customers."
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {currentReviews.map((review) => (
          <div key={review._id} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 flex flex-col">
            <div className="flex justify-between items-start gap-3 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 shrink-0">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-slate-900 capitalize">{review.reviewerInfo?.name}</h3>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                    {review.reviewerInfo?.instituteName} • {review.reviewerInfo?.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar size={14} />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {review.categoryReviews?.map((cat, idx) => (
                <div key={idx} className="border-t border-gray-100 pt-6 first:border-0 first:pt-0">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-semibold bg-slate-900 text-white px-2.5 py-1 rounded-md">
                      {cat.productType}
                    </span>
                    <div className={`px-4 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-tight ${getScoreColor(cat.overallSatisfaction)}`}>
                      {cat.overallSatisfaction}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {cat.ratings?.map((rate, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-[11px] font-medium text-gray-500">{rate.question}</span>
                        <span className={`text-[11px] font-bold uppercase ${getScoreColor(rate.score).split(' ')[0]}`}>
                          {rate.score}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="relative p-5 bg-orange-50/50 rounded-2xl italic text-gray-600 text-sm border-l-4 border-orange-400">
                    <MessageSquare className="absolute -top-2 -left-2 text-orange-400 fill-orange-50" size={20} />
                    "{cat.comments || "No additional feedback provided."}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white py-20 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"><BarChart3 size={22} /></div>
            <p className="font-semibold text-slate-700">No reviews yet</p>
            <p className="mt-1 text-sm text-slate-500">Customer reviews will appear here.</p>
          </div>
        )}
      </div>

      {/* Pagination Integration */}
      <Pagination 
        totalItems={reviews.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default ProductReviewsPage;