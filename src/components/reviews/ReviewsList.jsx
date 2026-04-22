/* eslint-disable no-unused-vars */
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
    <div className="mt-12 px-10 py-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between bg-white rounded-[2.5rem] shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 md:mb-0">
        Showing {((currentPage - 1) * safeItemsPerPage) + 1} - {Math.min(currentPage * safeItemsPerPage, totalItems)} of {totalItems}
      </p>
      
      <div className="flex items-center gap-2">
        <button 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(1)}
          className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 disabled:opacity-20 hover:text-orange-500 transition-colors"
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
              className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                currentPage === page 
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-200" 
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
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-orange-500" size={48} />
        <p className="font-bold uppercase tracking-widest text-gray-400 text-xs">Analyzing Feedback...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Feedback Analytics</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">Sentiment & Quality Repository</p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {currentReviews.map((review) => (
          <div key={review._id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg capitalize">{review.reviewerInfo?.name}</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    {review.reviewerInfo?.instituteName} • {review.reviewerInfo?.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="space-y-10">
              {review.categoryReviews?.map((cat, idx) => (
                <div key={idx} className="border-t border-gray-100 pt-6 first:border-0 first:pt-0">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black bg-black text-white px-3 py-1 rounded-md uppercase tracking-widest">
                      {cat.productType}
                    </span>
                    <div className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-tighter ${getScoreColor(cat.overallSatisfaction)}`}>
                      {cat.overallSatisfaction}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {cat.ratings?.map((rate, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-[11px] font-medium text-gray-500">{rate.question}</span>
                        <span className={`text-[10px] font-bold uppercase ${getScoreColor(rate.score).split(' ')[0]}`}>
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
          <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-20">
            <BarChart3 size={80} strokeWidth={1} />
            <p className="mt-4 font-black uppercase tracking-[0.5em]">No Feedback Detected</p>
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