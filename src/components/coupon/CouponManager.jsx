/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { Plus, Zap, Inbox, Power, Settings2, X, Loader2 } from "lucide-react";

import { CouponService } from "../../backend/ApiService";
import TabNavigation from "./TabNavigation";
import CouponCard from "./CouponCard";
import CouponForm from "./CouponForm";

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const TABS_CONFIG = [
  { id: "ALL", label: "All", icon: Inbox },
  { id: "ACTIVE", label: "Active", icon: Power },
  { id: "DRAFT", label: "Drafts", icon: Settings2 }
];

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");

  const fetchCoupons = async (tabId) => {
    setLoading(true);
    try {
      const statusMap = { "ALL": "all", "ACTIVE": "true", "DRAFT": "false" };
      const backendStatus = statusMap[tabId || activeTab] || "all";
      const data = await CouponService.getCoupons(backendStatus);
      setCoupons(data || []);
    } catch (err) {
      console.error("Fetch Coupons Error:", err);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    fetchCoupons(tabId);
  };

  useEffect(() => { fetchCoupons("ALL"); }, []);

  const handleEditClick = async (couponId) => {
    setIsFetchingDetail(true);
    try {
      const result = await CouponService.getCouponById(couponId);
      if (result && result.success) {
        setEditingCoupon(result.data);
        setShowForm(true);
      } else {
        Toast.fire({ icon: 'error', title: 'Coupon not found' });
      }
    } catch (err) {
      Toast.fire({ icon: 'error', title: 'Server Error' });
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const filteredCoupons = useMemo(() => {
    if (activeTab === "ACTIVE") return coupons.filter(c => c.isActive);
    if (activeTab === "DRAFT") return coupons.filter(c => !c.isActive);
    return coupons;
  }, [coupons, activeTab]);

  const deleteCoupon = async (couponId) => {
    const result = await Swal.fire({
      title: 'Remove Campaign?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E68736',
      confirmButtonText: 'Yes, Delete',
    });

    if (result.isConfirmed) {
      try {
        const data = await CouponService.deleteCoupon(couponId);
        if (data.success) {
          Toast.fire({ icon: 'success', title: 'Campaign Deleted' });
          fetchCoupons();
        }
      } catch (err) {
        Swal.fire('Error', 'Failed to reach server', 'error');
      }
    }
  };

  const toggleStatus = async (couponId, currentStatus) => {
    try {
      const res = await CouponService.updateStatus(couponId, !currentStatus);
      if (res.success) {
        Toast.fire({ icon: 'success', title: `Coupon ${!currentStatus ? 'Live' : 'Paused'}` });
        fetchCoupons();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="py-20 min-h-screen text-slate-900 p-4 md:p-10 font-sans bg-[#FDFDFD]">
      {isFetchingDetail && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <Loader2 className="text-[#E68736] animate-spin" size={40} />
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#E68736]">
              <Zap size={18} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Marketing Engine</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Campaign<span className="text-[#E68736]"> Manager</span>
            </h1>
          </div>

          <button
            onClick={() => { setEditingCoupon(null); setShowForm(true); }}
            className="flex items-center gap-3 bg-[#E68736] hover:bg-orange-400 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg"
          >
            <Plus size={20} strokeWidth={3} />
            CREATE NEW OFFER
          </button>
        </div>

        {/* Tab Navigation */}
        <TabNavigation 
          activeTab={activeTab} 
          coupons={coupons} 
          handleTabChange={handleTabChange} 
          tabsConfig={TABS_CONFIG} 
        />

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-[#E68736] rounded-full animate-spin" />
          </div>
        ) : filteredCoupons.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCoupons.map((coupon) => (
              <CouponCard
                key={coupon._id}
                coupon={coupon}
                onDelete={() => deleteCoupon(coupon.couponId)}
                onToggle={() => toggleStatus(coupon.couponId, coupon.isActive)}
                onEdit={() => handleEditClick(coupon.couponId)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <Inbox className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No campaigns found</p>
          </div>
        )}
      </div>

      {/* ✅ FIXED MODAL — properly clears sidebar (260px) and header (64px) */}
      {showForm && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center"
          style={{ paddingLeft: '260px', paddingTop: '64px' }}
        >
          {/* Modal Container */}
          <div className="relative w-full max-w-4xl mx-4 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: 'calc(100vh - 64px - 32px)' }}
          >
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center bg-orange-50/50 flex-shrink-0">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                {editingCoupon ? 'Edit Campaign' : 'New Campaign'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-orange-100 text-[#E68736] rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto">
              <CouponForm
                initialData={editingCoupon}
                onSuccess={() => { setShowForm(false); fetchCoupons(); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}