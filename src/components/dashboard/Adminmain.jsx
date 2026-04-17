import React, { useState, useEffect, useMemo } from 'react';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  Tooltip, Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { AnalyticsService } from '../../backend/ApiService'; // Adjust path based on your folder structure
import { BarChart3, Clock, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const FinalAnalyticsDashboard = () => {
  const [category, setCategory] = useState('GEN'); 
  const [timeframe, setTimeframe] = useState('30'); 
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Using the service layer logic which already groups data by brandName
        const groupedData = await AnalyticsService.getLibraryStats(category, timeframe);
        setDisplayData(groupedData);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [category, timeframe]);

  const chartConfig = useMemo(() => ({
    labels: displayData.map(item => item.brandName),
    datasets: [{
      label: 'Usage Count',
      data: displayData.map(item => item.usageCount),
      backgroundColor: [
        'rgba(249, 115, 22, 0.8)', // orange-500
        'rgba(251, 146, 60, 0.8)', // orange-400
        'rgba(253, 186, 116, 0.8)', // orange-300
        'rgba(30, 41, 59, 0.8)',   // slate-800 for contrast
      ],
      borderWidth: 0,
      borderRadius: 12,
      barThickness: 32,
    }]
  }), [displayData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 12, weight: 'bold' }
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { font: { size: 10, weight: '600' } } }
    }
  };

  return (
    <div className="p-4 md:p-4 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-[2.5rem] overflow-hidden border border-orange-100">
        
        {/* Header Section */}
        <div className="p-8 border-b border-orange-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
                <BarChart3 size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Library Analytics</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">
                  Monitoring <span className="text-orange-500">{category}</span> Performance
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Category Toggles */}
              <div className="flex bg-orange-100 p-1.5 rounded-2xl">
                {['GEN', 'SCR', 'ABT'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all ${
                      category === cat ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Timeframe Select */}
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" size={14} />
                <select 
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="pl-9 pr-8 py-2.5 bg-orange-50 text-slate-900 text-[10px] font-black rounded-2xl outline-none appearance-none border-none cursor-pointer"
                >
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 3 Months</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Content */}
        <div className="p-8">
          <div className="h-[300px] w-full relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-sm rounded-3xl">
                <Loader2 className="animate-spin text-orange-500" size={32} />
              </div>
            )}

            {displayData.length > 0 ? (
              <Bar data={chartConfig} options={options} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                <AlertCircle size={40} className="mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">No matching records found</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-gray-50">
          <StatBox 
            label="Unique Brands" 
            value={displayData.length} 
            sub="Active in Library"
          />
          <StatBox 
            label="Most Popular" 
            value={displayData[0]?.brandName || 'N/A'} 
            sub="Highest Usage"
            highlight
          />
          <StatBox 
            label="Total Interactions" 
            value={displayData.reduce((acc, curr) => acc + curr.usageCount, 0).toLocaleString()} 
            sub="System-wide Usage"
          />
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Component
const StatBox = ({ label, value, sub, highlight = false }) => (
  <div className={`p-8 text-center border-r border-gray-50 last:border-0 ${highlight ? 'bg-orange-50/30' : ''}`}>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
    <p className={`text-2xl font-black truncate px-2 ${highlight ? 'text-orange-600' : 'text-slate-800'}`}>
      {value}
    </p>
    <div className="flex items-center justify-center gap-1 mt-1">
      <TrendingUp size={10} className={highlight ? 'text-orange-400' : 'text-slate-300'} />
      <p className="text-[9px] font-bold text-slate-400 uppercase">{sub}</p>
    </div>
  </div>
);

export default FinalAnalyticsDashboard;