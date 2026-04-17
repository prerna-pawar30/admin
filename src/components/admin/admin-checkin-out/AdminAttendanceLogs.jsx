/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Globe, Calendar } from 'lucide-react';
import apiClient from "../../../utils/apiClient"; 
import { API_ROUTES } from "../../../backend/ApiRoutes";
import Swal from 'sweetalert2';

// Sub-components
import FilterTabs from '../../ui/FilterTabs';
import AttendanceTable from '../../ui/AttendanceTable';
import RequestTable from '../../ui/RequestTable';
import Pagination from '../../ui/Pagination';

const AdminAttendanceLogs = () => {
  const [activeTab, setActiveTab] = useState("attendance"); 
  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [punchOutRequests, setPunchOutRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === "attendance") {
        response = await apiClient.get(API_ROUTES.ATTENDANCE.ADMIN.GET_ALL_ATTENDANCES);
        if (response.data.success) {
          const flattened = (response.data.data || []).flatMap(item => {
            const records = item.$__parent?.records || [];
            return records
              .filter(record => record.dayType !== "HOLIDAY" && !record.status?.includes("HOLIDAY"))
              .map(record => ({ ...record, employee: item.employee, recordId: record._id }));
          });

          const map = new Map();
          flattened.forEach(item => {
            const key = item.leaveType 
              ? `${item.employee?._id}-leave-${item.fromDate}-${item.toDate}`
              : `${item.employee?._id}-${item.date}`;
            if (!map.has(key)) map.set(key, item);
          });
          setAttendanceData(Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date)));
        }
      } else if (activeTab === "leaves") {
        response = await apiClient.get(API_ROUTES.ATTENDANCE.ADMIN.LEAVE_REQUESTS);
        setLeaveRequests(response.data.success ? response.data.data.sort((a, b) => new Date(b.fromDate) - new Date(a.fromDate)) : []);
      } else if (activeTab === "punchout") {
        response = await apiClient.get(API_ROUTES.ATTENDANCE.ADMIN.PUNCHOUT_REQUESTS);
        setPunchOutRequests(response.data.success ? response.data.data.sort((a, b) => new Date(b.date) - new Date(a.date)) : []);
      }
      setCurrentPage(1);
    } catch (error) {
      Swal.fire("Sync Failed", "Could not connect to server", "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredData = (() => {
    const list = activeTab === "attendance" ? attendanceData : activeTab === "leaves" ? leaveRequests : punchOutRequests;
    return list.filter(item => {
      const name = `${item.employee?.firstName} ${item.employee?.lastName}`.toLowerCase();
      return name.includes(searchTerm.toLowerCase());
    });
  })();

  const handleAction = async (id, actionType, category) => {
    const isLeave = category === 'leave';
    const endpoint = isLeave ? API_ROUTES.ATTENDANCE.ADMIN.LEAVE_ACTION(id) : API_ROUTES.ATTENDANCE.ADMIN.PUNCHOUT_ACTION(id);
    
    const result = await Swal.fire({
      title: `Confirm ${actionType}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: actionType === 'APPROVED' ? '#10b981' : '#ef4444',
    });

    if (result.isConfirmed) {
      try {
        const res = await apiClient.post(endpoint, { action: actionType });
        if (res.data.success) {
          Swal.fire("Success", `Request ${actionType}`, "success");
          fetchData();
        }
      } catch (err) {
        Swal.fire("Error", err.response?.data?.message || "Action failed", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Terminal Log</h1>
            <p className="text-xs font-bold text-slate-400 flex items-center gap-2 mt-2 uppercase tracking-[0.2em]">
              <Globe size={14} className="text-orange-500" /> Attendance & Lifecycle
            </p>
          </div>
          <FilterTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* SEARCH */}
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500" size={20} />
          <input 
            type="text" 
            placeholder="Search by employee name..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-6 py-5 bg-white rounded-[2rem] shadow-sm border border-slate-100 outline-none focus:ring-4 focus:ring-orange-500/5 transition-all" 
          />
        </div>

        {/* TABLE CONTENT */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === "attendance" ? (
              <AttendanceTable data={filteredData.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage)} loading={loading} />
            ) : (
              <RequestTable 
                data={filteredData.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage)} 
                loading={loading} 
                activeTab={activeTab} 
                onAction={handleAction} 
              />
            )}
          </div>

          <Pagination 
            totalItems={filteredData.length} 
            itemsPerPage={itemsPerPage} 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
          />
        </div>
      </div>
    </div>
  );
};

export default AdminAttendanceLogs;