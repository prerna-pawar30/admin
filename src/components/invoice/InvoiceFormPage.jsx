/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Trash2, Plus, Send, FileText, Loader2, IndianRupee, ShoppingCart, Package } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { InvoiceService } from '../../backend/ApiService';

const MySwal = withReactContent(Swal);

const CreateInvoice = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    paymentTerms: "Payable due amount in 10 days",
    termsOfDelivery: "CIP Telangana",
    shippingCondition: "Normal",
    customerServiceRep: "Vithalsir ( MD )",
    dueDate: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    permission: "invoice.listing.create",
    billTo: {
      companyName: "",
      address: "",
      gstin: "",
      contactPerson: "",
      contactNumber: ""
    },
    // Changed: qty and price start as empty strings so inputs are blank, not '0'
    items: [
      { description: "", qty: "", price: "", gstType: "IGST", gstPercent: 5 }
    ],
    summary: { freightCost: "", paidAmount: 0 },
    status: "issued"
  });

  const handleBillToChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      billTo: { ...prev.billTo, [name]: value }
    }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    // Keep as string while typing to allow empty inputs, convert to number only on submission
    newItems[index][field] = value; 
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", qty: "", price: "", gstType: "IGST", gstPercent: 5 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs before sending to backend
    const validatedItems = formData.items.map(item => ({
      ...item,
      qty: Number(item.qty) || 0,
      price: Number(item.price) || 0
    }));

    const result = await MySwal.fire({
      title: <span className="text-black font-black uppercase text-xl">Generate Invoice?</span>,
      text: "Backend will calculate taxes and totals automatically.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Create it!',
      cancelButtonText: 'No, Keep Editing',
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#000000',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await InvoiceService.createInvoice({ ...formData, items: validatedItems });
        
        if (response.success) {
          await MySwal.fire({
            title: <span className="text-black font-black uppercase">Success!</span>,
            text: `Invoice ${response.data.invoiceNumber} created successfully.`,
            icon: 'success',
            confirmButtonColor: '#f97316',
          });
        }
      } catch (error) {
        MySwal.fire({
          title: <span className="text-red-600 font-black uppercase">Submission Failed</span>,
          text: error.response?.data?.message || "Error communicating with server.",
          icon: 'error',
          confirmButtonColor: '#000000',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 bg-slate-50 min-h-screen text-black">
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-lg">
                <FileText className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tight uppercase">New Tax Invoice</h1>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {/* Top Section: Logic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                <p className="text-[10px] font-black text-orange-600 uppercase mb-1">Assigned CSR</p>
                <p className="font-bold text-slate-800">{formData.customerServiceRep}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Delivery Method</p>
                <input 
                  className="w-full bg-transparent font-bold outline-none focus:text-orange-600"
                  value={formData.termsOfDelivery}
                  onChange={(e) => setFormData({...formData, termsOfDelivery: e.target.value})}
                />
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Payment Timeline</p>
                <select 
                  className="w-full bg-transparent font-bold outline-none cursor-pointer"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                >
                   <option>Payable due amount in 10 days</option>
                   <option>Immediate</option>
                   <option>Net 30</option>
                </select>
            </div>
          </div>

          {/* Client Section */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Client Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 p-6 rounded-2xl border border-dashed border-slate-200">
              <div className="space-y-5">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Company / Clinic Name</label>
                    <input required name="companyName" placeholder="Enter full name..." className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 ring-orange-500/20 outline-none transition-all font-bold" onChange={handleBillToChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Contact Person</label>
                        <input required name="contactPerson" placeholder="Name" className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none font-bold" onChange={handleBillToChange} />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Mobile No.</label>
                        <input required name="contactNumber" placeholder="+91" className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none font-bold" onChange={handleBillToChange} />
                    </div>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">GST Identification Number</label>
                    <input name="gstin" placeholder="22AAAAA0000A1Z5" className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none font-bold uppercase" onChange={handleBillToChange} />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Shipping Address</label>
                    <textarea required name="address" placeholder="Building, Street, City, State, PIN" rows="2" className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none font-bold resize-none" onChange={handleBillToChange} />
                </div>
              </div>
            </div>
          </div>

          {/* Items Section - New UI */}
          <div className="mb-10">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Order Items</h2>
                </div>
             </div>

             <div className="space-y-4">
                {formData.items.map((item, index) => (
                    <div key={index} className="group relative bg-white border border-slate-200 rounded-xl p-5 hover:border-orange-300 transition-all shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                            <div className="md:col-span-5">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase mb-2">
                                    <Package size={12}/> Product Description
                                </label>
                                <input 
                                  required
                                  value={item.description} 
                                  placeholder="What are you selling?" 
                                  className="w-full p-2 border-b-2 border-slate-100 focus:border-orange-500 outline-none font-bold text-lg transition-colors" 
                                  onChange={(e) => updateItem(index, 'description', e.target.value)} 
                                />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Quantity</label>
                                <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200">
                                    <input 
                                        type="number" 
                                        placeholder="0"
                                        value={item.qty} 
                                        className="w-full bg-transparent p-1 text-center font-black text-slate-800 outline-none" 
                                        onChange={(e) => updateItem(index, 'qty', e.target.value)} 
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Unit Price (₹)</label>
                                <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200 focus-within:border-orange-500">
                                    <span className="pl-2 text-slate-400 font-bold">₹</span>
                                    <input 
                                        type="number" 
                                        placeholder="Price"
                                        value={item.price} 
                                        className="w-full bg-transparent p-1 text-right font-black text-slate-800 outline-none px-2" 
                                        onChange={(e) => updateItem(index, 'price', e.target.value)} 
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Item Total</label>
                                <div className="p-2 text-right font-black text-orange-600 bg-orange-50 rounded-lg border border-orange-100">
                                    ₹{((Number(item.qty) || 0) * (Number(item.price) || 0)).toLocaleString('en-IN')}
                                </div>
                            </div>

                            <div className="md:col-span-1 text-center">
                                {formData.items.length > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => removeItem(index)} 
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
             </div>

            <button 
              type="button" 
              onClick={addItem} 
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-bold uppercase text-[11px] tracking-widest hover:border-orange-500 hover:text-orange-600 transition-all w-full justify-center group"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Add Another Product
            </button>
          </div>

          {/* Summary & Submit */}
          <div className="flex flex-col md:flex-row justify-between items-center border-t border-slate-100 pt-10 gap-8">
            <div className="flex items-center gap-3 text-slate-400 bg-slate-100 px-4 py-2 rounded-full">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">System will auto-calculate IGST/GST & Grand Total</span>
            </div>

            <div className="w-full md:w-80 space-y-4">
              <div className="flex justify-between items-center px-4 py-3 bg-slate-900 text-white rounded-xl">
                 <span className="text-[10px] font-black uppercase tracking-widest">Freight / Shipping</span>
                 <div className="flex items-center gap-2">
                    <span className="text-slate-500">₹</span>
                    <input 
                        type="number" 
                        placeholder="0"
                        className="w-20 text-right bg-transparent outline-none font-black text-white"
                        value={formData.summary.freightCost}
                        onChange={(e) => setFormData({
                        ...formData, 
                        summary: { ...formData.summary, freightCost: e.target.value }
                        })}
                    />
                 </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-5 rounded-xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 text-xs
                  ${loading 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-orange-200"
                  }`}
              >
                {loading ? (
                  <> <Loader2 className="animate-spin" size={18} /> Processing... </>
                ) : (
                  <> <Send size={16} /> Finalize & Create Invoice </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;