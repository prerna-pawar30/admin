import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { AnalyticsService } from '../../backend/ApiService';
import { BarChart3, Clock, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// ─── Shared token constants ────────────────────────────────────────────────────
const ORANGE   = '#e65100';
const ORANGE2  = '#fb923c';
const ORANGE3  = '#fed7aa';
const SLATE    = '#1e293b';
const SLATE2   = '#475569';
const SLATE3   = '#94a3b8';

const BAR_COLORS = [ORANGE, ORANGE2, ORANGE3, SLATE, SLATE2, SLATE3, '#cbd5e1', '#e2e8f0'];

const FinalAnalyticsDashboard = () => {
  const [category, setCategory]     = useState('GEN');
  const [timeframe, setTimeframe]   = useState('30');
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const groupedData = await AnalyticsService.getLibraryStats(category, timeframe);
        setDisplayData(groupedData);
      } catch (err) {
        console.error('Dashboard Fetch Error:', err);
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
      backgroundColor: displayData.map((_, i) => BAR_COLORS[i % BAR_COLORS.length]),
      borderWidth: 0,
      borderRadius: 10,
      barThickness: 30,
    }]
  }), [displayData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: SLATE,
        padding: 12,
        cornerRadius: 10,
        titleFont: { size: 12, weight: 'bold', family: "'Space Mono', monospace" },
        bodyFont: { size: 11 },
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { font: { size: 10, weight: '700' }, color: SLATE3 }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, weight: '700' }, color: SLATE2 }
      }
    }
  };

  const totalInteractions = displayData.reduce((a, c) => a + c.usageCount, 0);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {/* Category tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          {['GEN', 'SCR', 'ABT'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-4 py-1.5 rounded-lg transition-all duration-200"
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '10px',
                fontWeight: '700',
                background: category === cat ? '#fff' : 'transparent',
                color: category === cat ? SLATE : SLATE3,
                border: category === cat ? `0.5px solid rgba(0,0,0,0.1)` : 'none',
                boxShadow: category === cat ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Timeframe */}
        <div className="relative flex items-center">
          <Clock size={13} className="absolute left-3 text-orange-500 pointer-events-none" />
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="pl-8 pr-4 py-2 rounded-xl outline-none appearance-none cursor-pointer"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              fontWeight: '700',
              background: '#fff7ed',
              color: ORANGE,
              border: '0.5px solid #fed7aa',
            }}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-[260px] w-full">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-sm rounded-2xl">
            <Loader2 className="animate-spin text-orange-500" size={28} />
          </div>
        )}
        {displayData.length > 0 ? (
          <Bar data={chartConfig} options={options} />
        ) : !loading && (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/40">
            <AlertCircle size={36} className="mb-2 opacity-30" />
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              No matching records found
            </p>
          </div>
        )}
      </div>

      {/* Footer Summary */}
      <div className="grid grid-cols-3 border-t border-slate-100 mt-5 pt-4">
        <FooterStat label="Unique brands" value={displayData.length} />
        <FooterStat label="Most popular" value={displayData[0]?.brandName || '—'} highlight />
        <FooterStat label="Total interactions" value={totalInteractions.toLocaleString()} />
      </div>
    </div>
  );
};

function FooterStat({ label, value, highlight }) {
  return (
    <div className={`text-center px-3 ${highlight ? 'border-x border-slate-100' : ''}`}>
      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8', marginBottom: '4px' }}>
        {label}
      </p>
      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '16px', fontWeight: '700', color: highlight ? ORANGE : '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value}
      </p>
    </div>
  );
}

const ORANGE_CONST = '#e65100';
export default FinalAnalyticsDashboard;