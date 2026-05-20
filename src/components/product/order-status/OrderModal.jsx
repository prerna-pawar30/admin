import React from "react";
import { X, MapPin, Phone, Calendar, Truck, CreditCard, Hash, PackageCheck } from "lucide-react";

export default function OrderModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center  backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Background layer tap trigger to close modal safety */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-[0_24px_60px_-15px_rgba(15,23,42,0.3)] relative z-10 overflow-hidden flex flex-col max-h-[90vh] border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Component Title Header Block */}
        <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/60 flex-shrink-0">
          <div>
            <h3 className="font-black text-slate-900 text-xl sm:text-2xl tracking-tight uppercase flex items-center gap-2">
              <PackageCheck className="text-orange-500" size={22} /> Manifest Node
            </h3>
            <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider mt-1 bg-slate-200/60 px-2 py-0.5 rounded w-max">
              System ID: #{order.orderId}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Central Component Scrolling Layout */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Shipping details */}
            <div className="space-y-3.5">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <MapPin size={12} /> Recipient Profile
              </h4>
              <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                <p className="font-extrabold text-slate-800 text-base">{order.billingAddress?.fullName}</p>
                <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed font-medium">
                  {order.billingAddress?.addressLine1}<br />
                  {order.billingAddress?.city}, {order.billingAddress?.state} - {order.billingAddress?.pincode}
                </p>
                <div className="flex items-center gap-1.5 text-orange-600 font-bold text-xs sm:text-sm mt-3.5 pt-2 border-t border-slate-200/40">
                  <Phone size={13} className="flex-shrink-0" /> <span>{order.billingAddress?.phone}</span>
                </div>
              </div>
            </div>

            {/* General Metrics Summary Card */}
            <div className="space-y-3.5">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Hash size={12} /> Pipeline Metrics
              </h4>
              <div className="space-y-3 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-xs sm:text-sm font-medium">
                {order.corourseServiceName && (
                  <div className="flex justify-between items-center pb-2.5 border-b border-dashed border-slate-200">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5"><Truck size={13}/> Carrier Fleet</span>
                    <span className="text-slate-800 font-black uppercase tracking-tight">{order.corourseServiceName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold flex items-center gap-1.5"><Calendar size={13}/> Registration</span>
                  <span className="text-slate-700 font-bold">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold flex items-center gap-1.5"><CreditCard size={13}/> Clearances</span>
                  <span className="text-emerald-600 text-[9px] font-black uppercase bg-emerald-50 border border-emerald-100/70 px-2 py-0.5 rounded">{order.paymentStatus || "PAID"}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-200/60 mt-1">
                  <span className="text-slate-800 font-black">Gross Revenue Value</span>
                  <span className="text-lg font-black text-slate-900">₹{order.grandTotal?.toLocaleString('en-IN') || "0"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table Matrix Component for Purchased Assets */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
              Itemized Allocation Inventory
            </h4>
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 border-b border-slate-200/60">
                    <th className="px-5 py-3">Product Nomenclature</th>
                    <th className="px-5 py-3 text-center w-16">Qty</th>
                    <th className="px-5 py-3 text-right w-28">Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-700 max-w-[200px] sm:max-w-none truncate">
                        {item.productName}
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono font-bold text-slate-400">
                        {item.quantity}
                      </td>
                      <td className="px-5 py-3.5 text-right font-extrabold text-slate-800">
                        ₹{item.price?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}