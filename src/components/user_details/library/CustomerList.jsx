/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { CustomerService } from '../../../backend/ApiService';
import CustomerRow from './CustomerRow';
import CustomerLogsModal from './CustomerLogsModal';
// 1. Import your Pagination component
import Pagination from '../../ui/Pagination'; 

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedUserLogs, setSelectedUserLogs] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => { fetchCustomers(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const data = await CustomerService.getAllCustomers();
            setCustomers(data || []);
        } catch (err) {
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this customer?")) return;
        try {
            const response = await CustomerService.deleteCustomer(id);
            if (response.success) {
                setCustomers(prev => prev.filter(c => c._id !== id));
            }
        } catch (err) {
            alert("Could not delete customer.");
        }
    };

    const filteredCustomers = customers.filter(customer => 
        customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

    if (loading) return (
        <div style={{...styles.center, color: '#E68736', fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px'}}>
            <div className="animate-spin" style={{marginBottom: '10px'}}>●</div>
            SYNCING CUSTOMER DATABASE...
        </div>
    );

    return (
        <div style={styles.page}>
            {selectedUserLogs && (
                <CustomerLogsModal 
                    logs={selectedUserLogs} 
                    onClose={() => setSelectedUserLogs(null)} 
                    styles={styles} 
                />
            )}

            <div style={{...styles.card, border: '1px solid #fed7aa', borderRadius: '24px', overflow: 'hidden', padding: 0}}>
                
                {/* HEADER SECTION - Added internal padding since card padding was moved to 0 for the table/pagination spread */}
                <div style={{...styles.header, alignItems: 'center', padding: '40px 40px 30px 40px', borderBottom: '1px solid #fff7ed', marginBottom: 0}}>
                    <div>
                        <h2 style={{...styles.title, fontSize: '28px', color: '#E68736'}}>
                            Customer <span style={{color: '#000'}}>Activity</span>
                        </h2>
                        <p style={{fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', tracking: '0.1em', marginTop: '5px'}}>
                           Total {filteredCustomers.length} Records Found
                        </p>
                    </div>
                    
                    <div style={{display: 'flex', gap: '10px'}}>
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            style={{...styles.searchInput, border: '1px solid #fb923c', width: '300px', fontSize: '13px', fontWeight: '500'}}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div style={{overflowX: 'auto', padding: '0 40px'}}>
                    <table style={{...styles.table, borderCollapse: 'separate', borderSpacing: '0 8px'}}>
                        <thead>
                            <tr style={{backgroundColor: '#E68736'}}>
                                <th style={{...styles.th, color: '#fff', padding: '16px', borderBottom: 'none', borderRadius: '12px 0 0 12px', textTransform: 'uppercase', letterSpacing: '1px'}}>Customer Profile</th>
                                <th style={{...styles.th, color: '#fff', padding: '16px', borderBottom: 'none', textTransform: 'uppercase', letterSpacing: '1px'}}>Contact Info</th>
                                <th style={{...styles.th, color: '#fff', padding: '16px', borderBottom: 'none', textTransform: 'uppercase', letterSpacing: '1px'}}>Recent Activity</th>
                                <th style={{...styles.th, color: '#fff', padding: '16px', borderBottom: 'none', borderRadius: '0 12px 12px 0', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCustomers.length > 0 ? (
                                currentCustomers.map(user => (
                                    <CustomerRow 
                                        key={user._id} 
                                        user={user} 
                                        onDelete={handleDelete} 
                                        onViewLogs={setSelectedUserLogs} 
                                        styles={styles} 
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase'}}>
                                        No Customers Found in Database
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 2. Integrated Your Pagination Component */}
                <Pagination 
                    totalItems={filteredCustomers.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            </div>
        </div>
    );
};

const styles = {
    page: { padding: '40px 80px', backgroundColor: '#fffaf5', minHeight: '100vh', },
    card: { backgroundColor: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' },
    header: { display: 'flex', justifyContent: 'space-between' },
    title: { fontWeight: 'bold', margin: 0 },
    searchInput: { padding: '12px 20px', borderRadius: '12px', width: '250px', outline: 'none', transition: 'all 0.3s' },
    table: { width: '100%' },
    th: { textAlign: 'left', fontSize: '11px' },
    td: { padding: '16px', verticalAlign: 'middle' },
    primaryText: { fontWeight: '700', color: '#334155' },
    secondaryText: { color: '#E68736', fontSize: '12px', fontWeight: '600' },
    iconRow: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#64748b' },
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
    modalCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', width: '450px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' },
    closeBtn: { border: 'none', background: '#f1f5f9', cursor: 'pointer', fontSize: '18px', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    logTrigger: { backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', transition: 'all 0.2s' },
    libraryBadge: { border: '1px solid #f1f5f9', padding: '15px', borderRadius: '16px', marginBottom: '12px', background: '#fff' },
    brandTag: { fontWeight: 'bold', fontSize: '14px', color: '#1e293b' },
    categoryTag: { backgroundColor: '#E68736', color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' },
    downloadInfo: { marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '2px' },
    countText: { fontSize: '13px', color: '#E68736', fontWeight: 'bold' },
    libDate: { fontSize: '10px', color: '#94a3b8' },
    deleteBtn: { color: '#ef4444', background: '#fef2f2', border: 'none', cursor: 'pointer', fontSize: '16px', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
    center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }
};

export default CustomerList;