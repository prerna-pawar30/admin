import React from "react";
import { X, MapPin, Phone, Calendar, Truck, CreditCard } from "lucide-react";

export default function OrderModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b flex justify-between items-start bg-slate-50/50">
          <div>
            <h3 className="font-black text-slate-900 text-2xl mb-1">Order Details</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">ID: {order.orderId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 max-h-[75vh] overflow-y-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Customer & Shipping</h4>
              <div>
                <p className="font-black text-slate-800 text-lg">{order.billingAddress?.fullName}</p>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                  {order.billingAddress?.addressLine1}<br />
                  {order.billingAddress?.city}, {order.billingAddress?.state} - {order.billingAddress?.pincode}
                </p>
                <div className="flex items-center gap-2 text-[#E68736] font-bold text-sm mt-3">
                  <Phone size={14} /> {order.billingAddress?.phone}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Order Summary</h4>
              <div className="space-y-3">
                {order.corourseServiceName && (
                  <div className="flex justify-between items-center py-2 border-b border-dashed">
                    <span className="text-slate-400 text-xs font-bold flex items-center gap-2"><Truck size={14}/> Courier</span>
                    <span className="text-slate-700 text-sm font-black">{order.corourseServiceName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-bold flex items-center gap-2"><Calendar size={14}/> Placed On</span>
                  <span className="text-slate-700 text-sm font-black">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-bold flex items-center gap-2"><CreditCard size={14}/> Payment</span>
                  <span className="text-emerald-600 text-[10px] font-black uppercase bg-emerald-50 px-2 py-1 rounded border border-emerald-100">{order.paymentStatus}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-slate-800 font-black">Grand Total</span>
                  <span className="text-xl font-black text-slate-900">₹{order.grandTotal}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Items Purchased</h4>
            <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase bg-slate-100/50">
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3 text-center">Qty</th>
                    <th className="px-6 py-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.items?.map((item, idx) => (
                    <tr key={idx} className="text-sm">
                      <td className="px-6 py-4 font-bold text-slate-700">{item.productName}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-400">{item.quantity}</td>
                      <td className="px-6 py-4 text-right font-black text-slate-800">₹{item.price}</td>
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