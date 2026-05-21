/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { Country, State } from "country-state-city";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { MapPin, Globe, Loader2, TrendingUp, ShoppingBag, Target } from "lucide-react";

import { AnalyticsService } from "../../backend/ApiService";
import { showAlert } from "../ui/Alert";
import DropdownGroup from "../../components/ui/DropdownGroup"; // Reusable unified dropdown component

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const ORANGE  = '#e65100';
const ORANGE2 = '#fb923c';
const ORANGE3 = '#fed7aa';
const SLATE   = '#1e293b';
const SLATE2  = '#475569';
const SLATE3  = '#94a3b8';
const PIE_COLORS = [ORANGE, ORANGE2, ORANGE3, SLATE, SLATE2, SLATE3];

const OrderAnalysis = () => {
  const [reportData, setReportData]   = useState([]);
  const [level, setLevel]             = useState("state");
  const [loading, setLoading]         = useState(false);
  const [countryCode, setCountryCode] = useState("IN");
  const [stateCode, setStateCode]     = useState("");
  const [limit, setLimit]             = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrderStats = async () => {
    setLoading(true);
    try {
      const selectedCountryName = Country.getCountryByCode(countryCode)?.name || "India";
      const selectedStateName   = stateCode
        ? State.getStateByCodeAndCountry(stateCode, countryCode)?.name
        : "";
      const result = await AnalyticsService.getOrderInsights(selectedCountryName, selectedStateName);
      setReportData(result.reportData);
      setLevel(result.level);
    } catch (err) {
      console.error("Order Analysis Fetch Error:", err);
      setReportData([]);
      showAlert("Error", "Failed to fetch regional order data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrderStats(); }, [countryCode, stateCode]);

  const processedData = useMemo(() => {
    if (!Array.isArray(reportData)) return [];
    return reportData
      .filter(item => item.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, limit);
  }, [reportData, searchQuery, limit]);

  const topRegion          = processedData[0] || null;
  const totalPeriodRevenue = processedData.reduce((a, c) => a + (c.totalRevenue || 0), 0);

  // Map country-state-city utilities to fit option signatures expected by DropdownGroup
  const countryOptions = useMemo(() => {
    return Country.getAllCountries().map(c => ({
      value: c.isoCode,
      label: c.name
    }));
  }, []);

  const stateOptions = useMemo(() => {
    const states = State.getStatesOfCountry(countryCode).map(s => ({
      value: s.isoCode,
      label: s.name
    }));
    return [{ value: "", label: "All States" }, ...states];
  }, [countryCode]);

  const chartData = {
    labels: processedData.map(i => i.name),
    datasets: [{
      data: processedData.map(i => i.totalRevenue),
      backgroundColor: PIE_COLORS,
      hoverOffset: 16,
      borderWidth: 3,
      borderColor: "#ffffff",
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { weight: "700", size: 10, family: "'DM Sans', sans-serif" },
          padding: 16,
          usePointStyle: true,
          pointStyle: "circle",
          color: SLATE2,
        }
      },
      tooltip: {
        backgroundColor: SLATE,
        padding: 12,
        cornerRadius: 10,
        titleFont: { size: 12, weight: "bold" },
        callbacks: {
          label: (ctx) => ` Revenue: ₹${ctx.raw.toLocaleString()}`
        }
      }
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="w-full space-y-5">

      {/* ── Filters with Refactored Dropdowns ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        
        <DropdownGroup
          label="Country"
          icon={<Globe size={13} />}
          value={countryCode}
          options={countryOptions}
          onChange={(val) => { 
            setCountryCode(val); 
            setStateCode(""); 
          }}
        />

        <DropdownGroup
          label="State"
          icon={<MapPin size={13} />}
          value={stateCode}
          options={stateOptions}
          onChange={(val) => setStateCode(val)}
        />

        {/* Limit toggle styling explicitly maintained */}
        <div className="flex flex-col gap-1.5">
          <span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: SLATE3, marginLeft: '4px' }}>
            Show top
          </span>
          <div className="flex bg-slate-100 p-1 rounded-xl h-[40px]">
            {[5, 10, 20].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setLimit(n)}
                className="flex-1 rounded-lg text-center transition-all duration-200"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '9px',
                  fontWeight: '700',
                  background: limit === n ? '#fff' : 'transparent',
                  color: limit === n ? SLATE : SLATE3,
                  border: limit === n ? '0.5px solid rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  boxShadow: limit === n ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Dashboard grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left column */}
        <div className="lg:col-span-4 space-y-4 order-2 lg:order-1">
          {/* Lead region */}
          <MetricCard
            label={`Lead ${level}`}
            value={topRegion ? topRegion.name : "N/A"}
            icon={<TrendingUp size={18} />}
          />
          {/* Total revenue */}
          <MetricCard
            label="Total revenue"
            value={`₹${totalPeriodRevenue.toLocaleString()}`}
            icon={<ShoppingBag size={18} />}
            accent
          />

          {/* Regional breakdown list */}
          <div className="rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3" style={{ background: SLATE }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8' }}>
                Regional breakdown
              </span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ background: ORANGE, fontSize: '8px', fontWeight: '700', color: '#fff', fontFamily: "'Space Mono', monospace" }}>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block" />
                LIVE
              </span>
            </div>
            <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-50">
              {processedData.length > 0 ? processedData.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50/30 transition-colors">
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', fontWeight: '700', color: SLATE3, minWidth: '20px' }}>
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 text-xs truncate">{item.name}</p>
                    <p style={{ fontSize: '8px', fontWeight: '700', color: SLATE3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Orders: {item.totalOrders || 0}
                    </p>
                  </div>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: '700', color: ORANGE, whiteSpace: 'nowrap' }}>
                    ₹{item.totalRevenue?.toLocaleString()}
                  </p>
                </div>
              )) : (
                <div className="py-10 text-center" style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', color: SLATE3, letterSpacing: '0.12em' }}>
                  No matching records
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Pie chart */}
        <div className="lg:col-span-8 rounded-2xl border border-orange-100 p-6 flex flex-col order-1 lg:order-2 min-h-[480px]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="font-black text-slate-800 text-sm">Revenue distribution</h3>
              <p style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: SLATE3, marginTop: '3px' }}>
                Contribution by {level}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ORANGE }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', fontWeight: '700', color: SLATE3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Interactive
              </span>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20 backdrop-blur-sm rounded-2xl">
                <Loader2 className="animate-spin text-orange-500" size={36} />
              </div>
            )}
            {processedData.length > 0 ? (
              <Pie data={chartData} options={chartOptions} />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3">
                <Target size={44} className="text-slate-100" />
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', fontWeight: '700', color: SLATE3, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  Data unavailable
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────
function MetricCard({ label, value, icon, accent }) {
  const ORANGE = '#e65100';
  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-sm ${accent ? 'border-orange-200 bg-orange-50/40' : 'border-slate-100'}`}>
      <div className={`p-2.5 rounded-xl ${accent ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
        {icon}
      </div>
      <div>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', marginBottom: '3px' }}>
          {label}
        </p>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '17px', fontWeight: '700', color: accent ? ORANGE : '#1e293b' }}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default OrderAnalysis;