import React, { useState } from "react";
import { InvoiceService } from "../../backend/ApiService";
import { X, Building2, Truck, FileText, User, ShoppingBag, Calculator } from "lucide-react";

const UpdateInvoiceModal = ({ invoice, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    status: invoice.status || "issued",
    paymentTerms: invoice.paymentTerms || "",
    termsOfDelivery: invoice.termsOfDelivery || "",
    shippingCondition: invoice.shippingCondition || "",
    customerServiceRep: invoice.customerServiceRep || "",
    notes: invoice.notes || "",
    invoiceDate: invoice.invoiceDate 
    ? new Date(invoice.invoiceDate).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0],
  orderDate: invoice.orderDate 
    ? new Date(invoice.orderDate).toISOString().split('T')[0] 
    : "",
  deliveryDate: invoice.deliveryDate 
    ? new Date(invoice.deliveryDate).toISOString().split('T')[0] 
    : "",
    billTo: {
      companyName: invoice.billTo?.companyName || "",
      address: invoice.billTo?.address || "",
      gstin: invoice.billTo?.gstin || "",
      contactPerson: invoice.billTo?.contactPerson || "",
      contactNumber: invoice.billTo?.contactNumber || "",
    },
    items: invoice.items || [], // Array of items
    summary: {
      freightCost: invoice.summary?.freightCost || 0,
      paidAmount: invoice.summary?.paidAmount || 0,
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handlers for nested fields
  const handleBillToChange = (field, value) => {
    setFormData(prev => ({ ...prev, billTo: { ...prev.billTo, [field]: value } }));
  };

  const handleSummaryChange = (field, value) => {
    setFormData(prev => ({ ...prev, summary: { ...prev.summary, [field]: Number(value) } }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: field === 'description' ? value : Number(value) };
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await InvoiceService.updateInvoice(invoice.invoiceId || invoice._id, formData);
      alert("Invoice updated successfully!");
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Update Error:", error);
      alert("Update failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden border border-orange-100 animate-in fade-in zoom-in duration-200 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-orange-500 p-4 flex justify-between items-center text-white shrink-0">
          <h2 className="text-lg font-bold text-white">Update Invoice #{invoice.invoiceNumber}</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors text-white">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-8 bg-white text-left">
          
          {/* 1. Billing Details */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-orange-600 font-bold text-sm uppercase border-b border-orange-100 pb-2">
              <Building2 size={16} /> Customer Information
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Company Name</label>
                <input className="w-full border-gray-200 border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none" value={formData.billTo.companyName} onChange={(e) => handleBillToChange("companyName", e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">GSTIN</label>
                <input className="w-full border-gray-200 border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none" value={formData.billTo.gstin} onChange={(e) => handleBillToChange("gstin", e.target.value)} />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Address</label>
                <textarea className="w-full border-gray-200 border rounded-lg p-2 h-16 focus:ring-2 focus:ring-orange-500 outline-none" value={formData.billTo.address} onChange={(e) => handleBillToChange("address", e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Contact Person</label>
                <input className="w-full border-gray-200 border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none" value={formData.billTo.contactPerson} onChange={(e) => handleBillToChange("contactPerson", e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Contact Number</label>
                <input className="w-full border-gray-200 border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none" value={formData.billTo.contactNumber} onChange={(e) => handleBillToChange("contactNumber", e.target.value)} />
              </div>
            </div>

            
          </section>

          

            {/* 2. Order & Shipping Details */}
            <section className="space-y-4">
            <div className="flex items-center gap-2 text-orange-600 font-bold text-sm uppercase border-b border-orange-100 pb-2">
                <Truck size={16} /> Timeline & Logistics
            </div>
            
            {/* Row 1: Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-orange-50/30 p-3 rounded-xl border border-orange-100/50">
                <div>
                <label className="block text-[10px] font-bold text-orange-700 uppercase mb-1">Invoice Date</label>
                <input 
                    type="date" 
                    className="w-full border-gray-200 border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none bg-white" 
                    value={formData.invoiceDate} 
                    onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})} 
                />
                </div>
                <div>
                <label className="block text-[10px] font-bold text-orange-700 uppercase mb-1">Order Date</label>
                <input 
                    type="date" 
                    className="w-full border-gray-200 border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none bg-white" 
                    value={formData.orderDate} 
                    onChange={(e) => setFormData({...formData, orderDate: e.target.value})} 
                />
                </div>
                <div>
                <label className="block text-[10px] font-bold text-orange-700 uppercase mb-1">Delivery Date</label>
                <input 
                    type="date" 
                    className="w-full border-gray-200 border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none bg-white" 
                    value={formData.deliveryDate} 
                    onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})} 
                />
                </div>
            </div>

            {/* Row 2: General Logistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Delivery Terms</label>
                <input className="w-full border-gray-200 border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none" value={formData.termsOfDelivery} onChange={(e) => setFormData({...formData, termsOfDelivery: e.target.value})} />
                </div>
                <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Shipping Cond.</label>
                <input className="w-full border-gray-200 border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none" value={formData.shippingCondition} onChange={(e) => setFormData({...formData, shippingCondition: e.target.value})} />
                </div>
                <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Service Rep</label>
                <input className="w-full border-gray-200 border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none font-medium text-orange-700" value={formData.customerServiceRep} onChange={(e) => setFormData({...formData, customerServiceRep: e.target.value})} />
                </div>
                <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Status</label>
                <select className="w-full border-gray-200 border rounded-lg p-2 bg-white outline-none focus:ring-2 focus:ring-orange-500" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="issued">Issued</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                </div>
            </div>
            </section>

          {/* 3. Items List */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-orange-600 font-bold text-sm uppercase border-b border-orange-100 pb-2">
              <ShoppingBag size={16} /> Line Items
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end border-b border-gray-200 pb-3 last:border-0">
                  <div className="col-span-6">
                    <label className="block text-[9px] text-gray-400 uppercase font-bold">Description</label>
                    <input className="w-full border-gray-200 border rounded p-1.5 text-sm outline-none" value={item.description} onChange={(e) => handleItemChange(index, "description", e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[9px] text-gray-400 uppercase font-bold">Qty</label>
                    <input type="number" className="w-full border-gray-200 border rounded p-1.5 text-sm outline-none" value={item.qty} onChange={(e) => handleItemChange(index, "qty", e.target.value)} />
                  </div>
                  <div className="col-span-4">
                    <label className="block text-[9px] text-gray-400 uppercase font-bold">Price (₹)</label>
                    <input type="number" className="w-full border-gray-200 border rounded p-1.5 text-sm outline-none" value={item.price} onChange={(e) => handleItemChange(index, "price", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Financial Summary */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-orange-600 font-bold text-sm uppercase border-b border-orange-100 pb-2">
              <Calculator size={16} /> Summary & Payment
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Payment Terms</label>
                  <input className="w-full border-gray-200 border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none" value={formData.paymentTerms} onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Internal Notes</label>
                  <textarea className="w-full border-gray-200 border rounded-lg p-2 h-20 focus:ring-2 focus:ring-orange-500 outline-none" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                </div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-orange-800">Freight Cost (₹)</span>
                  <input type="number" className="w-24 border-gray-200 border rounded p-1 text-right outline-none" value={formData.summary.freightCost} onChange={(e) => handleSummaryChange("freightCost", e.target.value)} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-orange-800">Amount Paid (₹)</span>
                  <input type="number" className="w-24 border-gray-200 border rounded p-1 text-right outline-none" value={formData.summary.paidAmount} onChange={(e) => handleSummaryChange("paidAmount", e.target.value)} />
                </div>
              </div>
            </div>
          </section>
        </form>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-gray-600 font-bold bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 disabled:opacity-50">
            {isSubmitting ? "Saving..." : "Update Full Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateInvoiceModal;