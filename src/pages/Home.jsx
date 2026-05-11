import { useEffect, useState } from "react";
import UserDetails from "../components/user_details/UserDetails";
import Adminmain from "../components/dashboard/Adminmain";
import UserAnalysis from "../components/dashboard/userAnalysis";
import Ordergraph from "../components/dashboard/ordergraph";
import BestSellingAnalytics from "../components/dashboard/BestSellingAnalytics";
import { ProductService } from "../backend/ApiService";
import { BrandService } from "../backend/ApiService";
import { CategoryService } from "../backend/ApiService";
import { UserService } from "../backend/ApiService";
import { AnalyticsService } from "../backend/ApiService";
import apiClient from "../utils/apiClient";
import { API_ROUTES } from "../backend/ApiRoutes";

import {
  HiOutlineCube,
  HiOutlineTag,
  HiOutlineFolder,
  HiOutlineTrendingUp,
  HiOutlineUsers,
  HiOutlineShoppingBag,
} from "react-icons/hi";
import PageShell from "../components/ui/PageShell";

// ─── Count-Up Hook ────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1400, loading) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (loading || !target) return;
    const raw = typeof target === "string"
      ? parseFloat(target.replace(/[^0-9.]/g, ""))
      : target;
    if (!raw || isNaN(raw)) return;
    let start = 0;
    const steps = 50;
    const increment = raw / steps;
    const interval = duration / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= raw) { setDisplay(raw); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, interval);
    return () => clearInterval(timer);
  }, [target, loading]);
  return display;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ title, value, loading, icon, isTrend }) {
  const isRevenue = typeof value === "string" && value.startsWith("₹");
  const rawNumber = isRevenue
    ? parseFloat(value.replace(/[^0-9.]/g, ""))
    : typeof value === "number"
    ? value
    : parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
  const animated = useCountUp(rawNumber, 1400, loading);

  const fmt = (val) => {
    if (!val || val === 0) return "0";
    if (val >= 100000) return `${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return String(Math.round(val));
  };

  const displayValue = loading
    ? null
    : isRevenue
    ? `₹${fmt(animated)}`
    : fmt(animated);

  return (
    <div
      className="group relative bg-white rounded-2xl border border-orange-100 p-5 hover:border-orange-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* subtle background accent */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 60%)" }} />
      <div className="relative flex flex-col gap-3">
        <div className={`w-10 h-10 flex items-center justify-center rounded-xl text-lg font-bold
          ${isTrend ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}>
          {icon}
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{title}</p>
          <div className="text-xl font-black text-slate-800" style={{ fontFamily: "'Space Mono', monospace" }}>
            {loading
              ? <div className="h-6 w-16 bg-slate-100 animate-pulse rounded" />
              : displayValue}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-5"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {children}
    </h3>
  );
}

// ─── Panel wrapper ────────────────────────────────────────────────────────────
function Panel({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-[1.75rem] border border-orange-100 p-6 ${className}`}>
      {children}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const Shop = () => {
  const [counts, setCounts] = useState({
    products: 0, brands: 0, categories: 0, orders: 0, users: 0, revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          ProductService.getAllProducts(),
          BrandService.getAllBrands(),
          CategoryService.getCategories(),
          UserService.getAllUsers(),
          apiClient.get(API_ROUTES.ANALYTICS.ORDER_INSIGHTS + "?summary=true"),
        ]);
        const [products, brands, categories, users, orderRes] = results.map(
          (res) => (res.status === "fulfilled" ? res.value : null)
        );
        const rawData = orderRes?.data?.data ? orderRes.data.data : orderRes?.data;
        const analyticsArray = rawData?.analytics || [];
        let totalRevenue = 0;
        let totalOrders = 0;
        if (Array.isArray(analyticsArray) && analyticsArray.length > 0) {
          analyticsArray.forEach((item) => {
            totalRevenue += Number(item.totalRevenue || 0);
            totalOrders += Number(item.totalOrders || 0);
          });
        }
        setCounts({
          products: products?.data?.pagination?.totalItems || 0,
          brands: brands?.pagination?.totalBrands || 0,
          categories: categories?.length || 0,
          users: users?.length || 0,
          orders: totalOrders,
          revenue: totalRevenue,
        });
      } catch (error) {
        console.error("Dashboard primary fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const fmt = (val) => {
    if (!val || val === 0) return "0";
    if (val >= 100000) return `${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return String(val);
  };

  return (
    <PageShell title="Shop Overview" description="Real-time store metrics & growth" className="pb-10">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6 mb-7">
        <StatCard title="Products"   value={counts.products}               icon={<HiOutlineCube />}        loading={loading} />
        <StatCard title="Brands"     value={counts.brands}                 icon={<HiOutlineTag />}         loading={loading} />
        <StatCard title="Categories" value={counts.categories}             icon={<HiOutlineFolder />}      loading={loading} />
        <StatCard title="Revenue"    value={`₹${fmt(counts.revenue)}`}     icon={<HiOutlineTrendingUp />}  loading={loading} isTrend />
        <StatCard title="Users"      value={fmt(counts.users)}             icon={<HiOutlineUsers />}       loading={loading} />
        <StatCard title="Orders"     value={fmt(counts.orders)}            icon={<HiOutlineShoppingBag />} loading={loading} />
      </div>

      {/* ── Row 1: Library + User Sentiment ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        <Panel className="lg:col-span-8">
          <SectionTitle>Library Distribution</SectionTitle>
          <Adminmain />
        </Panel>
        <Panel className="lg:col-span-4">
          <SectionTitle>User Sentiment</SectionTitle>
          <UserAnalysis />
        </Panel>
      </div>

      {/* ── Row 2: Order Performance ── */}
      <Panel className="mb-5">
        <SectionTitle>Order Performance</SectionTitle>
        <Ordergraph />
      </Panel>


      {/* ── Row 3: Best Selling ── */}
      <Panel className="mb-5">
        <SectionTitle>Top Selling Products</SectionTitle>
        <BestSellingAnalytics />
      </Panel>

      {/* ── Row 4: Recent Users ── */}
      <div className="bg-white rounded-[1.75rem] border border-orange-100 overflow-hidden">
        <div className="px-6 pt-6 pb-0">
          <SectionTitle>Recent Users</SectionTitle>
        </div>
        <UserDetails />
      </div>

    </PageShell>
  );
};

export default Shop;