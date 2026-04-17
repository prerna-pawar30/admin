import { useEffect, useState } from "react";
import UserDetails from "../components/user_details/UserDetails";
import Adminmain from "../components/dashboard/Adminmain";
import UserAnalysis from "../components/dashboard/userAnalysis";
import Ordergraph from "../components/dashboard/ordergraph";
import BestSellingAnalytics from "../components/dashboard/BestSellingAnalytics";

// Import your centralized services
import { ProductService } from "../backend/ApiService"; 
import { BrandService } from "../backend/ApiService";
import { CategoryService } from "../backend/ApiService";
import { UserService } from "../backend/ApiService";
import { AnalyticsService } from "../backend/ApiService";
import apiClient from "../utils/apiClient"; // Keep for custom dashboard call
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

const Shop = () => {
  const [counts, setCounts] = useState({
    products: 0, brands: 0, categories: 0, orders: 0, users: 0, revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Use Promise.allSettled to ensure dashboard loads even if one service is down
        const results = await Promise.allSettled([
          ProductService.getAllProducts(),
          BrandService.getAllBrands(),
          CategoryService.getCategories(),
          UserService.getAllUsers(),
          apiClient.get(API_ROUTES.ANALYTICS.ORDER_INSIGHTS + "?summary=true")
        ]);

        const [products, brands, categories, users, orderRes] = results.map(
          res => res.status === 'fulfilled' ? res.value : null
        );

        // Process Order Analytics Data
// Check if orderRes is the full axios object or just the data
const rawData = orderRes?.data?.data ? orderRes.data.data : orderRes?.data;
const analyticsArray = rawData?.analytics || [];

let totalRevenue = 0;
let totalOrders = 0;

if (Array.isArray(analyticsArray) && analyticsArray.length > 0) {
  analyticsArray.forEach((item) => {
    totalRevenue += Number(item.totalRevenue || 0);
    totalOrders += Number(item.totalOrders || 0);
  });
} else {
  console.warn("Analytics array is empty or missing:", rawData);
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

  const formatValue = (val) => {
    if (!val || val === 0) return "0";
    if (val >= 100000) return `${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return val;
  };

  return (
    <PageShell
      title="Shop Overview"
      description="Real-time store metrics & growth"
      className="pb-8"
    >
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6 mb-8">
          <StatCard title="Products" value={counts.products} icon={<HiOutlineCube />} loading={loading} />
          <StatCard title="Brands" value={counts.brands} icon={<HiOutlineTag />} loading={loading} />
          <StatCard title="Categories" value={counts.categories} icon={<HiOutlineFolder />} loading={loading} />
          <StatCard title="Revenue" value={`₹${formatValue(counts.revenue)}`} icon={<HiOutlineTrendingUp />} isTrend loading={loading} />
          <StatCard title="Users" value={formatValue(counts.users)} icon={<HiOutlineUsers />} loading={loading} />
          <StatCard title="Orders" value={formatValue(counts.orders)} icon={<HiOutlineShoppingBag />} loading={loading} />
        </div>

        {/* ANALYTICS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-[2rem]  border border-orange-200 p-6">
             <h3 className="text-sm font-black text-slate-700 uppercase mb-6 tracking-wider">Library Distribution</h3>
             <Adminmain /> 
          </div>

          <div className="lg:col-span-4 bg-white rounded-[2rem] shadow-sm border border-orange-200 p-6">
             <h3 className="text-sm font-black text-slate-700 uppercase mb-6 tracking-wider">User Sentiment</h3>
             <UserAnalysis />
          </div>

          <div className="lg:col-span-12 bg-white rounded-[2rem] shadow-sm border border-orange-200 p-6">
             <h3 className="text-sm font-black text-slate-700 uppercase mb-6 tracking-wider">Order Performance</h3>
            <Ordergraph />
          </div>

          <div className="lg:col-span-12 bg-white rounded-[2rem] shadow-sm border border-orange-200 p-6">
             <h3 className="text-sm font-black text-slate-700 uppercase mb-6 tracking-wider">Top Selling Products</h3>
             <BestSellingAnalytics />
          </div>

          <div className="lg:col-span-12 bg-white rounded-[2rem] shadow-sm border border-orange-200 overflow-hidden">
            <div className="p-6 pb-0">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Recent Users</h3>
            </div>
            <UserDetails />
          </div>
        </div>
    </PageShell>
  );
}

// Reusable Sub-component for Cards
function StatCard({ title, value, loading, icon, isTrend }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-orange-200 hover:shadow-md hover:border-orange-300 transition-all duration-300">
      <div className="flex flex-col gap-3">
        <div className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl ${isTrend ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-[#E68736]'}`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <div className="text-xl font-black text-slate-800">
            {loading ? <div className="h-6 w-16 bg-slate-100 animate-pulse rounded"></div> : value}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Shop;