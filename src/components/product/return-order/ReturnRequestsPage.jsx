/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
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
      setRawRequests(data);
    } catch (err) {
      Swal.fire("Error", "Could not sync return data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const groupedRequests = useMemo(() => rawRequests || [], [rawRequests]);

  const handleProcessAction = async (group, formData) => {
    try {
      Swal.fire({ title: "Processing...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const statusRes = await ReturnService.updateReturnStatus(group.orderId, group.requestId, formData);

      if (statusRes.success) {
        if (formData.status === 'approved') {
          await ReturnService.executeRefund(group.orderId, formData.refundAmount);
          Swal.fire("Success", "Approved and refund initiated.", "success");
        } else {
          Swal.fire("Rejected", "The request was denied.", "info");
        }
        fetchRequests();
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Transaction failed.", "error");
    }
  };

  const openProcessModal = async (group) => {
    // 1. Calculate the suggested refund based on items in this request
    const totalRefundAmount = group.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderGrandTotal = group.grandTotal || 0; 

    const { value: result, isConfirmed, isDenied } = await Swal.fire({
      title: `<span class="text-xl font-black text-slate-800">Process Return Request</span>`,
      html: `
        <div class="text-left px-1">
          <div class="border rounded-2xl bg-gray-50 overflow-hidden mb-4 max-h-60 overflow-y-auto border-slate-200">
            ${group.items.map(item => `
                <div class="p-4 border-b border-white flex items-start gap-4 hover:bg-white/50 transition-colors">
                  <img src="${item.image || 'https://via.placeholder.com/80?text=NA'}" 
                       class="w-20 h-20 rounded-xl shadow-sm bg-white object-cover border border-slate-100" 
                       onerror="this.src='https://via.placeholder.com/80?text=NA'"/>
                  <div class="flex-1 space-y-1">
                    <div class="flex justify-between items-start">
                      <p class="text-[12px] font-black text-slate-800 uppercase leading-tight">${item.productName}</p>
                      <span class="text-[10px] bg-slate-200 px-2 py-0.5 rounded-md font-bold text-slate-600">${item.sku}</span>
                    </div>
                    <p class="text-[10px] text-orange-600 font-bold uppercase tracking-wider">${item.variantName}</p>
                    
                    <div class="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                      <div class="text-[10px] text-slate-400 font-bold uppercase">Price × Qty</div>
                      <div class="text-[11px] font-black text-slate-700">₹${item.price} × ${item.quantity}</div>
                    </div>
                    <div class="flex justify-between items-center">
                      <div class="text-[10px] text-slate-400 font-bold uppercase">Item Subtotal</div>
                      <div class="text-[11px] font-black text-[#E68736]">₹${item.price * item.quantity}</div>
                    </div>
                  </div>
                </div>
              `).join('')}
          </div>

          <div class="bg-slate-900 rounded-2xl p-4 mb-4 text-white shadow-xl">
            <div class="flex justify-between items-center mb-2 opacity-70">
               <span class="text-[10px] font-bold uppercase tracking-widest">Original Grand Total</span>
               <span class="text-xs font-bold">₹${orderGrandTotal}</span>
            </div>
            <div class="flex justify-between items-center mb-3 pb-3 border-b border-white/10">
               <span class="text-[10px] font-bold uppercase tracking-widest text-red-400">Return Deduction</span>
               <span class="text-xs font-bold text-red-400">- ₹${totalRefundAmount}</span>
            </div>
            <div class="flex justify-between items-center">
               <div>
                 <p class="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Approved Refund</p>
                 <p class="text-[8px] opacity-50 uppercase">Final amount to be credited</p>
               </div>
               <div class="text-2xl font-black text-emerald-400">₹${totalRefundAmount}</div>
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Inventory Protocol</label>
            <select id="inventory-action" class="swal2-select !m-0 !w-full !text-sm !rounded-xl !border-slate-200">
              <option value="stock_update">Approve & Restock Items</option>
              <option value="no_stock_update">Approve (Damaged/No Restock)</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Approve & Refund',
      denyButtonText: 'Reject Request',
      confirmButtonColor: '#10b981',
      denyButtonColor: '#ef4444',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-[2rem]',
        confirmButton: 'rounded-xl font-black uppercase text-[11px] py-3',
        denyButton: 'rounded-xl font-black uppercase text-[11px] py-3',
        cancelButton: 'rounded-xl font-black uppercase text-[11px] py-3'
      },
      preConfirm: () => {
        return {
          status: "approved",
          permission: document.getElementById('inventory-action').value,
          refundAmount: totalRefundAmount,
          items: group.items.map(i => ({ 
            productId: i.productId, 
            variantId: i.variantId, 
            approvedQuantity: i.quantity 
          }))
        };
      }
    });

    if (isConfirmed) handleProcessAction(group, result);
    if (isDenied) handleProcessAction(group, { 
      status: "rejected", 
      permission: "stock.listing.update", // Assuming you want to update stock status even on rejection, adjust as needed
      items: group.items.map(i => ({ productId: i.productId, approvedQuantity: 0 })) 
    });
  };

  const totalPages = Math.ceil(groupedRequests.length / itemsPerPage);
  const currentItems = groupedRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-[#E68736]"></div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Returns & Refunds</h1>
          <p className="text-slate-500 font-medium tracking-tight">Manage customer return requests</p>
        </header>

        <div className="bg-white rounded-[2rem] border border-orange-200 overflow-hidden">
          {groupedRequests.length === 0 ? (
            <div className="py-24 text-center">
              <Package size={40} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 font-bold uppercase text-[10px]">No pending requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase">Order Info</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase">Reason</th>
                    <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase">Status</th>
                    <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentItems.map((group) => (
                    <ReturnRequestRow 
                      key={group.requestId} 
                      group={group} 
                      onProcess={openProcessModal} 
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-8 py-4 bg-slate-50/50 border-t flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase">Page {currentPage} of {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-white border rounded-lg"><ChevronLeft size={16}/></button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-white border rounded-lg"><ChevronRight size={16}/></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnRequestsPage;