import PageHeader from "../../ui/PageHeader";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { ShieldCheck, KeyRound, Users, Activity, Layers, RefreshCw } from "lucide-react";
import { PermissionService } from "../../../backend/ApiService";

import PermissionCreator from "./PermissionCreator";
import AccessManager from "./AccessManager";
import RegistryTable from "./RegistryTable";
import AuditLogFeed from "./AuditLogFeed";

/**
 * Permissions: create permission names, grant / revoke them per employee, browse the registry
 * and the activity log. Two columns on wide screens (forms left, lists right), one column below.
 */

const StatCard = ({ icon, label, value, tone }) => {
  const Icon = icon;
  return (
  <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
      <Icon size={18} />
    </span>
    <div className="min-w-0">
      <p className="text-xl font-bold leading-none text-slate-900">{value}</p>
      <p className="mt-1 truncate text-xs font-medium text-slate-500">{label}</p>
    </div>
  </div>
  );
};

export default function PermissionPage() {
  const auth = useSelector((state) => state.auth);
  const token = typeof auth === "string" ? JSON.parse(auth).token : auth?.token;

  const [permissions, setPermissions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await PermissionService.getPermissionDashboardData(page, 10);
      setPermissions(response.permissions || []);
      setAuditLogs(response.auditLogs || []);
      setPagination(response.auditPagination || {});
      setUsers(response.users || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Could not load permissions.", "error");
    } finally {
      setLoading(false);
    }
  }, [token, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: "Delete this permission?",
        text: "It is removed from every employee who has it. This cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Delete",
        reverseButtons: true,
        focusCancel: true,
      });
      if (!result.isConfirmed) return;

      try {
        setLoading(true);
        await PermissionService.deletePermission(id);
        Swal.fire({ icon: "success", title: "Permission deleted", timer: 1500, showConfirmButton: false });
        fetchData();
      } catch {
        Swal.fire("Error", "Could not delete permission.", "error");
        setLoading(false);
      }
    },
    [fetchData]
  );

  const moduleCount = useMemo(() => new Set(permissions.map((perm) => perm.name.split(".")[0])).size, [permissions]);

  return (
    <div className="min-w-0">
      <PageHeader
        icon={ShieldCheck}
        title="Permissions"
        description="Create permissions and control what each employee can access."
        actions={
          <button
            type="button"
            onClick={fetchData}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard icon={KeyRound} label="Permissions" value={permissions.length} tone="bg-brand-50 text-brand-600" />
        <StatCard icon={Layers} label="Modules" value={moduleCount} tone="bg-violet-50 text-violet-600" />
        <StatCard icon={Users} label="Employees" value={users.length} tone="bg-sky-50 text-sky-600" />
        <StatCard icon={Activity} label="Logged changes" value={pagination?.totalItems ?? auditLogs.length} tone="bg-slate-100 text-slate-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="min-w-0 space-y-6 xl:col-span-5">
          <AccessManager users={users} permissions={permissions} onRefresh={fetchData} />
          <PermissionCreator onRefresh={fetchData} />
        </div>
        <div className="min-w-0 space-y-6 xl:col-span-7">
          <RegistryTable permissions={permissions} loading={loading} onDelete={handleDelete} />
          <AuditLogFeed logs={auditLogs} pagination={pagination} page={page} setPage={setPage} />
        </div>
      </div>
    </div>
  );
}