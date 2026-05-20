/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { CustomerService } from '../../../backend/ApiService'; 
import { Mail, Phone, Box, CheckCircle2, Search, Library, RefreshCw } from 'lucide-react'; 
import Pagination from '../../ui/Pagination'; 
import Swal from 'sweetalert2';

const ScanbridgeLibrary = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await CustomerService.getScanbridgeLibrary();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching scanbridge data:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePatch = async (customerId, logId) => {
    const result = await Swal.fire({
      title: 'Confirm Delivery',
      text: "Are you sure you want to mark this as delivered?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#E68A45',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, mark delivered',
      borderRadius: '15px'
    });

    if (result.isConfirmed) {
      try {
        const payload = { customerId, logId, isdelivered: true };
        
        await CustomerService.updateScanbridgeStatus(payload);
        
        // Optimistic State Update
        setCustomers(prev => prev.map(item => 
          item.logId === logId ? { ...item, isdelivered: true } : item
        ));

        await Swal.fire({
          title: 'Success!',
          text: 'Status updated to Delivered.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });

        fetchCustomers(); 
      } catch (err) {
        Swal.fire({
          title: 'Update Failed',
          text: 'The server could not update the status.',
          icon: 'error',
          confirmButtonColor: '#E68A45'
        });
      }
    }
  };

  const filteredCustomers = customers.filter(item => 
    item?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

  if (loading && customers.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/50 gap-3">
      <RefreshCw className="animate-spin text-[#E68A45]" size={32} />
      <div className="text-[#E68A45] font-bold text-sm uppercase tracking-widest">
        Loading Scanbridge Records...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 font-sans bg-slate-50/50 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP CONTROLS CAPTION */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-xl text-[#E68A45]">
              <Library size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Scanbridge <span className="text-[#E68A45]">Fulfillment</span>
              </h2>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                Manage logistics operations and track customer packages
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by name, email or company..."
              className="block w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium outline-none transition-all focus:bg-white focus:ring-2 focus:ring-orange-500/10 focus:border-[#E68A45]"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {/* CORE TABLE VIEW COMPONENT */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          {/* Responsive Header Hidden on Mobile grids */}
          <div className="hidden md:grid grid-cols-4 bg-[#E68A45] text-white p-5 font-bold text-xs uppercase tracking-wider">
            <div>Customer Profile</div>
            <div>Contact Info</div>
            <div>Log Detail</div>
            <div className="text-right pr-4">Action</div>
          </div>

          <div className="divide-y divide-slate-100">
            {currentItems.map((item) => {
              const isDelivered = item.isdelivered === true || 
                                  item.isdelivered === "true" || 
                                  item.isdelivered === 1;

              return (
                <div key={item.logId} className="grid grid-cols-1 md:grid-cols-4 p-5 md:p-6 gap-4 md:gap-2 items-center hover:bg-slate-50/40 transition-colors group relative">
                  
                  {/* Column 1: Profile */}
                  <div>
                    <span className="md:hidden block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Customer Profile</span>
                    <h3 className="text-slate-900 font-bold text-sm uppercase tracking-tight">
                      {item.firstName} {item.lastName}
                    </h3>
                    <p className="text-[#E68A45] text-xs font-semibold mt-0.5">{item.companyName || 'N/A'}</p>
                  </div>

                  {/* Column 2: Contact Info */}
                  <div>
                    <span className="md:hidden block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Info</span>
                    <div className="text-slate-500 text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-400 group-hover:text-[#E68A45] transition-colors" /> 
                        <span className="truncate max-w-[180px]">{item.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400 group-hover:text-[#E68A45] transition-colors" /> 
                        <span>{item.mobileNumber || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Log Specifications */}
                  <div>
                    <span className="md:hidden block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Log Detail</span>
                    <div className="inline-flex flex-col items-start">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                        isDelivered ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 text-[#E68A45]"
                      }`}>
                        <Box size={11} />
                        {item.category || "Scanbridge"}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium pl-0.5">Brand: {item.brandName || "N/A"}</p>
                    </div>
                  </div>

                  {/* Column 4: Delivery Button Actions */}
                  <div className="text-left md:text-right">
                    <button 
                      disabled={isDelivered}
                      onClick={() => handlePatch(item.customerId, item.logId)}
                      className={`inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all border w-full md:w-auto shadow-sm ${
                        isDelivered 
                          ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed" 
                          : "bg-white text-[#E68A45] border-orange-200 hover:bg-[#E68A45] hover:text-white active:scale-95"
                      }`}
                    >
                      {isDelivered ? (
                        <>
                          <CheckCircle2 size={14} className="text-emerald-500" /> 
                          <span>Delivered</span>
                        </>
                      ) : (
                        "Mark Delivered"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fallback Screen empty data state */}
          {currentItems.length === 0 && !loading && (
            <div className="py-20 text-center">
              <div className="text-slate-400 font-medium italic text-sm">No matching log history entries found.</div>
            </div>
          )}

          {/* Table Footer with Pagination Controls */}
          <div className="p-4 border-t border-slate-100 flex justify-center md:justify-end bg-slate-50/30">
            <Pagination 
              totalItems={filteredCustomers.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanbridgeLibrary;