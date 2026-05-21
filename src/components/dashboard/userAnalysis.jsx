/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { Country, State, City } from "country-state-city";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Tooltip, Legend
} from "chart.js";
import { Globe, MapPin, Building2 } from "lucide-react"; // Useful matching context icons

import { AnalyticsService } from "../../backend/ApiService";
import { showAlert } from "../ui/Alert";
import DropdownGroup from "../../components/ui/DropdownGroup"; // Reusable unified dropdown component

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const ORANGE  = '#e65100';
const ORANGE2 = '#fb923c';
const SLATE   = '#1e293b';
const SLATE2  = '#475569';
const SLATE3  = '#94a3b8';

const countryList = Country.getAllCountries();

const IpAnalyticsDashboard = () => {
  const [countryCode, setCountryCode] = useState("IN");
  const [stateCode, setStateCode]     = useState("GJ");
  const [cityName, setCityName]       = useState("");
  const [topLimit, setTopLimit]       = useState("10");
  const [displayData, setDisplayData] = useState([]);
  const [stats, setStats]             = useState({ totalIps: 0, totalHits: 0, thisMonth: 0 });
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const countryName  = Country.getCountryByCode(countryCode)?.name || "";
        const stateName    = State.getStateByCodeAndCountry(stateCode, countryCode)?.name || "";
        const currentMonth = new Date().toISOString().slice(0, 7);
        const data = await AnalyticsService.getIpStats({
          month: currentMonth,
          countryValue: countryName,
          stateValue: stateName,
          cityName: cityName || undefined,
          country: !!countryCode,
          state: !!stateCode,
          city: !!cityName,
          top: topLimit,
        });
        setDisplayData(data.displayData || []);
        setStats(data.stats || { totalIps: 0, totalHits: 0, thisMonth: 0 });
      } catch (err) {
        console.error("IP Fetch Error:", err);
        showAlert("Error", "No data found for this selection.", "info");
        setDisplayData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [countryCode, stateCode, cityName, topLimit]);

  // Transform location lists into required dropdown option structures
  const countryOptions = useMemo(() => {
    return countryList.map(c => ({ value: c.isoCode, label: c.name }));
  }, []);

  const stateOptions = useMemo(() => {
    if (!countryCode) return [];
    const states = State.getStatesOfCountry(countryCode).map(s => ({
      value: s.isoCode,
      label: s.name
    }));
    return [{ value: "", label: "Select state" }, ...states];
  }, [countryCode]);

  const cityOptions = useMemo(() => {
    if (!countryCode || !stateCode) return [];
    const cities = City.getCitiesOfState(countryCode, stateCode).map(c => ({
      value: c.name,
      label: c.name
    }));
    return [{ value: "", label: "All cities" }, ...cities];
  }, [countryCode, stateCode]);

  const chartConfig = useMemo(() => ({
    labels: displayData.map(i => `${i.city || "Unknown"}, ${i.state || ""}`),
    datasets: [{
      label: "Hits",
      data: displayData.map(i => i.hits),
      geoDetails: displayData.map(i => ({
        ip: i._id, country: i.country, state: i.state, city: i.city
      })),
      backgroundColor: ORANGE,
      hoverBackgroundColor: '#c0440a',
      borderRadius: 8,
      barThickness: 22,
    }]
  }), [displayData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (ctx) => `IP: ${ctx[0].dataset.geoDetails[ctx[0].dataIndex].ip}`,
          label: (ctx) => ` Hits: ${ctx.raw}`,
          afterLabel: (ctx) => {
            const geo = ctx.dataset.geoDetails[ctx.dataIndex];
            return [` Location: ${geo.city}, ${geo.state}`, ` Country: ${geo.country}`];
          }
        },
        backgroundColor: SLATE,
        padding: 12,
        cornerRadius: 10,
        bodyFont: { size: 11 },
        titleFont: { size: 11, weight: "bold", family: "'Space Mono', monospace" },
        titleColor: ORANGE2,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.04)" },
        ticks: { font: { size: 9, weight: "700" }, color: SLATE3 }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 9, weight: "700" }, color: SLATE2, maxRotation: 40, minRotation: 40 }
      }
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="w-full">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: ORANGE }} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', color: ORANGE }}>
              Geo-traffic live monitoring
            </span>
          </div>
        </div>
        {/* Top-limit toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {["5", "10", "20"].map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setTopLimit(v)}
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '9px',
                fontWeight: '700',
                padding: '5px 10px',
                borderRadius: '8px',
                border: topLimit === v ? '0.5px solid rgba(0,0,0,0.1)' : 'none',
                background: topLimit === v ? '#fff' : 'transparent',
                color: topLimit === v ? SLATE : SLATE3,
                cursor: 'pointer',
                boxShadow: topLimit === v ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              TOP {v}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filters Integrated with DropdownGroup ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5 items-end">
        <DropdownGroup
          label="Country"
          icon={<Globe size={13} />}
          value={countryCode}
          options={countryOptions}
          onChange={(val) => { 
            setCountryCode(val); 
            setStateCode(""); 
            setCityName(""); 
          }}
        />

        <DropdownGroup
          label="State"
          icon={<MapPin size={13} />}
          value={stateCode}
          options={stateOptions}
          disabled={!countryCode}
          onChange={(val) => { 
            setStateCode(val); 
            setCityName(""); 
          }}
        />

        <DropdownGroup
          label="City"
          icon={<Building2 size={13} />}
          value={cityName}
          options={cityOptions}
          disabled={!stateCode}
          onChange={(val) => setCityName(val)}
        />
      </div>

      {/* ── Chart ── */}
      <div className="relative h-[220px] w-full mb-1">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-sm rounded-xl">
            <div className="w-8 h-8 border-[3px] rounded-full animate-spin" style={{ borderColor: `${ORANGE} transparent transparent transparent` }} />
          </div>
        )}
        {displayData.length > 0 ? (
          <Bar data={chartConfig} options={options} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-100 bg-orange-50/10">
            <svg className="w-10 h-10 mb-2" style={{ color: '#fed7aa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A2 2 0 013 15.382V6m0 0l5.447 2.724A2 2 0 0010 8V17.382m0-11.382l5.447-2.724A2 2 0 0117 3m0 0l5.447 2.724A2 2 0 0123 7.618V17m0 0l-5.447-2.724A2 2 0 0016 16V6.618M16 16l-5.447 2.724A2 2 0 019 20" />
            </svg>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: SLATE3 }}>
              No IP data for this region
            </p>
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', fontSize: '9px', fontWeight: '700', color: '#fdba74', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px', fontFamily: "'Space Mono', monospace" }}>
        Hover over bars for deep-dive IP metadata
      </p>

      {/* ── Summary tiles ── */}
      <div className="grid grid-cols-3 border-t border-orange-100 -mx-6 px-6 pt-4 mt-2">
        <SummaryTile label="Network IPs"    value={stats.totalIps.toLocaleString()} />
        <SummaryTile label="Aggregate hits" value={stats.totalHits.toLocaleString()} accent />
        <SummaryTile label="MTD traffic"    value={stats.thisMonth.toLocaleString()} />
      </div>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────
function SummaryTile({ label, value, accent }) {
  const ORANGE = '#e65100';
  const SLATE3 = '#94a3b8';
  return (
    <div
      className="py-4 text-center"
      style={accent ? { background: ORANGE, borderRadius: '12px', margin: '0 4px' } : {}}
    >
      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: accent ? 'rgba(255,255,255,0.75)' : SLATE3, marginBottom: '4px' }}>
        {label}
      </p>
      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '18px', fontWeight: '700', color: accent ? '#fff' : '#1e293b' }}>
        {value}
      </p>
    </div>
  );
}

export default IpAnalyticsDashboard;