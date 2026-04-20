import React, { useState } from 'react';
import { Trash2, Plus, Send, FileText, Loader2 } from 'lucide-react';
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
  customerServiceRep: "Vithal sir ( MD )",
  // Added Date Fields
  invoiceDate: new Date().toISOString().split('T')[0], // Defaults to today
  orderDate: "",
  deliveryDate: "",
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

  // Handle nested billTo changes
  const handleBillToChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      billTo: { ...prev.billTo, [name]: value }
    }));
  };

  // Handle Line Items
  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
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

  const calculateSubtotal = () => 
    formData.items.reduce((acc, item) => acc + (Number(item.qty) * Number(item.price)), 0);
  
  const calculateTax = () => 
    formData.items.reduce((acc, item) => acc + (Number(item.qty) * Number(item.price) * (Number(item.gstPercent) / 100)), 0);

  const total = calculateSubtotal() + calculateTax() + Number(formData.summary.freightCost);

  // API Call Execution with SweetAlert
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Confirmation Dialog
    const result = await MySwal.fire({
      title: <span className="text-black font-black uppercase text-xl">Generate Invoice?</span>,
      text: "This will create a formal invoice in the system.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Create it!',
      cancelButtonText: 'No, Keep Editing',
      confirmButtonColor: '#f97316', // Orange-500
      cancelButtonColor: '#000000', // Black
      background: '#ffffff',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await InvoiceService.createInvoice(formData);
        
        if (response.success) {
          await MySwal.fire({
            title: <span className="text-black font-black uppercase">Success!</span>,
            text: `Invoice #${response.data.invoiceNumber} has been created.`,
            icon: 'success',
            confirmButtonColor: '#f97316',
          });
          // Optional: reset form or redirect here
        }
      } catch (error) {
        MySwal.fire({
          title: <span className="text-red-600 font-black uppercase">Submission Failed</span>,
          text: error.response?.data?.message || "Something went wrong while creating the invoice.",
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
        
        {/* Top Header Bar */}
        <div className="bg-black p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <FileText className="text-orange-500" size={28} />
            <h1 className="text-xl font-bold tracking-tight uppercase">New Invoice</h1>
          </div>
          <div className="flex items-center gap-4">
            {loading && <Loader2 className="animate-spin text-orange-500" size={20} />}
            <span className="bg-orange-500 text-black px-3 py-1 rounded-full text-xs font-black">
              DRAFT MODE
            </span>
          </div>
        </div>

        <div className="p-8">
          {/* Header Info Section */}

        <div className="space-y-6 mb-10 border-b border-gray-100 pb-8">
        {/* Row 1: General Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
            <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">CSR Name</label>
            <div className="w-full p-3 bg-gray-50 border-l-4 border-orange-500 text-black font-bold">
                {formData.customerServiceRep}
            </div>
            </div>
            <div>
            <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">Terms of Delivery</label>
            <input 
                type="text" 
                value={formData.termsOfDelivery} 
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-black outline-none transition-all" 
                onChange={(e) => setFormData({...formData, termsOfDelivery: e.target.value})} 
            />
            </div>
            <div>
            <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">Payment Terms</label>
            <select 
                value={formData.paymentTerms}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-black outline-none transition-all font-medium" 
                onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
            >
                <option>Payable due amount in 10 days</option>
                <option>Immediate</option>
                <option>Net 30</option>
            </select>
            </div>
        </div>

        {/* Row 2: Dates Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-orange-50/50 p-4 rounded-lg border border-orange-100">
            <div>
            <label className="block text-[10px] font-black uppercase text-orange-600 mb-1 tracking-widest">Invoice Date</label>
            <input 
                type="date" 
                required
                value={formData.invoiceDate}
                className="w-full p-2 bg-white border border-gray-300 rounded text-sm font-bold outline-none focus:border-black"
                onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})}
            />
            </div>

            <div>
            <label className="block text-[10px] font-black uppercase text-orange-600 mb-1 tracking-widest">Order Date</label>
            <input 
                type="date" 
                value={formData.orderDate}
                className="w-full p-2 bg-white border border-gray-300 rounded text-sm font-bold outline-none focus:border-black"
                onChange={(e) => setFormData({...formData, orderDate: e.target.value})}
            />
            </div>
            <div>
            <label className="block text-[10px] font-black uppercase text-orange-600 mb-1 tracking-widest">Delivery Date</label>
            <input 
                type="date" 
                value={formData.deliveryDate}
                className="w-full p-2 bg-white border border-gray-300 rounded text-sm font-bold outline-none focus:border-black"
                onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
            />
            </div>
        </div>
        </div>

          {/* Bill To Section */}
          <div className="mb-10">
            <h2 className="text-sm font-black uppercase bg-black text-white inline-block px-4 py-1 mb-6 tracking-tighter">Billing Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-4">
                <input required name="companyName" placeholder="Client Company Name" className="w-full p-3 border-b border-gray-300 focus:border-orange-500 outline-none transition-colors" onChange={handleBillToChange} />
                <input required name="contactPerson" placeholder="Contact Person" className="w-full p-3 border-b border-gray-300 focus:border-orange-500 outline-none transition-colors" onChange={handleBillToChange} />
                <input required name="contactNumber" placeholder="Contact Number" className="w-full p-3 border-b border-gray-300 focus:border-orange-500 outline-none transition-colors" onChange={handleBillToChange} />
              </div>
              <div className="space-y-4">
                <input name="gstin" placeholder="GSTIN (Optional)" className="w-full p-3 border-b border-gray-300 focus:border-orange-500 outline-none transition-colors" onChange={handleBillToChange} />
                <textarea required name="address" placeholder="Full Billing Address" rows="3" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none transition-all" onChange={handleBillToChange} />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-10">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-black text-xs font-black uppercase tracking-widest">
                    <th className="p-4">Description</th>
                    <th className="p-4 w-24 text-center">Qty</th>
                    <th className="p-4 w-36">Price (₹)</th>
                    <th className="p-4 w-32">GST %</th>
                    <th className="p-4 w-36 text-right">Total</th>
                    <th className="p-4 w-16 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {formData.items.map((item, index) => (
                    <tr key={index} className="hover:bg-orange-50 transition-colors group">
                      <td className="p-4">
                        <input 
                          required
                          value={item.description} 
                          placeholder="Item description..." 
                          className="w-full p-2 bg-transparent border border-transparent focus:border-gray-300 rounded outline-none font-medium" 
                          onChange={(e) => updateItem(index, 'description', e.target.value)} 
                        />
                      </td>
                      <td className="p-4">
                        <input 
                          type="number" 
                          value={item.qty} 
                          className="w-full p-2 text-center bg-transparent border border-gray-200 rounded outline-none focus:border-orange-500 font-bold" 
                          onChange={(e) => updateItem(index, 'qty', e.target.value)} 
                        />
                      </td>
                      <td className="p-4">
                        <input 
                          type="number" 
                          value={item.price} 
                          className="w-full p-2 bg-transparent border border-gray-200 rounded outline-none focus:border-orange-500 font-bold" 
                          onChange={(e) => updateItem(index, 'price', e.target.value)} 
                        />
                      </td>
                      <td className="p-4">
                        <select 
                          value={item.gstPercent} 
                          className="w-full p-2 bg-transparent border border-gray-200 rounded outline-none focus:border-orange-500 font-medium"
                          onChange={(e) => updateItem(index, 'gstPercent', e.target.value)}
                        >
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                        </select>
                      </td>
                      <td className="p-4 text-right font-black text-gray-900">
                        ₹{(Number(item.qty) * Number(item.price) * (1 + Number(item.gstPercent)/100)).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          type="button" 
                          onClick={() => removeItem(index)} 
                          className="text-gray-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={20} />
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
              className="mt-6 group flex items-center gap-2 text-black font-black uppercase text-xs tracking-widest hover:text-orange-600 transition-all"
            >
              <span className="bg-orange-500 group-hover:bg-black text-white p-1.5 rounded transition-colors shadow-md">
                <Plus size={16} />
              </span>
              Add Line Item
            </button>
          </div>

          {/* Footer Summary Section */}
          <div className="flex flex-col md:flex-row justify-end items-start border-t-4 border-black pt-8">
            <div className="w-full md:w-80 space-y-4">
              <div className="flex justify-between text-gray-500 font-black text-xs uppercase tracking-tighter">
                <span>Subtotal (Net)</span>
                <span className="text-black text-sm">₹{calculateSubtotal().toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-black text-xs uppercase tracking-tighter">
                <span>Tax Amount (IGST)</span>
                <span className="text-black text-sm">₹{calculateTax().toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between text-xl font-black border-t-2 border-gray-100 pt-4">
                <span className="tracking-tighter">TOTAL AMOUNT</span>
                <span className="text-orange-500">₹{total.toLocaleString('en-IN')}</span>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-5 rounded-xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 text-sm
                  ${loading 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-black text-orange-500 hover:bg-orange-500 hover:text-black"
                  }`}
              >
                {loading ? (
                  <> <Loader2 className="animate-spin" size={20} /> Processing... </>
                ) : (
                  <> <Send size={18} /> Generate & Issue </>
                )}
              </button>
              
              <p className="text-[10px] text-center text-gray-400 font-medium">
                Review all items before issuing. This action will generate a formal PDF invoice.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;