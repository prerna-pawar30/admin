/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { PermissionService } from "../../../backend/ApiService";

import PermissionCreator from "./PermissionCreator";
import AccessManager from "./AccessManager";
import RegistryTable from "./RegistryTable";
import AuditLogFeed from "./AuditLogFeed";

export default function PermissionPage() {
  const auth = useSelector((state) => state.auth);
  const token = typeof auth === 'string' ? JSON.parse(auth).token : auth?.token;

  const [permissions, setPermissions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await PermissionService.getPermissionDashboardData();
      setPermissions(data.permissions || []);
      setAuditLogs(data.auditLogs || []);
      setUsers(data.users || []);
    } catch (err) {
      Swal.fire("Error", "Failed to sync registry data", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);
// Inside PermissionPage component
// ... inside your PermissionPage component ...

const handleDelete = useCallback(async (id) => {
  // 1. Confirm with the user
  const result = await Swal.fire({
    title: 'Revoke Permission?',
    text: "This action cannot be undone.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#f43f5e', // rose-500
    cancelButtonColor: '#64748b', // slate-500
    confirmButtonText: 'Yes, Revoke'
  });

  if (result.isConfirmed) {
    try {
      setLoading(true);
      // 2. Call the service
      await PermissionService.deletePermission(id);
      
      Swal.fire({
        icon: 'success',
        title: 'Revoked',
        text: 'The permission has been removed.',
        timer: 1500,
        showConfirmButton: false
      });
      
      // 3. Refresh the table
      fetchData(); 
    } catch (err) {
      Swal.fire("Error", "Could not delete permission.", "error");
    } finally {
      setLoading(false);
    }
  }
}, [fetchData]);




  return (
    <div className=" max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen font-sans">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Access Control Center</h1>
        <p className="text-slate-500 text-[10px] mt-2 font-bold uppercase tracking-[0.3em]">Security Framework Standards v1.0.0</p>
      </header>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <PermissionCreator onRefresh={fetchData} />
          <AccessManager users={users} permissions={permissions} onRefresh={fetchData} />
        </div>
        <div className="lg:col-span-8 space-y-8">
          <RegistryTable 
            permissions={permissions} 
            loading={loading} 
            onRefresh={fetchData} 
            onDelete={handleDelete} // <--- PASS THE FUNCTION HERE
          />
          <AuditLogFeed logs={auditLogs} />
        </div>
      </div>
    </div>
  );
}