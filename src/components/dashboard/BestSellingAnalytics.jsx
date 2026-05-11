import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend
} from "chart.js";
import { Line } from "react-chartjs-2";
import { TrendingUp, Package, DollarSign, Loader2 } from "lucide-react";

const BackendUrl = import.meta.env.VITE_API_BASE_URL;

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const ORANGE  = '#e65100';
const SLATE   = '#1e293b';
const SLATE3  = '#94a3b8';

export default function BestSellingAnalytics() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBest = async () => {
      try {
        const res = await axios.get(`${BackendUrl}/api/v1/product/best-selling`);
        if (res.data.success) setItems(res.data.data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBest();
  }, []);

  const top10 = items.slice(0, 10);
  const avgPrice = items.length
    ? Math.round(items.reduce((a, c) => a + c.price, 0) / items.length)
    : 0;

  const chartData = {
    labels: top10.map(p => p.name.length > 12 ? p.name.slice(0, 12) + ".." : p.name),
    datasets: [{
      label: "Price Value",
      data: top10.map(p => p.price),
      fill: true,
      borderColor: ORANGE,
      backgroundColor: "rgba(230,101,0,0.07)",
      tension: 0.45,
      pointRadius: 5,
      pointBackgroundColor: ORANGE,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      borderWidth: 2.5,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: SLATE,
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (ctx) => ` ₹${ctx.raw.toLocaleString()}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: "rgba(0,0,0,0.04)" },
        ticks: {
          font: { size: 9, weight: '700' },
          color: SLATE3,
          callback: (v) => "₹" + v.toLocaleString()
        }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 9, weight: '700' }, color: '#475569', maxRotation: 35, minRotation: 35 }
      }
    },
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-orange-500" size={32} />
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Stats */}
        <div className="flex flex-col gap-4">

          {/* Title card */}
          <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-6">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="text-orange-600" size={20} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 leading-tight">
              Sales<br />
              <span style={{ color: ORANGE }}>Performance</span>
            </h2>
            <p className="text-slate-400 mt-3 text-xs font-medium leading-relaxed">
              Analysis of the top {items.length} best-performing products in your catalog.
            </p>
          </div>

          {/* Metrics card */}
          <div className="rounded-2xl p-6 text-white" style={{ background: ORANGE }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <Package size={18} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/70">Total products</p>
                <p className="text-2xl font-black" style={{ fontFamily: "'Space Mono', monospace" }}>
                  {items.length}
                </p>
              </div>
            </div>
            <div className="border-t border-white/20 pt-5 flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <DollarSign size={18} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/70">Avg price</p>
                <p className="text-2xl font-black" style={{ fontFamily: "'Space Mono', monospace" }}>
                  ₹{avgPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Chart */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-5">
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', color: SLATE3 }}>
              Price comparison (top 10)
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: ORANGE }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
                Product value
              </span>
            </div>
          </div>
          <div style={{ height: '260px', width: '100%' }}>
            <Line data={chartData} options={options} />
          </div>
        </div>
      </div>

      {/* Bottom: Top 4 product cards */}
      {items.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', color: SLATE3, marginBottom: '14px' }}>
            Top performers
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {items.slice(0, 4).map((p, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/60 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-200">
                <img
                  src={p.images?.[0]}
                  className="w-11 h-11 rounded-xl object-contain bg-white p-1 border border-slate-100"
                  alt={p.name}
                />
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-700 truncate">{p.name}</p>
                  <p className="text-xs font-bold mt-0.5" style={{ color: ORANGE, fontFamily: "'Space Mono', monospace" }}>
                    ₹{p.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}