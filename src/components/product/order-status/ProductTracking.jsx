/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { MapPin, MoreHorizontal, ChevronLeft, ChevronRight, Layers, DollarSign, Calendar, Eye } from "lucide-react";
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

  // Sync back state updates automatically to preserve correct page dimensions
  useEffect(() => { setCurrentPage(1); }, [statusFilter, query]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await OrderService.getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      Swal.fire("System Error", "Could not synchronize operations database.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setOpenFor(null);
    
    if (newStatus === "shipped") {
      const { value: formValues } = await Swal.fire({
        title: "Shipping Assignment",
        html: `
          <div class="flex flex-col gap-3 p-1 text-left font-sans">
            <div>
              <label class="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Carrier Provider</label>
              <input id="swal-input1" class="swal2-input !m-0 !w-full !rounded-xl !text-sm" placeholder="e.g. BlueDart">
            </div>
            <div class="mt-2">
              <label class="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Waybill / Tracking ID</label>
              <input id="swal-input2" class="swal2-input !m-0 !w-full !rounded-xl !text-sm" placeholder="e.g. BD987654321">
            </div>
          </div>`,
        showCancelButton: true,
        confirmButtonText: "Commit Shipping Protocol",
        confirmButtonColor: "#0f172a",
        cancelButtonColor: "#64748b",
        preConfirm: () => {
          const serviceName = document.getElementById("swal-input1").value;
          const docNumber = document.getElementById("swal-input2").value;
          if (!serviceName || !docNumber) return Swal.showValidationMessage("All custom cargo declarations are mandatory.");
          return { serviceName, docNumber };
        },
      });

      if (!formValues) return;

      try {
        Swal.fire({ title: "Registering manifest...", didOpen: () => Swal.showLoading(), allowOutsideClick: false });
        await OrderService.updateCourier(orderId, formValues);
      } catch (err) {
        return Swal.fire("Pipeline Mismatch", "Failed to compile custom shipping records.", "error");
      }
    }

    try {
      if (!Swal.isLoading()) Swal.fire({ title: 'Updating internal status...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
      await OrderService.updateStatus(orderId, newStatus);

      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, orderStatus: newStatus } : o));
      Swal.fire({ icon: "success", title: "Manifest updated successfully", toast: true, position: "top-end", showConfirmButton: false, timer: 3000 });
    } catch (err) {
      Swal.fire("Execution Interrupted", "State transition rejected by network backend.", "error");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const statusMatch = statusFilter === "All orders" || o.orderStatus === statusFilter;
      const searchMatch = !query || 
        o.billingAddress?.fullName?.toLowerCase().includes(query.toLowerCase()) || 
        o.orderId?.toLowerCase().includes(query.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [orders, statusFilter, query]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-600">
      <DashboardHeader 
        query={query} setQuery={setQuery} 
        statusFilter={statusFilter} setStatusFilter={setStatusFilter} 
      />

      <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_30px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto min-h-[440px]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/60">
                <th className="px-6 lg:px-8 py-4.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order / Recipient</th>
                <th className="px-6 lg:px-8 py-4.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">Timestamp</th>
                <th className="px-6 lg:px-8 py-4.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Summary</th>
                <th className="px-6 lg:px-8 py-4.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fulfillment Track</th>
                <th className="px-6 lg:px-8 py-4.5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Synchronizing Control Grid...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center text-slate-400 text-sm font-medium italic">
                    No active freight logs match criteria definitions.
                  </td>
                </tr>
              ) : paginatedOrders.map((o) => {
                const cfg = getStatusConfig(o.orderStatus) || { color: "bg-slate-50 text-slate-600 border-slate-200", icon: null, dot: "bg-slate-400" };
                const nextOptions = STATUS_PROGRESSION[o.orderStatus] || [];

                return (
                  <tr key={o._id || o.orderId} className="group hover:bg-slate-50/50 transition-colors duration-150">
                    {/* Recipient Identity */}
                    <td className="px-6 lg:px-8 py-5.5">
                      <div className="flex flex-col max-w-[180px] sm:max-w-xs md:max-w-sm">
                        <span 
                          onClick={() => setSelectedOrderDetails(o)}
                          className="font-bold text-slate-800 text-sm sm:text-base cursor-pointer hover:text-orange-600 transition-colors inline-flex items-center gap-1.5 group/title"
                        >
                          <span className="truncate">{o.billingAddress?.fullName}</span>
                          <Eye size={14} className="opacity-0 group-hover/title:opacity-100 text-slate-400 transition-opacity flex-shrink-0" />
                        </span>
                        <span className="text-[10px] font-mono font-bold tracking-tight text-slate-400 mt-0.5 truncate uppercase">
                          Ref: #{o.orderId}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mt-2 truncate">
                          <MapPin size={12} className="text-slate-300 flex-shrink-0" /> 
                          <span className="truncate">{o.billingAddress?.city}</span>
                        </div>
                      </div>
                    </td>

                    {/* Order Timestamp */}
                    <td className="px-6 lg:px-8 py-5.5 hidden sm:table-cell">
                      <div className="flex flex-col text-xs text-slate-600 font-medium">
                        <span className="inline-flex items-center gap-1.5"><Calendar size={13} className="text-slate-300" /> {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5 ml-4.5">{o.createdAt ? new Date(o.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ""}</span>
                      </div>
                    </td>

                    {/* Financial Layout */}
                    <td className="px-6 lg:px-8 py-5.5">
                      <div className="flex flex-col">
                        <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                          ₹{o.grandTotal?.toLocaleString('en-IN') || "0"}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100/70 px-1.5 py-0.5 rounded w-max mt-1.5">
                          {o.paymentStatus || "PAID"}
                        </span>
                      </div>
                    </td>

                    {/* Operational Track Status */}
                    <td className="px-6 lg:px-8 py-5.5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-[10px] uppercase tracking-wider shadow-sm ${cfg.color}`}>
                        <span className="text-xs flex-shrink-0">{cfg.icon}</span> 
                        <span className="truncate max-w-[100px] sm:max-w-none">{o.orderStatus}</span>
                      </div>
                    </td>

                    {/* Actions Anchor System */}
                    <td className="px-6 lg:px-8 py-5.5 text-center relative">
                      <button 
                        onClick={() => setOpenFor(openFor === o._id ? null : o._id)} 
                        className={`p-2 rounded-xl transition-all ${openFor === o._id ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      
                      {openFor === o._id && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setOpenFor(null)} />
                          <div className="absolute right-6 mt-2 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.15)] rounded-2xl p-1.5 z-40 w-52 border border-slate-100 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                            <p className="text-[9px] font-black text-slate-400 px-3 py-1.5 uppercase tracking-widest border-b border-slate-50 mb-1">Logistics Action</p>
                            {nextOptions.length > 0 ? nextOptions.map((s) => (
                              <button 
                                key={s} 
                                onClick={() => handleUpdateStatus(o.orderId, s)} 
                                className="flex items-center gap-2.5 w-full px-3 py-2 text-[11px] uppercase font-bold hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
                              >
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusConfig(s)?.dot || 'bg-slate-400'}`} />
                                <span className="truncate">{s}</span>
                              </button>
                            )) : (
                              <p className="text-[10px] text-slate-400 px-3 py-2 italic">Pipeline complete</p>
                            )}
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

        {/* Tail Dashboard Pagination Controls */}
        <div className="px-6 lg:px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest order-2 sm:order-1">
            Total Aggregate Ledger: {filteredOrders.length} records
          </div>
          <div className="flex items-center gap-4 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Page {currentPage} of {totalPages || 1}
            </span>
            <div className="flex gap-1.5">
              <button 
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                disabled={currentPage === 1} 
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-50 shadow-sm disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                disabled={currentPage === totalPages || totalPages === 0} 
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-50 shadow-sm disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
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