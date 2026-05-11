import React, { useState } from "react";
import { InvoiceService } from "../../backend/ApiService";
import Swal from "sweetalert2"; // Import SweetAlert2
import { 
  X, Building2, Truck, FileText, User, 
  ShoppingBag, Calculator, Trash2, Plus 
} from "lucide-react";

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
    items: invoice.items && invoice.items.length > 0 
      ? [...invoice.items] 
      : [{ description: "", qty: 1, price: 0 }],
    summary: {
      freightCost: invoice.summary?.freightCost || 0,
      paidAmount: invoice.summary?.paidAmount || 0,
    },
    permission: "invoice.list.update"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Handlers ---

  const handleBillToChange = (field, value) => {
    setFormData(prev => ({ ...prev, billTo: { ...prev.billTo, [field]: value } }));
  };

  const handleSummaryChange = (field, value) => {
    setFormData(prev => ({ ...prev, summary: { ...prev.summary, [field]: Number(value) } }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { 
        ...updatedItems[index], 
        [field]: field === 'description' ? value : Number(value) 
    };
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const addNewItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: "", qty: 1, price: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) {
        Swal.fire({
            icon: 'warning',
            title: 'Action Denied',
            text: 'At least one item is required in the invoice.',
            confirmButtonColor: '#f97316'
        });
        return;
    }
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Confirmation Dialog
    const result = await Swal.fire({
      title: "Update Invoice?",
      text: "Are you sure you want to save these changes?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316", // Orange-500
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Yes, update it!"
    });

    if (result.isConfirmed) {
      setIsSubmitting(true);
      try {
        await InvoiceService.updateInvoice(invoice.invoiceId || invoice._id, formData);
        
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Invoice has been updated successfully.",
          timer: 2000,
          showConfirmButton: false
        });

        onRefresh();
        onClose();
      } catch (error) {
        console.error("Update Error:", error);
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: error.response?.data?.message || "Something went wrong while updating.",
          confirmButtonColor: "#ef4444"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[100]">
      <div className="bg-white rounded-2xl w-full max-w-full sm:max-w-lg md:max-w-2xl shadow-2xl overflow-hidden border border-orange-100 animate-in fade-in zoom-in duration-200 max-h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-orange-500 p-4 flex justify-between items-center text-white shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Update Invoice</h2>
            <p className="text-orange-100 text-xs">#{invoice.invoiceNumber || "Draft"}</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors text-white">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-6 overflow-y-auto space-y-8 bg-white text-left">
          
          {/* 1. Billing Details */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-orange-700 font-bold text-xs sm:text-sm uppercase bg-orange-50 px-2 sm:px-3 py-2 rounded border border-orange-100">
              <Building2 size={16} /> Customer Information
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
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
            <div className="flex items-center gap-2 text-orange-700 font-bold text-xs sm:text-sm uppercase bg-orange-50 px-2 sm:px-3 py-2 rounded border border-orange-100">
              <Truck size={16} /> Timeline & Logistics
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 bg-orange-50/30 p-2 sm:p-3 rounded-xl border border-orange-100/50">
              <div>
                <label className="block text-[10px] font-bold text-orange-700 uppercase mb-1">Invoice Date</label>
                <input type="date" className="w-full border-gray-200 border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none bg-white" value={formData.invoiceDate} onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-orange-700 uppercase mb-1">Order Date</label>
                <input type="date" className="w-full border-gray-200 border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none bg-white" value={formData.orderDate} onChange={(e) => setFormData({...formData, orderDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-orange-700 uppercase mb-1">Delivery Date</label>
                <input type="date" className="w-full border-gray-200 border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none bg-white" value={formData.deliveryDate} onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mt-2">
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
            <div className="flex items-center justify-between gap-2 text-orange-700 font-bold text-xs sm:text-sm uppercase bg-orange-50 px-2 sm:px-3 py-2 rounded border border-orange-100">
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} /> Line Items
              </div>
              <button 
                type="button" 
                onClick={addNewItem}
                className="flex items-center gap-1 bg-orange-500 text-white px-2 py-1 rounded-md text-[10px] hover:bg-orange-600 transition-colors"
              >
                <Plus size={12} /> Add Item
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-2 sm:p-4 space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 sm:gap-3 items-end border-b border-gray-200 pb-3 last:border-0 group">
                  <div className="col-span-11 grid grid-cols-12 gap-2 sm:gap-3">
                    <div className="col-span-12 sm:col-span-6">
                      <label className="block text-[9px] text-gray-400 uppercase font-bold">Description</label>
                      <input className="w-full border-gray-200 border rounded p-1.5 text-sm outline-none" value={item.description} onChange={(e) => handleItemChange(index, "description", e.target.value)} />
                    </div>
                    <div className="col-span-5 sm:col-span-2">
                      <label className="block text-[9px] text-gray-400 uppercase font-bold">Qty</label>
                      <input type="number" className="w-full border-gray-200 border rounded p-1.5 text-sm outline-none" value={item.qty} onChange={(e) => handleItemChange(index, "qty", e.target.value)} />
                    </div>
                    <div className="col-span-7 sm:col-span-4">
                      <label className="block text-[9px] text-gray-400 uppercase font-bold">Price (₹)</label>
                      <input type="number" className="w-full border-gray-200 border rounded p-1.5 text-sm outline-none" value={item.price} onChange={(e) => handleItemChange(index, "price", e.target.value)} />
                    </div>
                  </div>
                  
                  <div className="col-span-1 flex justify-center mb-1">
                    <button 
                      type="button" 
                      onClick={() => removeItem(index)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Financial Summary */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-orange-700 font-bold text-xs sm:text-sm uppercase bg-orange-50 px-2 sm:px-3 py-2 rounded border border-orange-100">
              <Calculator size={16} /> Summary & Payment
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Payment Terms</label>
                  <input className="w-full border-gray-200 border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none" value={formData.paymentTerms} onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Internal Notes</label>
                  <textarea className="w-full border-gray-200 border rounded-lg p-2 h-20 focus:ring-2 focus:ring-orange-500 outline-none resize-none" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                </div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-orange-800">Freight Cost (₹)</span>
                  <input type="number" className="w-24 border-gray-200 border rounded p-1 text-right outline-none" value={formData.summary.freightCost} onChange={(e) => handleSummaryChange("freightCost", e.target.value)} />
                </div>
                <div className="flex justify-between items-center border-t border-orange-200 pt-4">
                  <span className="text-sm font-bold text-orange-800">Amount Paid (₹)</span>
                  <input type="number" className="w-24 border-gray-200 border rounded p-1 text-right outline-none" value={formData.summary.paidAmount} onChange={(e) => handleSummaryChange("paidAmount", e.target.value)} />
                </div>
              </div>
            </div>
          </section>
        </form>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0 sticky bottom-0 z-10">
          <button 
            type="button" 
            onClick={onClose} 
            className="w-full sm:flex-1 px-4 py-2.5 text-gray-600 font-bold bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting} 
            className="w-full sm:flex-1 px-4 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Processing..." : "Update Full Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateInvoiceModal;