import React from "react";
import { User, Building, FileText, Truck, Landmark } from "lucide-react";
import { Dialog, DialogBody, DialogHeader } from "../../ui/Dialog";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const date = (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "N/A");

const InfoTile = ({ label, children }) => (
  <div className="min-w-0">
    <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
    <div className="mt-1 break-words text-sm font-semibold text-slate-800">{children}</div>
  </div>
);

const Card = ({ icon, title, children }) => {
  const IconComponent = icon;
  return (
  <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
    <h4 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
      <IconComponent size={15} className="text-slate-400" /> {title}
    </h4>
    {children}
  </div>
  );
};

const InvoiceDetailModal = ({ invoice, isOpen, onClose }) => {
  if (!isOpen || !invoice) return null;

  const isPaid = invoice.status === "issued" || invoice.status === "paid";

  return (
    <Dialog open onClose={onClose} size="xl" label={`Invoice ${invoice.invoiceNumber || ""}`}>
      <DialogHeader
        icon={FileText}
        title={`Invoice #${invoice.invoiceNumber || "N/A"}`}
        subtitle={<span className="font-mono">ID: {invoice._id}</span>}
        badge={
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${
              isPaid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            }`}
          >
            {invoice.status}
          </span>
        }
        onClose={onClose}
      />

      <DialogBody className="space-y-5 text-sm text-slate-600">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-brand-100 bg-brand-50/50 p-4 sm:grid-cols-4">
          <InfoTile label="Invoice date">{date(invoice.invoiceDate)}</InfoTile>
          <InfoTile label="Due date">{date(invoice.dueDate)}</InfoTile>
          <InfoTile label="Rep. person">{invoice.customerServiceRep || "N/A"}</InfoTile>
          <InfoTile label="Order no.">{invoice.orderNumber || "N/A"}</InfoTile>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {invoice.seller && (
            <Card icon={Building} title="Seller">
              <p className="break-words font-semibold text-slate-900">{invoice.seller.companyName}</p>
              <p className="mt-1 break-words text-xs leading-relaxed text-slate-500">{invoice.seller.address}</p>
              <div className="mt-3 space-y-0.5 break-words text-xs">
                <p>
                  <span className="font-semibold text-slate-700">GSTIN:</span> {invoice.seller.gstin}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Email:</span> {invoice.seller.email}
                </p>
              </div>
            </Card>
          )}
          {invoice.billTo && (
            <Card icon={User} title="Billed to">
              <p className="break-words font-semibold capitalize text-slate-900">{invoice.billTo.companyName}</p>
              <p className="mt-1 break-words text-xs leading-relaxed text-slate-500">{invoice.billTo.address}</p>
              <div className="mt-3 space-y-0.5 break-words text-xs">
                <p>
                  <span className="font-semibold text-slate-700">Contact:</span> {invoice.billTo.contactPerson} ({invoice.billTo.contactNumber})
                </p>
                {invoice.billTo.gstin && (
                  <p>
                    <span className="font-semibold text-slate-700">GSTIN:</span> {invoice.billTo.gstin}
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>

        <Card icon={Truck} title="Logistics">
          <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
            <InfoTile label="Terms of delivery">{invoice.termsOfDelivery || "N/A"}</InfoTile>
            <InfoTile label="Shipping">{invoice.shippingCondition || "N/A"}</InfoTile>
            <InfoTile label="Payment terms">{invoice.paymentTerms || "N/A"}</InfoTile>
          </div>
        </Card>

        {invoice.items?.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Items ({invoice.items.length})</h4>

            {/* Phones: one card per item, no sideways scroll. */}
            <ul className="space-y-2 md:hidden">
              {invoice.items.map((item, index) => (
                <li key={item.itemId || index} className="rounded-xl border border-slate-200 p-3 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 break-words font-semibold text-slate-800">{item.description}</p>
                    <p className="shrink-0 font-bold text-slate-900">{money(item.totalAmount)}</p>
                  </div>
                  <p className="mt-1 text-slate-500">
                    Art {item.articleNo} · {item.qty} × {money(item.price)} · GST {item.gstPercent}% ({money(item.gstAmount)})
                  </p>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-hidden rounded-xl border border-slate-200 md:block">
              <table className="w-full table-fixed border-collapse text-left">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="w-[14%] p-3">Art no.</th>
                    <th className="p-3">Description</th>
                    <th className="w-[8%] p-3 text-right">Qty</th>
                    <th className="w-[14%] p-3 text-right">Price</th>
                    <th className="w-[16%] p-3 text-right">Tax</th>
                    <th className="w-[15%] p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {invoice.items.map((item, index) => (
                    <tr key={item.itemId || index} className="hover:bg-slate-50/60">
                      <td className="break-words p-3 font-medium text-slate-700">{item.articleNo}</td>
                      <td className="break-words p-3 text-slate-800">{item.description}</td>
                      <td className="p-3 text-right">{item.qty}</td>
                      <td className="p-3 text-right">{money(item.price)}</td>
                      <td className="p-3 text-right">
                        {item.gstPercent}% ({money(item.gstAmount)})
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-900">{money(item.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {invoice.bankDetails ? (
            <Card icon={Landmark} title="Bank details">
              <div className="space-y-1 break-words text-xs">
                <p>
                  <span className="font-semibold text-slate-700">Holder:</span> {invoice.bankDetails.holderName}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">A/C no:</span> {invoice.bankDetails.accountNo} ({invoice.bankDetails.accountType})
                </p>
                <p>
                  <span className="font-semibold text-slate-700">IFSC:</span> {invoice.bankDetails.ifscCode}
                </p>
              </div>
            </Card>
          ) : (
            <span className="hidden md:block" />
          )}

          {invoice.summary && (
            <div className="rounded-2xl bg-slate-900 p-4 text-xs text-slate-300">
              <div className="flex justify-between py-1">
                <span>Gross value</span>
                <span className="font-semibold text-white">{money(invoice.summary.totalGrossValue)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Total tax</span>
                <span className="font-semibold text-white">{money(invoice.summary.totalTax)}</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t border-slate-700 pt-3">
                <span className="text-sm font-semibold text-white">Grand total</span>
                <span className="text-lg font-bold text-brand-400">{money(invoice.summary.totalPayAmount)}</span>
              </div>
              <div className="mt-1 flex justify-between text-emerald-400">
                <span>Paid</span>
                <span className="font-semibold">{money(invoice.summary.paidAmount)}</span>
              </div>
            </div>
          )}
        </div>
      </DialogBody>
    </Dialog>
  );
};

export default InvoiceDetailModal;
