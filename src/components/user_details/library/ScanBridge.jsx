/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { CustomerService } from '../../../backend/ApiService'; 
import { Mail, Phone, Box, CheckCircle2, Search } from 'lucide-react'; 
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
      // Ensure we are working with an array
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
        const payload = { 
            customerId: customerId, 
            logId: logId, 
            isdelivered: true 
        };
        
        // 1. Call the API
        const response = await CustomerService.updateScanbridgeStatus(payload);
        
        // 2. OPTIMISTIC UPDATE: Manually update the local state 
        // This ensures the button changes even if the fetch is slow.
        setCustomers(prev => prev.map(item => 
          item.logId === logId ? { ...item, isdelivered: true } : item
        ));

        await Swal.fire({
          title: 'Success!',
          text: 'Status updated to Delivered.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          borderRadius: '15px'
        });

        // 3. Background Sync: Refresh from DB to keep everything in sync
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

  // Improved filtering logic
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
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-[#E68A45] font-bold text-xl uppercase tracking-tighter">
        Loading Scanbridge Records...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-10 font-sans bg-gray-50/30">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Search Bar */}
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by name, email or company..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Table Container */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-4 bg-[#E68A45] text-white p-5 font-bold text-xs uppercase tracking-widest">
            <div>Customer Profile</div>
            <div>Contact Info</div>
            <div>Log Detail</div>
            <div className="text-right">Action</div>
          </div>

          <div className="divide-y divide-gray-100">
            {currentItems.map((item) => {
              // Robust check for boolean or string "true"
              const isDelivered = item.isdelivered === true || 
                                  item.isdelivered === "true" || 
                                  item.isdelivered === 1;

              return (
                <div key={item.logId} className="grid grid-cols-4 p-6 items-center hover:bg-orange-50/20 transition-colors group">
                  {/* Profile */}
                  <div>
                    <h3 className="text-gray-900 font-bold text-sm uppercase">
                      {item.firstName} {item.lastName}
                    </h3>
                    <p className="text-[#E68A45] text-xs font-semibold mt-0.5">{item.companyName}</p>
                  </div>

                  {/* Contact */}
                  <div className="text-gray-500 text-xs space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-[#E68A45]/70" /> 
                      <span className="truncate max-w-[150px]">{item.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-[#E68A45]/70" /> 
                      <span>{item.mobileNumber || "N/A"}</span>
                    </div>
                  </div>

                  {/* Log Details */}
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isDelivered ? "bg-green-100 text-green-700" : "bg-orange-100 text-[#E68A45]"
                    }`}>
                      <Box size={12} />
                      {item.category || "Scanbridge"}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1.5 ml-1 font-medium">Brand: {item.brandName}</p>
                  </div>

                  {/* Button Action */}
                  <div className="text-right">
                    <button 
                      disabled={isDelivered}
                      onClick={() => handlePatch(item.customerId, item.logId)}
                      className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all border shadow-sm ${
                        isDelivered 
                          ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed" 
                          : "bg-white text-[#E68A45] border-[#FDEBD0] hover:bg-[#E68A45] hover:text-white active:scale-95"
                      }`}
                    >
                      {isDelivered ? (
                        <><CheckCircle2 size={14} /> Delivered</>
                      ) : (
                        "Mark Delivered"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {currentItems.length === 0 && !loading && (
            <div className="p-24 text-center">
               <div className="text-gray-300 font-medium italic">No matching records found.</div>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-end">
          <Pagination 
            totalItems={filteredCustomers.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default ScanbridgeLibrary;