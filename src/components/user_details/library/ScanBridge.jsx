/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { CustomerService } from '../../../backend/ApiService'; 
import { Mail, Phone, Box, CheckCircle2, Search } from 'lucide-react'; 
import Pagination from '../../ui/Pagination'; 
import Swal from 'sweetalert2'; // 1. Import SweetAlert2

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
      const res = await CustomerService.getAllCustomers();
      
      const scanbridgeUsers = res.reduce((acc, user) => {
        const scanbridgeLogs = user.logLibrary?.filter(
          log => log.category?.toLowerCase() === "scanbridge"
        ) || [];

        if (scanbridgeLogs.length > 0) {
          scanbridgeLogs.forEach(log => {
            acc.push({
              ...user,
              logId: log._id,
              isdelivered: log.isdelivered,
              displayCategory: log.category
            });
          });
        }
        return acc;
      }, []);

      setCustomers(scanbridgeUsers);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATED HANDLEPATCH WITH SWEETALERT ---
  const handlePatch = async (customerId, logId) => {
    // Show confirmation first
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You are marking this item as delivered.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#E68A45', // Matches your orange theme
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, deliver it!',
      borderRadius: '15px'
    });

    if (result.isConfirmed) {
      try {
        const payload = { customerId, logId, isdelivered: "true" };
        await CustomerService.updateScanbridgeStatus(payload);
        
        // Success Alert
        Swal.fire({
          title: 'Updated!',
          text: 'The status has been updated to Delivered.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          borderRadius: '15px'
        });

        fetchCustomers();
      } catch (err) {
        // Error Alert
        Swal.fire({
          title: 'Update Failed',
          text: 'Something went wrong while updating the status.',
          icon: 'error',
          confirmButtonColor: '#E68A45'
        });
      }
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-[#E68A45] font-medium tracking-widest text-lg">
        Fetching Scanbridge Records...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-4">
        
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-sm outline-none"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-4 bg-[#E68A45] text-white p-5 font-bold text-xs uppercase tracking-widest">
            <div>Customer Profile</div>
            <div>Contact Info</div>
            <div>Log Detail</div>
            <div className="text-right">Action</div>
          </div>

          <div className="divide-y divide-gray-100">
            {currentItems.map((item, index) => {
              const isDelivered = item.isdelivered === true || item.isdelivered === "true";

              return (
                <div key={item.logId || index} className="grid grid-cols-4 p-6 items-center hover:bg-orange-50/30 transition-colors group">
                  <div className="pr-4">
                    <h3 className="text-gray-900 font-bold text-sm md:text-base uppercase tracking-tight">
                      {item.firstName} {item.lastName}
                    </h3>
                    <p className="text-[#E68A45] text-xs md:text-sm font-semibold mt-1">{item.companyName}</p>
                  </div>

                  <div className="text-gray-500 text-xs md:text-sm space-y-2">
                    <div className="flex items-center gap-2 group-hover:text-gray-800">
                      <Mail size={14} className="text-[#E68A45] opacity-70" /> 
                      <span className="truncate">{item.email}</span>
                    </div>
                    <div className="flex items-center gap-2 group-hover:text-gray-800">
                      <Phone size={14} className="text-[#E68A45] opacity-70" /> 
                      <span>{item.mobileNumber}</span>
                    </div>
                  </div>

                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isDelivered ? "bg-green-100 text-green-700" : "bg-orange-100 text-[#E68A45]"
                    }`}>
                      <Box size={12} />
                      {item.displayCategory}
                    </span>
                  </div>

                  <div className="text-right">
                    <button 
                      disabled={isDelivered}
                      onClick={() => handlePatch(item._id, item.logId)}
                      className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm border ${
                        isDelivered 
                          ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed" 
                          : "bg-[#FFF8F1] text-[#E68A45] border-[#FDEBD0] hover:bg-[#E68A45] hover:text-white active:scale-95"
                      }`}
                    >
                      {isDelivered ? <><CheckCircle2 size={14} /> Delivered</> : "Mark Delivered"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {currentItems.length === 0 && (
            <div className="p-24 text-center">
              <div className="text-gray-300 font-medium italic">No matching records found.</div>
            </div>
          )}
        </div>

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