import React from "react";
import { MapPin, Phone, Calendar, Truck, CreditCard, Hash, PackageCheck } from "lucide-react";
import { Dialog, DialogBody, DialogHeader } from "../../ui/Dialog";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function OrderModal({ order, onClose }) {
  if (!order) return null;

  return (
    <Dialog open onClose={onClose} size="lg" label="Order details">
      <DialogHeader icon={PackageCheck} title="Order details" subtitle={<span className="font-mono">#{order.orderId}</span>} onClose={onClose} />

      <DialogBody className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <section className="min-w-0 rounded-2xl border border-slate-200 p-4">
            <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <MapPin size={12} /> Ship to
            </h4>
            <p className="break-words text-sm font-bold text-slate-800">{order.billingAddress?.fullName}</p>
            <p className="mt-1 break-words text-xs leading-relaxed text-slate-500">
              {order.billingAddress?.addressLine1}
              <br />
              {order.billingAddress?.city}, {order.billingAddress?.state} - {order.billingAddress?.pincode}
            </p>
            <p className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-2 text-xs font-semibold text-brand-600">
              <Phone size={13} className="shrink-0" /> {order.billingAddress?.phone}
            </p>
          </section>

          <section className="min-w-0 rounded-2xl border border-slate-200 p-4 text-xs">
            <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Hash size={12} /> Summary
            </h4>
            <dl className="space-y-2.5">
              {order.corourseServiceName && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-1.5 text-slate-500">
                    <Truck size={13} /> Courier
                  </dt>
                  <dd className="truncate font-semibold text-slate-800">{order.corourseServiceName}</dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-slate-500">
                  <Calendar size={13} /> Placed on
                </dt>
                <dd className="font-semibold text-slate-800">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-slate-500">
                  <CreditCard size={13} /> Payment
                </dt>
                <dd className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold uppercase text-emerald-700">{order.paymentStatus || "PAID"}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t border-slate-100 pt-2.5">
                <dt className="text-sm font-semibold text-slate-800">Grand total</dt>
                <dd className="text-lg font-bold text-slate-900">{money(order.grandTotal)}</dd>
              </div>
            </dl>
          </section>
        </div>

        <section>
          <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Items ({order.items?.length || 0})</h4>
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
            {order.items?.map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 px-4 py-3 text-sm">
                <p className="min-w-0 flex-1 break-words font-semibold text-slate-700">{item.productName}</p>
                <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-500">×{item.quantity}</span>
                <span className="w-24 shrink-0 text-right font-bold text-slate-800">{money(item.price)}</span>
              </li>
            ))}
          </ul>
        </section>
      </DialogBody>
    </Dialog>
  );
}
