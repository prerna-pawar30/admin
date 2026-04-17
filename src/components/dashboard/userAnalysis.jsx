/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { Country, State, City } from 'country-state-city';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  Tooltip, Legend 
} from 'chart.js';

// Import your service and the SweetAlert utility we discussed
import { AnalyticsService } from '../../backend/ApiService'; 
import { showAlert } from '../ui/Alert'; 

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
const countryList = Country.getAllCountries();
const IpAnalyticsDashboard = () => {
  const [countryCode, setCountryCode] = useState('IN');
  const [stateCode, setStateCode] = useState('GJ');
  const [cityName, setCityName] = useState('');
  const [topLimit, setTopLimit] = useState('10');

  const [displayData, setDisplayData] = useState([]);
  const [stats, setStats] = useState({ totalIps: 0, totalHits: 0, thisMonth: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Prepare human-readable names from codes for the backend
        const countryName = Country.getCountryByCode(countryCode)?.name || '';
        const stateName = State.getStateByCodeAndCountry(stateCode, countryCode)?.name || '';
        const currentMonth = new Date().toISOString().slice(0, 7);
        // Proper Service Call
        const data = await AnalyticsService.getIpStats({
          
          month: currentMonth,
          countryValue: countryName,
          stateValue: stateName,
          cityName: cityName || undefined,
          country: !!countryCode,
          state: !!stateCode,
          city: !!cityName,
          top: topLimit
        });

        // Destructure returned data from Service
        setDisplayData(data.displayData || []);
        setStats(data.stats || { totalIps: 0, totalHits: 0, thisMonth: 0 });

      } catch (err) {
        console.error("IP Fetch Error:", err);
        showAlert('Error', 'No data found for this selection.', 'info');
        // Reset data on error so the UI shows "No data" instead of crashing
        setDisplayData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [countryCode, stateCode, cityName, topLimit]);

  const chartConfig = useMemo(() => {
    return {
      labels: displayData.map(item => `${item.city || 'Unknown'}, ${item.state || ''}`),
      datasets: [{
        label: 'Hits',
        data: displayData.map(item => item.hits),
        geoDetails: displayData.map(item => ({
          ip: item._id, 
          country: item.country,
          state: item.state,
          city: item.city
        })),
        // Orange Gradient aesthetic
        backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, '#f97316'); // orange-500
            gradient.addColorStop(1, '#f9ad51'); // amber-400
            return gradient;
        },
        hoverBackgroundColor: '#ea580c', // orange-600
        borderRadius: 8,
        barThickness: 24,
      }]
    };
  }, [displayData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (context) => {
            const dataIndex = context[0].dataIndex;
            return `IP: ${context[0].dataset.geoDetails[dataIndex].ip}`;
          },
          label: (context) => ` Hits: ${context.raw}`,
          afterLabel: (context) => {
            const geo = context.dataset.geoDetails[context.dataIndex];
            return [
              ` Location: ${geo.city}, ${geo.state}`,
              ` Country: ${geo.country}`
            ];
          }
        },
        backgroundColor: '#1f2937', // charcoal-800
        titleColor: '#fbbf24', // amber-400 title for pop
        padding: 12,
        cornerRadius: 12,
        bodyFont: { size: 11 },
        titleFont: { size: 12, weight: 'bold' }
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { font: { size: 9, weight: 'bold' }, color: '#9ca3af' } },
      x: { 
        grid: { display: false }, 
        ticks: { 
          font: { size: 9, weight: 'bold' },
          color: '#6b7280',
          maxRotation: 45,
          minRotation: 45 
        } 
      }
    }
  };

  return (
    <div className="p-4 min-h-screen flex items-center justify-center  font-sans">
      <div className="w-full max-w-4xl bg-white overflow-hidden ">
        
        {/* HEADER & FILTERS */}
        <div className="p-8 border-b border-orange-50">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Visitors Analytics</h1>
                <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                    <p className="text-orange-600 text-[10px] uppercase font-black tracking-widest">Geo-Traffic live monitoring</p>
                </div>
              </div>
              <select 
                value={topLimit}
                onChange={(e) => setTopLimit(e.target.value)}
                className="bg-orange-50 text-orange-600 text-xs font-black py-2 px-4 rounded-2xl outline-none border-none cursor-pointer hover:bg-orange-100 transition-colors"
              >
                <option value="5">TOP 5 VISITS</option>
                <option value="10">TOP 10 VISITS</option>
                <option value="20">TOP 20 VISITS</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 ml-2 tracking-widest uppercase">Country</label>
                <select 
                  value={countryCode}
                  onChange={(e) => {
                    setCountryCode(e.target.value);
                    setStateCode(''); 
                    setCityName('');
                  }}
                  className="bg-gray-50 text-xs font-bold p-3 rounded-2xl outline-none border border-transparent focus:border-orange-200 focus:bg-white transition-all shadow-sm"
                >
                 {countryList.map(c => (
                  <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 ml-2 tracking-widest uppercase">State</label>
                <select 
                  value={stateCode}
                  disabled={!countryCode}
                  onChange={(e) => {
                    setStateCode(e.target.value);
                    setCityName(''); 
                  }}
                  className="bg-gray-50 text-xs font-bold p-3 rounded-2xl outline-none border border-transparent focus:border-orange-200 focus:bg-white transition-all shadow-sm disabled:opacity-40"
                >
                  <option value="">Select State</option>
                  {State.getStatesOfCountry(countryCode).map(s => (
                    <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 ml-2 tracking-widest uppercase">City</label>
                <select 
                  value={cityName}
                  disabled={!stateCode}
                  onChange={(e) => setCityName(e.target.value)}
                  className="bg-gray-50 text-xs font-bold p-3 rounded-2xl outline-none border border-transparent focus:border-orange-200 focus:bg-white transition-all shadow-sm disabled:opacity-40"
                >
                  <option value="">All Cities</option>
                  {City.getCitiesOfState(countryCode, stateCode).map(city => (
                    <option key={city.name} value={city.name}>{city.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* CHART BODY */}
        <div className="px-8 py-6">
          <div className="h-[300px] w-full relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {displayData.length > 0 ? (
              <Bar data={chartConfig} options={options} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-orange-50 rounded-[2rem] bg-orange-50/10">
                <svg className="w-12 h-12 mb-2 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A2 2 0 013 15.382V6m0 0l5.447 2.724A2 2 0 0010 8V17.382m0-11.382l5.447-2.724A2 2 0 0117 3m0 0l5.447 2.724A2 2 0 0123 7.618V17m0 0l-5.447-2.724A2 2 0 0016 16V6.618M16 16l-5.447 2.724A2 2 0 019 20"></path></svg>
                <p className="text-xs font-bold uppercase tracking-widest">No IP data for this region</p>
              </div>
            )}
          </div>
          <p className="text-center text-[10px] text-orange-400 font-bold mt-4 uppercase tracking-tighter opacity-70">
            Interactive Map: Hover over data points for deep-dive IP metadata
          </p>
        </div>

        {/* SUMMARY TILES */}
        <div className="grid grid-cols-3 gap-0 border-t border-orange-50">
          <div className="p-6 text-center border-r border-orange-50 group hover:bg-orange-50/30 transition-colors">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Network IPs</p>
            <p className="text-2xl font-black text-gray-900 group-hover:text-orange-600 transition-colors">{stats.totalIps.toLocaleString()}</p>
          </div>
          <div className="p-6 text-center border-r border-orange-50 bg-orange-500 group transition-all">
            <p className="text-[10px] font-black text-orange-100 uppercase tracking-widest mb-1">Aggregate Hits</p>
            <p className="text-2xl font-black text-white">{stats.totalHits.toLocaleString()}</p>
          </div>
          <div className="p-6 text-center group hover:bg-orange-50/30 transition-colors">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">M-T-D Traffic</p>
            <p className="text-2xl font-black text-gray-900 group-hover:text-orange-600 transition-colors">{stats.thisMonth.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IpAnalyticsDashboard;