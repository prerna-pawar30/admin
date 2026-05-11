/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Trash2, Plus, Send, FileText, Loader2, Calendar } from 'lucide-react';
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
    // Added specific backend requirement fields
    dueDate: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    permission: "invoice.list.create",
    billTo: {
      companyName: "",
      address: "",
      gstin: "",
      contactPerson: "",
      contactNumber: ""
    },
    items: [
      { description: "", qty: 1, price: 0, gstType: "IGST", gstPercent: 5 }
    ],
    summary: { freightCost: 0, paidAmount: 0 },
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
    newItems[index][field] = field === 'description' ? value : Number(value);
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", qty: 1, price: 0, gstType: "IGST", gstPercent: 5 }]
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
        const response = await InvoiceService.createInvoice(formData);
        
        if (response.success) {
          await MySwal.fire({
            title: <span className="text-black font-black uppercase">Success!</span>,
            text: `Invoice ${response.data.invoiceNumber} created successfully.`,
            icon: 'success',
            confirmButtonColor: '#f97316',
          });
          // Form reset could go here
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
    <div className="max-w-6xl mx-auto p-4 md:p-10 bg-white min-h-screen text-black">
      <form onSubmit={handleSubmit} className="border border-gray-200 shadow-2xl rounded-xl overflow-hidden">
        
        <div className="bg-black p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <FileText className="text-orange-500" size={28} />
            <h1 className="text-xl font-bold tracking-tight uppercase">Manual Invoice Entry</h1>
          </div>
        </div>

        <div className="p-8">
          <div className="space-y-6 mb-10 border-b border-gray-100 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">CSR</label>
                <div className="w-full p-3 bg-gray-50 border-l-4 border-orange-500 text-black font-bold">
                  {formData.customerServiceRep}
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">Delivery Type</label>
                <input 
                  type="text" 
                  value={formData.termsOfDelivery} 
                  className="w-full p-3 border border-gray-300 rounded font-bold outline-none focus:border-orange-500" 
                  onChange={(e) => setFormData({...formData, termsOfDelivery: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">Payment Terms</label>
                <select 
                  value={formData.paymentTerms}
                  className="w-full p-3 border border-gray-300 rounded font-bold outline-none focus:border-orange-500" 
                  onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                >
                  <option>Payable due amount in 10 days</option>
                  <option>Immediate</option>
                  <option>Net 30</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-sm font-black uppercase bg-black text-white inline-block px-4 py-1 mb-6">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-4">
                <input required name="companyName" placeholder="Company Name" className="w-full p-3 border-b border-gray-300 focus:border-orange-500 outline-none transition-colors font-medium" onChange={handleBillToChange} />
                <input required name="contactPerson" placeholder="Attention To" className="w-full p-3 border-b border-gray-300 focus:border-orange-500 outline-none transition-colors font-medium" onChange={handleBillToChange} />
                <input required name="contactNumber" placeholder="Mobile Number" className="w-full p-3 border-b border-gray-300 focus:border-orange-500 outline-none transition-colors font-medium" onChange={handleBillToChange} />
              </div>
              <div className="space-y-4">
                <input name="gstin" placeholder="GST Number" className="w-full p-3 border-b border-gray-300 focus:border-orange-500 outline-none transition-colors font-medium" onChange={handleBillToChange} />
                <textarea required name="address" placeholder="Full Postal Address" rows="3" className="w-full p-3 border border-gray-300 rounded focus:border-orange-500 outline-none transition-all font-medium" onChange={handleBillToChange} />
              </div>
            </div>
          </div>

          <div className="mb-10">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-black text-[10px] font-black uppercase tracking-widest">
                    <th className="p-4">Item Description</th>
                    <th className="p-4 w-24 text-center">Qty</th>
                    <th className="p-4 w-36">Unit Price</th>
                    <th className="p-4 w-32">Tax Type</th>
                    <th className="p-4 w-32 text-right">Raw Total</th>
                    <th className="p-4 w-16 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {formData.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 group">
                      <td className="p-4">
                        <input 
                          required
                          value={item.description} 
                          placeholder="e.g. Lab Analog..." 
                          className="w-full p-2 bg-transparent outline-none font-bold text-gray-800" 
                          onChange={(e) => updateItem(index, 'description', e.target.value)} 
                        />
                      </td>
                      <td className="p-4 text-center">
                        <input 
                          type="number" 
                          value={item.qty} 
                          className="w-16 p-2 text-center border rounded font-black focus:border-orange-500" 
                          onChange={(e) => updateItem(index, 'qty', e.target.value)} 
                        />
                      </td>
                      <td className="p-4">
                        <input 
                          type="number" 
                          value={item.price} 
                          className="w-full p-2 border rounded font-black focus:border-orange-500" 
                          onChange={(e) => updateItem(index, 'price', e.target.value)} 
                        />
                      </td>
                      <td className="p-4">
                        <div className="text-[10px] font-black bg-orange-100 text-orange-700 px-2 py-1 rounded inline-block uppercase">
                          {item.gstType} {item.gstPercent}%
                        </div>
                      </td>
                      <td className="p-4 text-right font-black text-sm">
                        ₹{(item.qty * item.price).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          type="button" 
                          onClick={() => removeItem(index)} 
                          className="text-gray-300 hover:text-red-600 transition-opacity opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button 
              type="button" 
              onClick={addItem} 
              className="mt-6 flex items-center gap-2 text-black font-black uppercase text-[10px] tracking-[0.2em] hover:text-orange-600 transition-all"
            >
              <Plus size={14} className="bg-black text-white rounded p-0.5" /> Add Product
            </button>
          </div>

          <div className="flex flex-col md:flex-row justify-end items-start border-t border-gray-100 pt-8">
            <div className="w-full md:w-80 space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                  <span>Shipping Cost</span>
                  <input 
                    type="number" 
                    className="w-20 text-right bg-transparent border-b border-gray-200 outline-none focus:border-black font-bold text-black"
                    value={formData.summary.freightCost}
                    onChange={(e) => setFormData({
                      ...formData, 
                      summary: { ...formData.summary, freightCost: Number(e.target.value) }
                    })}
                  />
                </div>
                <p className="text-[9px] text-gray-400 italic">Taxes and final summary will be generated by the system upon submission.</p>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-5 rounded-xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 text-xs
                  ${loading 
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                    : "bg-black text-white hover:bg-orange-500"
                  }`}
              >
                {loading ? (
                  <> <Loader2 className="animate-spin" size={18} /> Syncing... </>
                ) : (
                  <> <Send size={16} /> Create Invoice </>
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