
import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend 
} from "chart.js";
import { Line } from "react-chartjs-2";
import { TrendingUp, ArrowLeft, Package, DollarSign } from "lucide-react";


const BackendUrl = import.meta.env.VITE_API_BASE_URL;

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function BestSellingAnalytics() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBest = async () => {
      try {
        const res = await axios.get(`${BackendUrl}/api/v1/product/best-selling`);
        if (res.data.success) {
          setItems(res.data.data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBest();
  }, []);

  // --- CHART CONFIGURATION ---
  const chartData = {
    // We take the top 10 products for the graph
    labels: items.slice(0, 10).map(p => p.name.length > 12 ? p.name.slice(0, 12) + ".." : p.name),
    datasets: [
      {
        label: "Price Value",
        data: items.slice(0, 10).map(p => p.price),
        fill: true,
        borderColor: "#E68736",
        backgroundColor: "rgba(230, 135, 54, 0.1)",
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "#E68736",
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1e293b',
        padding: 12,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#f1f5f9" },
        ticks: { callback: (value) => "₹" + value.toLocaleString() }
      },
      x: { grid: { display: false } }
    },
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#E68736]"></div>
    </div>
  );

  return (
    <div className="py-12 min-h-screen p-4 md:p-10">
      <div className="py-12 max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side: Stats Summary */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <TrendingUp className="text-[#E68736] mb-4" size={32} />
              <h1 className="text-3xl font-black text-gray-800 leading-tight">
                Sales <br /><span className="text-[#E68736]">Performance</span>
              </h1>
              <p className="text-gray-400 mt-4 text-sm font-medium">
                Analysis of the top {items.length} best-performing products in your catalog.
              </p>
            </div>

            <div className="bg-[#E68736] p-8 rounded-[2.5rem] text-white shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/10 rounded-2xl"><Package size={24}/></div>
                <div>
                  <p className="text-white text-xs font-bold uppercase tracking-widest">Total Products</p>
                  <p className="text-2xl font-black">{items.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl"><DollarSign size={24}/></div>
                <div>
                  <p className="text-white text-xs font-bold uppercase tracking-widest">Avg. Price</p>
                  <p className="text-2xl font-black">
                    ₹{Math.round(items.reduce((acc, curr) => acc + curr.price, 0) / items.length || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: The Graph */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[500px]">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Price Comparison (Top 10)</h3>
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-[#E68736]"></span>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Product Value</span>
              </div>
            </div>
            
            <div className="h-[400px]">
               <Line data={chartData} options={options} />
            </div>
          </div>

        </div>

        {/* Small Table Preview Below */}
        <div className="mt-12 bg-white rounded-[2.5rem] p-8 border border-gray-50 shadow-sm">
           <h3 className="text-lg font-black text-gray-800 mb-6">Top Performers Breakdown</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {items.slice(0, 4).map((p, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50 border border-gray-100">
                   <img src={p.images?.[0]} className="w-12 h-12 rounded-xl object-contain bg-white p-1" alt="" />
                   <div>
                     <p className="text-sm font-black text-gray-700 truncate w-32">{p.name}</p>
                     <p className="text-[#E68736] font-bold text-xs">₹{p.price.toLocaleString()}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
    
  );
}