/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { MapPin, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";
import { OrderService } from "../../../backend/ApiService";
import { STATUS_PROGRESSION, getStatusConfig } from "./OrderConstants";
import OrderModal from "./OrderModal";
import DashboardHeader from "./DashboardHeader";

export default function ProductTracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All orders");
  const [query, setQuery] = useState("");
  const [openFor, setOpenFor] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await OrderService.getAllOrders();
      setOrders(data);
    } catch (err) {
      Swal.fire("Error", "Could not load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setOpenFor(null);
    
    // 1. Trigger Courier form ONLY on "shipped"
    if (newStatus === "shipped") {
      const { value: formValues } = await Swal.fire({
        title: "Shipping Assignment",
        html: `
          <div class="flex flex-col gap-3 p-2 text-left">
            <label class="text-[10px] font-bold uppercase text-slate-400 ml-1">Courier Name</label>
            <input id="swal-input1" class="swal2-input !m-0 !w-full" placeholder="e.g. BlueDart">
            <label class="text-[10px] font-bold uppercase text-slate-400 ml-1 mt-2">Tracking ID</label>
            <input id="swal-input2" class="swal2-input !m-0 !w-full" placeholder="e.g. BD987654321">
          </div>`,
        showCancelButton: true,
        confirmButtonText: "Ship Order",
        confirmButtonColor: "#3B82F6",
        preConfirm: () => {
          const serviceName = document.getElementById("swal-input1").value;
          const docNumber = document.getElementById("swal-input2").value;
          if (!serviceName || !docNumber) return Swal.showValidationMessage("Courier details are required");
          return { serviceName, docNumber };
        },
      });

      if (!formValues) return;

      try {
        Swal.fire({ title: "Processing Courier...", didOpen: () => Swal.showLoading() });
        await OrderService.updateCourier(orderId, formValues);
      } catch (err) {
        return Swal.fire("Error", "Failed to link courier", "error");
      }
    }

    // 2. Execute Status Update
    try {
      if (!Swal.isLoading()) Swal.fire({ title: 'Updating...', didOpen: () => Swal.showLoading() });
      await OrderService.updateStatus(orderId, newStatus);

      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, orderStatus: newStatus } : o));
      Swal.fire({ icon: "success", title: "Order Updated", toast: true, position: "top-end", showConfirmButton: false, timer: 3000 });
    } catch (err) {
      Swal.fire("Error", "Update failed", "error");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const statusMatch = statusFilter === "All orders" || o.orderStatus === statusFilter;
      const searchMatch = !query || o.billingAddress?.fullName?.toLowerCase().includes(query.toLowerCase()) || o.orderId.toLowerCase().includes(query.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [orders, statusFilter, query]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  return (
    <div className="min-h-screen  px-4 sm:px-8">
      <DashboardHeader 
        query={query} setQuery={setQuery} 
        statusFilter={statusFilter} setStatusFilter={setStatusFilter} 
      />

      <div className="max-w-7xl mx-auto bg-white rounded-[2rem] border border-orange-200 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Recipient</th>
                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Financials</th>
                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Track Status</th>
                <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="4" className="py-20 text-center text-slate-400 font-bold">Initializing Logistics...</td></tr>
              ) : paginatedOrders.map((o) => {
                const cfg = getStatusConfig(o.orderStatus);
                const nextOptions = STATUS_PROGRESSION[o.orderStatus] || [];

                return (
                  <tr key={o._id} className="group hover:bg-slate-50/80 transition-all">
                    <td className="px-8 py-7">
                      <div className="flex flex-col cursor-pointer group/name" onClick={() => setSelectedOrderDetails(o)}>
                        <span className="font-black text-slate-800 text-base group-hover/name:text-[#E68736] transition-colors">
                          {o.billingAddress?.fullName}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold mt-1.5 uppercase">
                          <MapPin size={14} className="text-slate-300" /> {o.billingAddress?.city}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <span className="text-lg font-black text-slate-900">₹{o.grandTotal}</span>
                    </td>
                    <td className="px-8 py-7">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-wider ${cfg.color}`}>
                        {cfg.icon} {o.orderStatus}
                      </div>
                    </td>
                    <td className="px-8 py-7 text-center relative">
                      <button onClick={() => setOpenFor(openFor === o._id ? null : o._id)} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
                        <MoreHorizontal size={20} />
                      </button>
                      {openFor === o._id && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setOpenFor(null)} />
                          <div className="absolute right-0 mt-3 bg-white shadow-2xl rounded-2xl p-2 z-40 w-56 border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 px-3 py-2 uppercase border-b mb-1">Next Protocol</p>
                            {nextOptions.length > 0 ? nextOptions.map((s) => (
                              <button key={s} onClick={() => handleUpdateStatus(o.orderId, s)} className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-[11px] uppercase font-black hover:bg-slate-50 rounded-xl">
                                <span className={`w-2 h-2 rounded-full ${getStatusConfig(s).dot}`} />
                                <span className="text-slate-600">{s}</span>
                              </button>
                            )) : <p className="text-[10px] text-slate-300 px-3 py-2 italic">No actions available</p>}
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="text-[11px] font-black text-slate-400 uppercase">Total: {filteredOrders.length}</div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-black text-slate-400 uppercase">Page {currentPage} of {totalPages || 1}</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50"><ChevronLeft size={18} /></button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50"><ChevronRight size={18} /></button>
            </div>
          </div>
        </div>
      </div>
      
      <OrderModal 
        order={selectedOrderDetails} 
        onClose={() => setSelectedOrderDetails(null)} 
      />
    </div>
  );
}