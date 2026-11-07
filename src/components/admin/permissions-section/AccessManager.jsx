import React, { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import { UserCog, ChevronDown, Check, Search, ShieldCheck, ShieldMinus, X } from "lucide-react";
import { PermissionService } from "../../../backend/ApiService";

/**
 * Grant or revoke permissions for one employee. Shows what the employee already has, so
 * "Grant" only sends permissions they lack and "Revoke" only sends ones they hold (the API
 * rejects duplicates and missing ones).
 */

const fullName = (user) => `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.email || "Employee";

export default function AccessManager({ users = [], permissions = [], onRefresh }) {
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [permSearch, setPermSearch] = useState("");
  const [busy, setBusy] = useState(null);
  const pickerRef = useRef(null);

  const safeUsers = useMemo(() => (Array.isArray(users) ? users : []), [users]);
  const safePermissions = useMemo(() => (Array.isArray(permissions) ? permissions : []), [permissions]);

  // Always read the employee from the latest list so their permissions refresh after a change.
  const selectedUser = safeUsers.find((user) => user.email === selectedEmail) || null;
  const owned = useMemo(() => new Set(Array.isArray(selectedUser?.permissions) ? selectedUser.permissions : []), [selectedUser]);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) setIsPickerOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filteredUsers = safeUsers.filter((user) => `${fullName(user)} ${user.email}`.toLowerCase().includes(userSearch.toLowerCase()));
  const filteredPermissions = safePermissions.filter((perm) => perm.name.toLowerCase().includes(permSearch.toLowerCase()));

  const toGrant = selectedPerms.filter((name) => !owned.has(name));
  const toRevoke = selectedPerms.filter((name) => owned.has(name));

  const togglePermission = (name) => setSelectedPerms((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]));

  const selectUser = (user) => {
    setSelectedEmail(user.email);
    setSelectedPerms([]);
    setIsPickerOpen(false);
    setUserSearch("");
  };

  const runAction = async (type) => {
    const names = type === "assign" ? toGrant : toRevoke;
    if (!selectedEmail || names.length === 0) return;

    setBusy(type);
    const results = await Promise.allSettled(names.map((permission) => PermissionService.handleAccess(type, { email: selectedEmail, permission })));
    setBusy(null);

    const failed = results.filter((result) => result.status === "rejected");
    const done = names.length - failed.length;
    const verb = type === "assign" ? "granted" : "revoked";

    if (failed.length === 0) {
      Swal.fire({ icon: "success", title: `${done} permission${done === 1 ? "" : "s"} ${verb}`, timer: 1600, showConfirmButton: false });
    } else {
      const reason = failed[0].reason?.response?.data?.message || "Please try again.";
      Swal.fire({ icon: done ? "warning" : "error", title: `${done} ${verb}, ${failed.length} failed`, text: reason });
    }
    setSelectedPerms([]);
    onRefresh?.();
  };

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <header className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
          <UserCog size={17} />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-800">Employee access</h2>
          <p className="text-xs text-slate-500">Pick an employee, then grant or revoke permissions</p>
        </div>
      </header>

      <div className="space-y-4 p-5">
        {/* Employee picker */}
        <div ref={pickerRef} className="relative">
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Employee</label>
          <button
            type="button"
            onClick={() => setIsPickerOpen((open) => !open)}
            className={`flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 text-left text-sm shadow-sm transition-colors ${
              isPickerOpen ? "border-brand-400 ring-4 ring-brand-500/10" : "border-slate-200 hover:border-slate-300"
            }`}
            aria-expanded={isPickerOpen}
          >
            {selectedUser ? (
              <span className="min-w-0">
                <span className="block truncate font-semibold text-slate-800">{fullName(selectedUser)}</span>
                <span className="block truncate text-[11px] text-slate-400">{selectedUser.email}</span>
              </span>
            ) : (
              <span className="text-slate-400">Choose an employee…</span>
            )}
            <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform ${isPickerOpen ? "rotate-180" : ""}`} />
          </button>

          {isPickerOpen && (
            <div className="absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 p-2">
                <div className="relative">
                  <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search name or email…"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 outline-none focus:border-brand-400"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
              </div>
              <ul className="max-h-60 overflow-y-auto py-1">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <li key={user._id}>
                      <button
                        type="button"
                        onClick={() => selectUser(user)}
                        className={`flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left transition-colors hover:bg-brand-50 ${
                          user.email === selectedEmail ? "bg-brand-50" : ""
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-semibold text-slate-700">{fullName(user)}</span>
                          <span className="block truncate text-[11px] text-slate-400">{user.email}</span>
                        </span>
                        <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                          {Array.isArray(user.permissions) ? user.permissions.length : 0}
                        </span>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="py-6 text-center text-xs text-slate-400">No employees found</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Permissions */}
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-600">Permissions</label>
            {selectedUser && (
              <span className="text-[11px] font-medium text-slate-400">
                Has {owned.size} of {safePermissions.length}
              </span>
            )}
          </div>

          <div className="relative mb-2">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter permissions…"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 outline-none focus:border-brand-400"
              value={permSearch}
              onChange={(e) => setPermSearch(e.target.value)}
            />
          </div>

          <ul className={`max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 ${selectedUser ? "" : "pointer-events-none opacity-50"}`}>
            {filteredPermissions.length > 0 ? (
              filteredPermissions.map((perm) => {
                const isChecked = selectedPerms.includes(perm.name);
                const hasIt = owned.has(perm.name);
                return (
                  <li key={perm.permissionId || perm._id}>
                    <button
                      type="button"
                      onClick={() => togglePermission(perm.name)}
                      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors ${isChecked ? "bg-brand-50" : "hover:bg-slate-50"}`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          isChecked ? "border-brand-500 bg-brand-500 text-white" : "border-slate-300 bg-white"
                        }`}
                      >
                        {isChecked && <Check size={11} strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-700" title={perm.name}>
                        {perm.name}
                      </span>
                      {hasIt && (
                        <span className="shrink-0 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">Has</span>
                      )}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="py-6 text-center text-xs text-slate-400">No permissions found</li>
            )}
          </ul>
          {!selectedUser && <p className="mt-1.5 text-[11px] text-slate-400">Choose an employee first.</p>}
        </div>

        {selectedPerms.length > 0 && (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <span>
              {selectedPerms.length} selected · {toGrant.length} to grant · {toRevoke.length} to revoke
            </span>
            <button type="button" onClick={() => setSelectedPerms([])} className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-800">
              <X size={12} /> Clear
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => runAction("assign")}
            disabled={!selectedUser || toGrant.length === 0 || Boolean(busy)}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy === "assign" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <ShieldCheck size={15} />}
            Grant{toGrant.length ? ` (${toGrant.length})` : ""}
          </button>
          <button
            type="button"
            onClick={() => runAction("revoke")}
            disabled={!selectedUser || toRevoke.length === 0 || Boolean(busy)}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy === "revoke" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" /> : <ShieldMinus size={15} />}
            Revoke{toRevoke.length ? ` (${toRevoke.length})` : ""}
          </button>
        </div>
      </div>
    </section>
  );
}