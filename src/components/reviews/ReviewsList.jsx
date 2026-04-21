import React, { useState, useEffect } from 'react';
import { 
  Star, MessageSquare, Filter, 
  ChevronRight, Calendar, User, 
  BarChart3, Loader2 
} from 'lucide-react';
import { ReviewService } from '../../backend/ApiService';

const ProductReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const loadReviews = async () => {
      try {
        // Calling the service with the current filter (productType)
        const data = await ReviewService.getReviewsByProduct(filter === 'All' ? '' : filter);
        setReviews(data);
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, [filter]);

  const productTypes = ['All', 'Scan Body', 'Lab Analog', 'Horizontal Scan Body'];

  // Helper to color-code the sentiment scores
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
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Feedback Analytics</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">Sentiment & Quality Repository</p>
        </div>

        {/* Product Filter */}
        <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          {productTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === type ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </header>

      {/* Review Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg capitalize">{review.reviewerInfo?.name}</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    {review.reviewerInfo?.instituteName || 'Private Practice'} • {review.reviewerInfo?.location}
                  </p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-tighter ${getScoreColor(review.overallSatisfaction)}`}>
                {review.overallSatisfaction}
              </div>
            </div>

            <div className="mb-6">
              <span className="text-[10px] font-black bg-black text-white px-3 py-1 rounded-md uppercase tracking-widest">
                {review.productType}
              </span>
            </div>

            {/* Ratings Detail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {review.ratings?.map((rate, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-[11px] font-medium text-gray-500">{rate.question}</span>
                  <span className={`text-[10px] font-bold uppercase ${getScoreColor(rate.score).split(' ')[0]}`}>
                    {rate.score}
                  </span>
                </div>
              ))}
            </div>

            {/* Comment Section */}
            <div className="relative p-6 bg-orange-50/50 rounded-[2rem] italic text-gray-600 text-sm border-l-4 border-orange-400">
              <MessageSquare className="absolute -top-3 -left-3 text-orange-400 fill-orange-50" size={24} />
              "{review.comments || "No additional feedback provided."}"
            </div>

            <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-50">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button className="flex items-center gap-1 text-[10px] font-black uppercase text-black hover:gap-3 transition-all">
                Full Report <ChevronRight size={14} />
              </button>
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
    </div>
  );
};

export default ProductReviewsPage;