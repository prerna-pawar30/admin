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
    try {
      Swal.fire({ title: "Updating ledger...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const statusRes = await ReturnService.updateReturnStatus(group.orderId, group.requestId, formData);

      if (statusRes.success) {
        if (formData.status === 'approved') {
          await ReturnService.executeRefund(group.orderId, formData.refundAmount);
          Swal.fire({ icon: "success", title: "Claim Approved", text: "Refund transaction initiated via standard node routing gateway.", confirmButtonColor: "#0f172a" });
        } else {
          Swal.fire({ icon: "info", title: "Claim Declined", text: "Request documentation successfully labeled as rejected.", confirmButtonColor: "#0f172a" });
        }
        fetchRequests();
      }
    } catch (err) {
      Swal.fire("Transaction Aborted", err.response?.data?.message || "Financial clearing gateway rejected the command.", "error");
    }
  };

  const openProcessModal = async (group) => {
    const totalRefundAmount = group.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const orderGrandTotal = group.grandTotal || 0; 

    const { value: result, isConfirmed, isDenied } = await Swal.fire({
      title: `<span class="text-lg font-black text-slate-900 uppercase tracking-tight font-sans">Reverse Logistics Desk</span>`,
      html: `
        <div class="text-left px-1 font-sans antialiased text-slate-600">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Claim Items Valuation Manifest</p>
          <div class="border rounded-2xl bg-slate-50/50 overflow-hidden mb-4 max-h-56 overflow-y-auto border-slate-200">
            ${group.items?.map(item => `
              <div class="p-3 border-b border-slate-100 flex items-center gap-4 bg-white">
                <img src="${item.image || 'https://via.placeholder.com/80?text=NA'}" 
                     class="w-12 h-12 rounded-xl shadow-sm bg-white object-cover border border-slate-200/60 flex-shrink-0" 
                     onerror="this.src='https://via.placeholder.com/80?text=NA'"/>
                <div class="flex-1 min-w-0 space-y-0.5">
                  <div class="flex justify-between items-start gap-2">
                    <p class="text-[11px] font-black text-slate-800 uppercase truncate leading-tight">${item.productName}</p>
                    <span class="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-slate-500 flex-shrink-0 border border-slate-200/50">#${item.sku || 'SKU'}</span>
                  </div>
                  <p class="text-[9px] text-orange-600 font-bold uppercase tracking-wide">${item.variantName || 'Default Variant'}</p>
                  
                  <div class="flex justify-between items-center pt-1.5 border-t border-slate-100 mt-1.5 text-[10px]">
                    <span class="text-slate-400 font-semibold uppercase">Pricing Framework</span>
                    <span class="text-slate-700 font-bold">₹${item.price?.toLocaleString('en-IN')} × ${item.quantity}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Financial Calculation Core Card -->
          <div class="bg-slate-950 rounded-2xl p-4 mb-4 text-white shadow-md">
            <div class="flex justify-between items-center mb-2 opacity-60 text-[10px] font-bold uppercase tracking-wider">
               <span>Original Gross Value</span>
               <span>₹${orderGrandTotal.toLocaleString('en-IN')}</span>
            </div>
            <div class="flex justify-between items-center mb-3 pb-3 border-b border-white/10 text-[10px] font-bold uppercase tracking-wider text-red-400">
               <span>Reversed Allocation</span>
               <span>- ₹${totalRefundAmount.toLocaleString('en-IN')}</span>
            </div>
            <div class="flex justify-between items-center">
               <div>
                 <p class="text-[10px] font-black uppercase tracking-widest text-emerald-400">Calculated Payback</p>
                 <p class="text-[8px] opacity-40 uppercase font-medium">To be processed instantly</p>
               </div>
               <div class="text-2xl font-mono font-black text-emerald-400">₹${totalRefundAmount.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Inventory Management Directive</label>
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
        popup: 'rounded-[2rem] border border-slate-100 shadow-2xl p-5',
        actions: 'w-full gap-2 px-1 mt-4',
        confirmButton: 'rounded-xl font-black uppercase text-[10px] tracking-wider py-3 px-4 flex-1 order-3',
        denyButton: 'rounded-xl font-black uppercase text-[10px] tracking-wider py-3 px-4 flex-1 order-2',
        cancelButton: 'rounded-xl font-black uppercase text-[10px] tracking-wider py-3 px-4 flex-1 order-1 bg-slate-100 text-slate-500 hover:bg-slate-200 border-none'
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
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#F8FAFC]">
      <div className="w-8 h-8 border-3 border-slate-900/10 border-t-slate-900 rounded-full animate-spin mb-3"></div>
      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Compiling Return Claims...</span>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen  antialiased text-slate-600 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">Reverse Channel Logistics</h1>
            <p className="text-slate-400 text-xs sm:text-sm font-semibold tracking-wide mt-0.5">Dispute audits, automated credit processing, and dynamic warehouse inventory integration</p>
          </div>
          <button 
            onClick={fetchRequests} 
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all w-max cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw size={13} className="text-slate-400" /> Refresh Ledger
          </button>
        </header>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_30px_rgba(0,0,0,0.02)] overflow-hidden">
          {groupedRequests.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Package size={24} className="text-slate-300" />
              </div>
              <p className="text-slate-800 font-extrabold text-sm">Dispute Stack Unoccupied</p>
              <p className="text-slate-400 text-xs font-semibold mt-1">All reverse claims have been validated and signed off.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/60">
                    <th className="px-6 lg:px-8 py-4.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Entity / Assets</th>
                    <th className="px-6 lg:px-8 py-4.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Declaration</th>
                    <th className="px-6 lg:px-8 py-4.5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Stage</th>
                    <th className="px-6 lg:px-8 py-4.5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Control Execution</th>
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

          {/* Navigation Controls Block Footer */}
          {totalPages > 1 && (
            <div className="px-6 lg:px-8 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/40">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
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