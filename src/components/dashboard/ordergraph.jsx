/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { Country, State } from 'country-state-city';
import { 
  Chart as ChartJS, ArcElement, Tooltip, Legend, Title 
} from 'chart.js';
import { 
  Search, MapPin, Globe, Loader2, TrendingUp, ShoppingBag, Target, ChevronDown 
} from "lucide-react";

// Service & UI Imports
import { AnalyticsService } from "../../backend/ApiService"; 
import { showAlert } from "../ui/Alert"; 

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const OrderAnalysis = () => {
  const [reportData, setReportData] = useState([]); 
  const [level, setLevel] = useState("state");
  const [loading, setLoading] = useState(false);
  
  const [countryCode, setCountryCode] = useState('IN'); 
  const [stateCode, setStateCode] = useState('');     
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Logic

const fetchOrderStats = async () => {
  setLoading(true);
  try {
    const selectedCountryName = Country.getCountryByCode(countryCode)?.name || 'India';
    const selectedStateName = stateCode 
      ? State.getStateByCodeAndCountry(stateCode, countryCode)?.name 
      : "";

    // This now receives the fixed object from AnalyticsService
    const result = await AnalyticsService.getOrderInsights(selectedCountryName, selectedStateName);
    
    // Update states correctly
    setReportData(result.reportData); // This is now the array: [{name: "Maharashtra", ...}]
    setLevel(result.level);
  } catch (err) {
    console.error("Order Analysis Fetch Error:", err);
    setReportData([]); 
    showAlert('Error', 'Failed to fetch regional order data.', 'error');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchOrderStats();
  }, [countryCode, stateCode]);

  // Data Processing
  const processedData = useMemo(() => {
    if (!Array.isArray(reportData)) return [];
    return reportData
      .filter(item => item.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, limit);
  }, [reportData, searchQuery, limit]);

  const topRegion = processedData[0] || null;
  const totalPeriodRevenue = processedData.reduce((acc, curr) => acc + (curr.totalRevenue || 0), 0);

  // Chart Configuration
  const chartData = {
    labels: processedData.map(item => item.name),
    datasets: [{
      data: processedData.map(item => item.totalRevenue),
      backgroundColor: [
        '#f97316', // orange-500
        '#fb923c', // orange-400
        '#fdba74', // orange-300
        '#1e293b', // slate-800
        '#475569', // slate-600
        '#94a3b8', // slate-400
      ],
      hoverOffset: 20,
      borderWidth: 2,
      borderColor: '#ffffff',
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: window.innerWidth < 768 ? 'bottom' : 'right',
        labels: {
          font: { weight: '800', size: 11, family: 'Inter' },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        callbacks: {
          label: (context) => ` Revenue: ₹${context.raw.toLocaleString()}`
        }
      }
    }
  };

  return (
    <div className="w-full space-y-8 p-2 md:p-6">
      
      {/* 1. FILTER SECTION */}
      <div className="bg-white p-6 rounded-[2.5rem]  border border-orange-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <FilterWrapper label="Country" icon={<Globe size={14}/>}>
            <select 
              value={countryCode}
              onChange={(e) => { setCountryCode(e.target.value); setStateCode(''); }}
              className="w-full pl-10 pr-8 py-3 bg-slate-50 border-none rounded-2xl text-[11px] font-black appearance-none outline-none focus:ring-2 ring-orange-100 cursor-pointer"
            >
              {Country.getAllCountries().map(c => (
                <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
              ))}
            </select>
          </FilterWrapper>

          <FilterWrapper label="State" icon={<MapPin size={14}/>}>
            <select 
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              className="w-full pl-10 pr-8 py-3 bg-slate-50 border-none rounded-2xl text-[11px] font-black appearance-none outline-none focus:ring-2 ring-orange-100 cursor-pointer"
            >
              <option value="">All States</option>
              {State.getStatesOfCountry(countryCode).map(s => (
                <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
              ))}
            </select>
          </FilterWrapper>

          <FilterWrapper label="Search Region" icon={<Search size={14}/>}>
            <input 
              type="text" 
              placeholder="Filter names..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-[11px] font-black outline-none focus:ring-2 ring-orange-100"
            />
          </FilterWrapper>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl h-[46px]">
            {[5, 10, 20].map(num => (
              <button 
                key={num}
                onClick={() => setLimit(num)} 
                className={`flex-1 rounded-xl text-[10px] font-black transition-all ${limit === num ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"}`}
              >
                TOP {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Statistics Left Column */}
        <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
          <StatCard title={`Lead ${level}`} value={topRegion ? topRegion.name : 'N/A'} icon={<TrendingUp size={20}/>} />
          <StatCard title="Total Revenue" value={`₹${totalPeriodRevenue.toLocaleString()}`} icon={<ShoppingBag size={20}/>} color="text-orange-600" bg="bg-orange-50" />
          
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-5 border-b border-gray-50 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase tracking-widest">Regional Breakdown</h3>
                <span className="text-[9px] bg-orange-500 px-2 py-0.5 rounded-full font-bold">LIVE</span>
             </div>
             <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-50">
                {processedData.length > 0 ? processedData.map((item, i) => (
                  <div key={i} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <span className="text-[10px] font-black text-slate-300">#{i+1}</span>
                    <div className="flex-1 px-3">
                      <p className="font-black text-slate-800 text-xs truncate">{item.name}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">Orders: {item.totalOrders || 0}</p>
                    </div>
                    <p className="font-black text-orange-600 text-xs">₹{item.totalRevenue?.toLocaleString()}</p>
                  </div>
                )) : (
                  <div className="p-10 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">No matching records</div>
                )}
             </div>
          </div>
        </div>

        {/* Graph Right Column */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-orange-200 p-8 flex flex-col min-h-[550px] order-1 lg:order-2">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Revenue Distribution</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Contribution by {level}</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Interactive UI</span>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20 backdrop-blur-sm rounded-[2.5rem]">
                <Loader2 className="animate-spin text-orange-500" size={40} />
              </div>
            )}
            
            <div className="w-full h-full">
              {processedData.length > 0 ? (
                <Pie data={chartData} options={chartOptions} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center space-y-3">
                   <Target size={48} className="text-slate-100" />
                   <p className="text-slate-300 font-black uppercase text-[10px] tracking-widest">Data Unavailable</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Sub-Components
function StatCard({ title, value, icon, color = "text-orange-600", bg = "bg-orange-50" }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-orange-200  flex items-center gap-5 hover:shadow-md transition-all">
      <div className={`p-4 rounded-2xl text-xl ${bg} ${color}`}>{icon}</div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
        <p className="text-xl font-black text-slate-800 tracking-tight leading-none">{value}</p>
      </div>
    </div>
  );
}

function FilterWrapper({ label, icon, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[9px] font-black text-slate-400 ml-2 uppercase tracking-widest">{label}</label>
      <div className="relative group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors z-10 pointer-events-none">
          {icon}
        </div>
        {children}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:rotate-180 transition-transform">
          <ChevronDown size={14} />
        </div>
      </div>
    </div>
  );
}

export default OrderAnalysis;