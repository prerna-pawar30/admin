/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { Shield, Key, Users, Activity, PlusCircle } from "lucide-react";
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
    const response = await PermissionService.getPermissionDashboardData();

    // console.log("Dashboard Response:", response);

    setPermissions(response.permissions || []);
    setAuditLogs(response.auditLogs || []);

    // FIX
  setUsers(response.users || []);

  } catch (err) {
    console.error(err);

    Swal.fire(
      "Error",
      "Failed to sync registry data",
      "error"
    );
  } finally {
    setLoading(false);
  }
}, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = useCallback(async (id) => {
    const result = await Swal.fire({
      title: 'Revoke Permission?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Revoke'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await PermissionService.deletePermission(id);
        Swal.fire({
          icon: 'success',
          title: 'Revoked',
          text: 'The permission has been removed.',
          timer: 1500,
          showConfirmButton: false
        });
        fetchData();
      } catch (err) {
        Swal.fire("Error", "Could not delete permission.", "error");
      } finally {
        setLoading(false);
      }
    }
  }, [fetchData]);

  // Derived metric layout tracking counters
  const createdCount = auditLogs.filter(l => l.action === 'create').length;
  const grantedCount = auditLogs.filter(l => l.action === 'assign').length;
  const revokedCount = auditLogs.filter(l => l.action === 'revoke').length;

  const stats = [
    { label: "Total Labels", value: permissions.length, icon: <Key size={16} />, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
    { label: "Employees", value: users.length, icon: <Users size={16} />, color: "text-slate-700", bg: "bg-slate-100", border: "border-slate-200" },
    { label: "Created Events", value: createdCount, icon: <PlusCircle size={16} />, color: "text-orange-600", bg: "bg-orange-50/60", border: "border-orange-100" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-screen font-sans">

      {/* Header */}
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          Access Control Center
        </h1>
        <p className="text-slate-500 text-[10px] mt-1.5 font-bold uppercase tracking-[0.3em]">
          Security Framework Standards v1.0.0
        </p>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((s) => (
          <div key={s.label} className={`bg-white rounded-2xl border ${s.border} shadow-sm px-4 sm:px-5 py-4 flex items-center gap-3`}>
            <div className={`w-9 h-9 rounded-xl ${s.bg} ${s.color} flex items-center justify-center flex-shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black text-slate-800 leading-none">{s.value}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8">
        <div className="lg:col-span-4 space-y-5 sm:space-y-6 lg:space-y-8">
          <PermissionCreator onRefresh={fetchData} />
          <AccessManager users={users} permissions={permissions} onRefresh={fetchData} />
        </div>
        <div className="lg:col-span-8 space-y-5 sm:space-y-6 lg:space-y-8">
          <RegistryTable
            permissions={permissions}
            loading={loading}
            onRefresh={fetchData}
            onDelete={handleDelete}
          />
          <AuditLogFeed logs={auditLogs} />
        </div>
      </div>
    </div>
  );
}