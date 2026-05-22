/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { CustomerService } from '../../../backend/ApiService';
import CustomerRow from './CustomerRow';
import CustomerLogsModal from './CustomerLogsModal';
import Pagination from '../../ui/Pagination'; 
import { Search, Users, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedUserLogs, setSelectedUserLogs] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    
    const itemsPerPage = 10;

    // Re-trigger fetch whenever the current page changes
    useEffect(() => { 
        fetchCustomers(); 
    }, [currentPage]);

    // Reset back to page 1 whenever someone types a search term
    useEffect(() => { 
        setCurrentPage(1); 
        fetchCustomers();
    }, [searchTerm]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const responseData = await CustomerService.getAllCustomers(currentPage, itemsPerPage);
            
            if (responseData?.success && responseData?.data) {
                setCustomers(responseData.data.users || []);
                setTotalPages(responseData.data.pagination?.totalPages || 1);
                setTotalRecords(responseData.data.pagination?.totalUsers || 0);
            } else {
                setCustomers([]);
                setTotalPages(1);
                setTotalRecords(0);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setCustomers([]);
            setTotalPages(1);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this customer log!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E68736', 
            cancelButtonColor: '#cbd5e1',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            background: '#fff',
            borderRadius: '16px'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await CustomerService.deleteCustomer(id);
            
            if (response.success) {
                Swal.fire({
                    title: 'Deleted!',
                    text: 'The customer log has been deleted.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
                fetchCustomers(); 
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: response.message || 'Could not delete customer log entry.',
                    icon: 'error',
                    confirmButtonColor: '#E68736'
                });
            }
        } catch (err) {
            console.error("Failed to process delete operation:", err);
            Swal.fire({
                title: 'Failed!',
                text: 'An error occurred while connecting to the server.',
                icon: 'error',
                confirmButtonColor: '#E68736'
            });
        }
    };

    const filteredCustomers = customers.filter(customer => 
        customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-10 font-sans text-slate-800">
            {selectedUserLogs && (
                <CustomerLogsModal 
                    logs={selectedUserLogs} 
                    onClose={() => setSelectedUserLogs(null)} 
                />
            )}

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* HEADER SECTION & SEARCH CONTROLS */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-50 rounded-xl text-[#E68736]">
                            <Users size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                                Customer <span className="text-[#E68736]">Activity</span>
                            </h2>
                            
                        </div>
                    </div>
                    
                    <div className="relative w-full md:w-80">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                            <Search size={18} />
                        </span>
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            className="block w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium outline-none transition-all focus:bg-white focus:ring-2 focus:ring-orange-500/10 focus:border-[#E68736]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* DATA TABLE WRAPPER */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="bg-[#E68736] text-white font-bold text-xs uppercase tracking-wider">
                                    <th className="p-4 pl-6">Customer Profile</th>
                                    <th className="p-4">Contact Info</th>
                                    <th className="p-4">Recent Activity</th>
                                    <th className="p-4 pr-6 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-20">
                                            <div className="inline-flex flex-col items-center gap-3">
                                                <RefreshCw size={28} className="animate-spin text-[#E68736]" />
                                                <span className="text-xs font-bold text-[#E68736] uppercase tracking-widest">Fetching customer records...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredCustomers.length > 0 ? (
                                    filteredCustomers.map(user => (
                                        <CustomerRow 
                                            key={user._id} 
                                            user={user} 
                                            onDelete={handleDelete} 
                                            onViewLogs={setSelectedUserLogs} 
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-16 text-slate-400 font-medium italic">
                                            No customers matching the criteria were found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="p-4 border-t border-slate-100 flex justify-center bg-slate-50/30">
                        <Pagination 
                            totalItems={totalRecords}
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

export default CustomerList;