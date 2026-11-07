/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Package, RefreshCw, Layers } from 'lucide-react';
import Swal from 'sweetalert2';
import { ReturnService } from '../../../backend/ApiService';
import ReturnRequestRow from './ReturnRequestRow';

const ReturnRequestsPage = () => {
  const [rawRequests, setRawRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await ReturnService.getReturnRequests();
      setRawRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      Swal.fire("Data Sync Mismatch", "Could not connect to reverse logistics warehouse architecture.", "error");
    } finally {
      setLoading(false);
    }
  };

  const groupedRequests = useMemo(() => rawRequests || [], [rawRequests]);

  const handleProcessAction = async (group, formData) => {
    // Step 1: update the return request status (approve / reject)
    let statusRes;
    try {
      Swal.fire({ title: "Updating ledger...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      statusRes = await ReturnService.updateReturnStatus(group.orderId, group.requestId, formData);
    } catch (err) {
      Swal.fire("Transaction Aborted", err.response?.data?.message || "Financial clearing gateway rejected the command.", "error");
      return;
    }

    if (!statusRes?.success) {
      Swal.fire("Transaction Aborted", statusRes?.message || "Return request could not be updated.", "error");
      return;
    }

    if (formData.status !== 'approved') {
      Swal.fire({ icon: "info", title: "Claim Declined", text: "Request documentation successfully labeled as rejected.", confirmButtonColor: "#0f172a" });
      fetchRequests();
      return;
    }

    // Step 2: trigger the refund. The return is already approved at this point,
    // so a refund failure is reported as a warning (retry-able), not a hard error.
    try {
      await ReturnService.executeRefund(group.orderId, formData.refundAmount);
      Swal.fire({ icon: "success", title: "Claim Approved", text: "Refund transaction initiated via standard node routing gateway.", confirmButtonColor: "#0f172a" });
    } catch (err) {
      Swal.fire({
        icon: "warning",
        title: "Approved — Refund Pending",
        text: `Return approved, but the auto-refund could not be completed: ${err.response?.data?.message || "payment gateway rejected the command"}. Retry the refund from the order.`,
        confirmButtonColor: "#0f172a",
      });
    }
    fetchRequests();
  };

  const openProcessModal = async (group) => {
    const totalRefundAmount = group.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const orderGrandTotal = group.grandTotal || 0; 

    const { value: result, isConfirmed, isDenied } = await Swal.fire({
      title: `<span class="text-lg font-bold text-slate-900 uppercase tracking-tight font-sans">Reverse Logistics Desk</span>`,
      html: `
        <div class="text-left px-1 font-sans antialiased text-slate-600">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Claim Items Valuation Manifest</p>
          <div class="border rounded-2xl bg-slate-50/50 overflow-hidden mb-4 max-h-56 overflow-y-auto border-slate-200">
            ${group.items?.map(item => `
              <div class="p-3 border-b border-slate-100 flex items-center gap-4 bg-white">
                <img src="${item.image || 'https://via.placeholder.com/80?text=NA'}" 
                     class="w-12 h-12 rounded-xl shadow-sm bg-white object-cover border border-slate-200/60 flex-shrink-0" 
                     onerror="this.src='https://via.placeholder.com/80?text=NA'"/>
                <div class="flex-1 min-w-0 space-y-0.5">
                  <div class="flex justify-between items-start gap-2">
                    <p class="text-[11px] font-bold text-slate-800 uppercase truncate leading-tight">${item.productName}</p>
                    <span class="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-slate-500 flex-shrink-0 border border-slate-200/50">#${item.sku || 'SKU'}</span>
                  </div>
                  <p class="text-[11px] text-orange-600 font-bold uppercase tracking-wide">${item.variantName || 'Default Variant'}</p>
                  
                  <div class="flex justify-between items-center pt-1.5 border-t border-slate-100 mt-1.5 text-[11px]">
                    <span class="text-slate-400 font-semibold uppercase">Pricing Framework</span>
                    <span class="text-slate-700 font-bold">₹${item.price?.toLocaleString('en-IN')} × ${item.quantity}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="bg-slate-950 rounded-2xl p-4 mb-4 text-white shadow-md">
            <div class="flex justify-between items-center mb-2 opacity-60 text-[11px] font-bold uppercase tracking-wider">
               <span>Original Gross Value</span>
               <span>₹${orderGrandTotal.toLocaleString('en-IN')}</span>
            </div>
            <div class="flex justify-between items-center mb-3 pb-3 border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-red-400">
               <span>Reversed Allocation</span>
               <span>- ₹${totalRefundAmount.toLocaleString('en-IN')}</span>
            </div>
            <div class="flex justify-between items-center">
               <div>
                 <p class="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Calculated Payback</p>
                 <p class="text-[11px] opacity-40 uppercase font-medium">To be processed instantly</p>
               </div>
               <div class="text-2xl font-mono font-bold text-emerald-400">₹${totalRefundAmount.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Inventory Management Directive</label>
            <select id="inventory-action" class="swal2-select !m-0 !w-full !text-xs !rounded-xl !border-slate-200 !py-2.5 !font-bold !text-slate-700 focus:!border-slate-400 focus:!ring-0">
              <option value="stock_update">✔ Approve & Return Inventory to Active Stock</option>
              <option value="no_stock_update">✖ Approve & Quarantine Stock (Damaged / Faulty)</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Authorize Refund',
      denyButtonText: 'Deny Claim',
      cancelButtonText: 'Defer Action',
      confirmButtonColor: '#10b981',
      denyButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-2xl border border-slate-100 shadow-2xl p-5',
        actions: 'w-full gap-2 px-1 mt-4',
        confirmButton: 'rounded-xl font-bold uppercase text-[11px] tracking-wider py-3 px-4 flex-1 order-3',
        denyButton: 'rounded-xl font-bold uppercase text-[11px] tracking-wider py-3 px-4 flex-1 order-2',
        cancelButton: 'rounded-xl font-bold uppercase text-[11px] tracking-wider py-3 px-4 flex-1 order-1 bg-slate-100 text-slate-500 hover:bg-slate-200 border-none'
      },
      preConfirm: () => {
        return {
          status: "approved",
          permission: document.getElementById('inventory-action').value,
          refundAmount: totalRefundAmount,
          items: group.items?.map(i => ({ 
            productId: i.productId, 
            variantId: i.variantId, 
            approvedQuantity: i.quantity 
          })) || []
        };
      }
    });

    if (isConfirmed) handleProcessAction(group, result);
    if (isDenied) handleProcessAction(group, { 
      status: "rejected", 
      permission: "stock.listing.quarantine", 
      items: group.items?.map(i => ({ productId: i.productId, approvedQuantity: 0 })) || []
    });
  };

  const totalPages = Math.ceil(groupedRequests.length / itemsPerPage);
  const currentItems = groupedRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-[50vh]">
      <div className="w-8 h-8 border-3 border-slate-900/10 border-t-slate-900 rounded-full animate-spin mb-3"></div>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compiling Return Claims...</span>
    </div>
  );

  return (
    <div className="text-slate-600">
      <div>
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Return Requests</h1>
            <p className="mt-1 text-sm text-slate-500">Review return claims, approve or reject them and process refunds.</p>
          </div>
          <button 
            onClick={fetchRequests} 
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all w-max cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw size={13} className="text-slate-400" /> Refresh
          </button>
        </header>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {groupedRequests.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Package size={24} className="text-slate-300" />
              </div>
              <p className="text-slate-800 font-extrabold text-sm">No return requests</p>
              <p className="text-slate-400 text-xs font-semibold mt-1">You're all caught up.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/60">
                    <th className="px-5 lg:px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Order / Items</th>
                    <th className="px-5 lg:px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Reason</th>
                    <th className="px-5 lg:px-5 py-3.5 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 lg:px-5 py-3.5 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentItems.map((group) => (
                    <ReturnRequestRow 
                      key={group.requestId || group.orderId} 
                      group={group} 
                      onProcess={openProcessModal} 
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-6 lg:px-8 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/40">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Segment {currentPage} of {totalPages}
              </span>
              <div className="flex gap-1.5">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => p - 1)} 
                  className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-30 shadow-sm disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16}/>
                </button>
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(p => p + 1)} 
                  className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-30 shadow-sm disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnRequestsPage;