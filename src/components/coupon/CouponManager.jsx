/* eslint-disable no-unused-vars */
import PageHeader from "../ui/PageHeader";
import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { Plus, Zap, Inbox, Power, Settings2, X, Loader2, Ticket } from "lucide-react";

import { CouponService } from "../../backend/ApiService";
import TabNavigation from "./TabNavigation";
import CouponCard from "./CouponCard";
import CouponForm from "./CouponForm";
import { Dialog, DialogHeader } from "../ui/Dialog";

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
    <div className="text-slate-900">
      {isFetchingDetail && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <Loader2 className="text-[#E68736] animate-spin" size={40} />
        </div>
      )}

      <div>
        <PageHeader
          icon={Ticket}
          title="Coupons"
          description="Create and manage discount codes and offers."
          actions={
            <button type="button" onClick={() => { setEditingCoupon(null); setShowForm(true); }} className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600">
              <Plus size={16} strokeWidth={2.5} />
              New coupon
            </button>
          }
        />

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
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Inbox className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-bold uppercase tracking-wider text-sm">No campaigns found</p>
          </div>
        )}
      </div>

      <Dialog open={showForm} onClose={() => setShowForm(false)} size="2xl" label={editingCoupon ? "Edit coupon" : "New coupon"}>
        <DialogHeader
          icon={Ticket}
          title={editingCoupon ? `Edit coupon · ${editingCoupon.code || ""}` : "New coupon"}
          subtitle={editingCoupon ? "Update the rules and visibility of this campaign." : "Set up the code, discount rules and when it is live."}
          onClose={() => setShowForm(false)}
        />
        <CouponForm
          key={editingCoupon?.couponId || "new"}
          initialData={editingCoupon}
          onCancel={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); fetchCoupons(); }}
        />
      </Dialog>
    </div>
  );
}