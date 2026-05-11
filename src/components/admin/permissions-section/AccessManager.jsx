/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { PermissionService } from '../../../backend/ApiService';

// 1. Added default empty arrays to props to prevent "map" errors
export default function AccessManager({ users = [], permissions = [], onRefresh }) {
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedPerms, setSelectedPerms] = useState([]);

  // Ensure permissions is actually an array (handles cases where parent passes an object by mistake)
  const safePermissions = Array.isArray(permissions) ? permissions : [];
  const safeUsers = Array.isArray(users) ? users : [];

  const togglePermission = (name) => {
    setSelectedPerms(prev => 
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  };

  const handleAction = async (type) => {
    if (!selectedEmail || selectedPerms.length === 0) {
      return Swal.fire("Required", "Select an employee and at least one permission", "info");
    }

    Swal.fire({ title: 'Updating...', didOpen: () => Swal.showLoading() });

    try {
      await Promise.all(selectedPerms.map(perm => 
        PermissionService.handleAccess(type, { email: selectedEmail, permission: perm })
      ));

      Swal.fire("Success", `Permissions ${type === 'assign' ? 'granted' : 'revoked'} successfully!`, "success");
      setSelectedPerms([]);
      onRefresh();
    } catch (err) {
      Swal.fire("Error", "Action failed", "error");
    }
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
      <h2 className="text-[11px] font-black mb-6 text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" /> Access Manager
      </h2>

      <div className="space-y-4">
        <select 
          value={selectedEmail} 
          onChange={(e) => setSelectedEmail(e.target.value)} 
          className="w-full border-2 border-slate-50 bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-blue-200 transition-all text-slate-700 appearance-none"
        >
          <option value="">Select Employee</option>
          {safeUsers.map(u => (
            <option key={u._id} value={u.email}>{u.firstName} {u.lastName} ({u.email})</option>
          ))}
        </select>

        <div className="border-2 border-slate-50 rounded-2xl p-2 max-h-72 overflow-y-auto space-y-1 bg-slate-50/30">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block p-2">
            Select Labels ({selectedPerms.length})
          </label>
          
          {/* 2. Using safePermissions to prevent the crash */}
          {safePermissions.length > 0 ? (
            safePermissions.map(p => (
              <div 
                key={p.permissionId || p._id} 
                onClick={() => togglePermission(p.name)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                  selectedPerms.includes(p.name) 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                  : 'bg-white border-transparent hover:border-blue-100 text-slate-600'
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedPerms.includes(p.name) ? 'bg-white border-white' : 'border-slate-300'}`}>
                  {selectedPerms.includes(p.name) && <div className="w-2 h-2 bg-blue-600 rounded-sm" />}
                </div>
                <span className="text-xs font-mono font-bold">{p.name}</span>
              </div>
            ))
          ) : (
            <div className="text-center p-4 text-xs text-slate-400">No permissions found</div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <button onClick={() => handleAction('assign')} className="bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all active:scale-95">Grant</button>
          <button onClick={() => handleAction('revoke')} className="bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-rose-100 transition-all active:scale-95">Revoke</button>
        </div>
      </div>
    </div>
  );
}