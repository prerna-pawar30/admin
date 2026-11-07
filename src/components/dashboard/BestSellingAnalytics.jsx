import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import { Package, Trophy } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const BackendUrl = import.meta.env.VITE_API_BASE_URL;

/**
 * Top Selling Products — horizontal bar chart with track bars and value labels.
 * Bars show units sold when the API sends a sales count, otherwise price.
 */

const BRAND = "#ea580c";
const TRACK = "#f1f5f9";
const ROW_HEIGHT = 60;

const formatINR = (v = 0) => `₹${Number(v || 0).toLocaleString("en-IN")}`;
const soldOf = (p) => p.totalSold ?? p.sold ?? p.soldCount ?? p.salesCount ?? p.totalQuantity ?? null;

// Draws the value at the right end of every row
const valueLabelsPlugin = {
  id: "valueLabels",
  afterDatasetsDraw(chart, _args, opts) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    const data = chart.data.datasets[0]?.data || [];
    ctx.save();
    ctx.font = "600 13px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    meta.data.forEach((bar, i) => {
      ctx.fillText(opts.format ? opts.format(data[i]) : String(data[i]), chart.width - 2, bar.y);
    });
    ctx.restore();
  },
};

export default function BestSellingAnalytics({ limit = 6 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBest = async () => {
      try {
        const res = await axios.get(`${BackendUrl}/api/v1/product/best-selling`);
        if (res.data?.success && Array.isArray(res.data.data)) setItems(res.data.data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBest();
  }, []);

  const { top, hasSales, values, maxValue, total, stats } = useMemo(() => {
    const hasSales = items.some((p) => soldOf(p) != null);
    const top = items.slice(0, limit);
    const values = top.map((p) => Number(hasSales ? soldOf(p) || 0 : p.price || 0));
    const prices = items.map((p) => Number(p.price || 0));
    return {
      top,
      hasSales,
      values,
      maxValue: Math.max(1, ...values),
      total: values.reduce((a, b) => a + b, 0),
      stats: {
        count: items.length,
        avg: prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
        highest: prices.length ? Math.max(...prices) : 0,
      },
    };
  }, [items, limit]);

  const formatValue = (v) => (hasSales ? `${Number(v).toLocaleString("en-IN")} sold` : formatINR(v));

  const chartData = useMemo(
    () => ({
      labels: top.map((p, i) => {
        const name = p.name || "Untitled";
        return `${i + 1}.  ${name.length > 18 ? `${name.slice(0, 18)}…` : name}`;
      }),
      datasets: [
        {
          // actual value (drawn on top)
          data: values,
          backgroundColor: BRAND,
          hoverBackgroundColor: "#c2410c",
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 14,
          grouped: false,
          order: 1,
        },
        {
          // grey track (full width, behind)
          data: values.map(() => maxValue),
          backgroundColor: TRACK,
          hoverBackgroundColor: TRACK,
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 14,
          grouped: false,
          order: 2,
        },
      ],
    }),
    [top, values, maxValue]
  );

  const options = useMemo(
    () => ({
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 700, easing: "easeOutQuart" },
      layout: { padding: { right: hasSales ? 72 : 64 } },
      plugins: {
        legend: { display: false },
        valueLabels: { format: formatValue },
        tooltip: {
          filter: (item) => item.datasetIndex === 0,
          backgroundColor: "#0f172a",
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
          titleFont: { size: 12, weight: "600" },
          bodyFont: { size: 12 },
          callbacks: {
            title: (ctx) => top[ctx[0].dataIndex]?.name || "",
            label: (ctx) => {
              const p = top[ctx.dataIndex];
              const share = total ? Math.round((values[ctx.dataIndex] / total) * 100) : 0;
              const lines = [`Price: ${formatINR(p?.price)}`, `Share: ${share}%`];
              if (hasSales) lines.unshift(`Units sold: ${Number(soldOf(p) || 0).toLocaleString("en-IN")}`);
              return lines;
            },
          },
        },
      },
      scales: {
        x: { display: false, min: 0, max: maxValue },
        y: {
          border: { display: false },
          grid: { display: false },
          ticks: {
            padding: 12,
            font: { size: 13, weight: "500" },
            color: "#334155",
          },
        },
      },
    }),
    [top, values, maxValue, total, hasSales]
  );

  const leader = top[0];
  const leaderShare = total ? Math.round((values[0] / total) * 100) : 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Summary strip (matches Recent Users) */}
      <div className="grid grid-cols-3 divide-x divide-slate-200/70 rounded-xl border border-slate-100 bg-slate-50/60">
        {[
          { label: "Products", value: stats.count },
          { label: "Avg price", value: formatINR(stats.avg) },
          { label: "Highest", value: formatINR(stats.highest) },
        ].map((s) => (
          <div key={s.label} className="min-w-0 px-3 py-3 text-center">
            {loading ? (
              <div className="mx-auto h-6 w-14 animate-pulse rounded bg-slate-200/70" />
            ) : (
              <p className="truncate text-lg font-bold leading-none text-slate-900 tabular-nums sm:text-xl">{s.value}</p>
            )}
            <p className="mt-1.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Chart header */}
      <div className="mt-5 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {hasSales ? "Units sold by product" : "Price by product"}
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {hasSales ? "Sold" : "Price"}
        </p>
      </div>

      {/* Chart */}
      <div className="mt-2">
        {loading ? (
          <div className="space-y-5 py-3">
            {[90, 70, 55, 40].map((w, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                <div className="h-3 animate-pulse rounded-full bg-slate-100" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        ) : top.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Package size={18} />
            </span>
            <p className="text-sm font-semibold text-slate-700">No sales data yet</p>
            <p className="mt-0.5 text-xs text-slate-400">Best sellers will appear once orders come in.</p>
          </div>
        ) : (
          <div style={{ height: top.length * ROW_HEIGHT + 8 }}>
            <Bar data={chartData} options={options} plugins={[valueLabelsPlugin]} />
          </div>
        )}
      </div>

      {/* Insight footer — pinned to bottom so the card height matches its neighbour */}
      {!loading && leader && (
        <div className="mt-auto pt-4">
          <div className="flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50/50 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-orange-600 shadow-sm ring-1 ring-orange-100">
              <Trophy size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                {leader.name} <span className="font-normal text-slate-500">is your top performer</span>
              </p>
              <p className="text-xs text-slate-500">
                {formatValue(values[0])} · {leaderShare}% of top {top.length} {hasSales ? "sales" : "value"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}