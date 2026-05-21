/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Users, ChevronDown, Check, Search, User } from 'lucide-react';
import { PermissionService } from '../../../backend/ApiService';

export default function AccessManager({ users = [], permissions = [], onRefresh }) {
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedUserName, setSelectedUserName] = useState("");
  const [selectedPerms, setSelectedPerms] = useState([]);
  
  // States for Search & Dropdown Toggle
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [permSearch, setPermSearch] = useState("");
  
  const dropdownRef = useRef(null);

  const safePermissions = Array.isArray(permissions) ? permissions : [];
  const safeUsers = Array.isArray(users) ? users : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter Logic
  const filteredUsers = safeUsers.filter(u => 
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredPermissions = safePermissions.filter(p => 
    p.name.toLowerCase().includes(permSearch.toLowerCase())
  );

  const togglePermission = (name) => {
    setSelectedPerms(prev =>
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  };

  const handleSelectUser = (user) => {
    setSelectedEmail(user.email);
    setSelectedUserName(`${user.firstName} ${user.lastName}`);
    setIsUserDropdownOpen(false);
    setUserSearch(""); // Clear search after selection
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
      Swal.fire("Error", "Already has this permission", "error");
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-orange-100 overflow-hidden">

      {/* Header */}
      <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-orange-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
          <Users size={15} className="text-orange-600" />
        </div>
        <div>
          <h2 className="text-sm font-black text-slate-800 tracking-tight">Access Manager</h2>
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
            Grant or Revoke Access
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">

        {/* CUSTOM SEARCHABLE DROPDOWN FOR EMPLOYEE */}
        <div className="flex flex-col gap-2" ref={dropdownRef}>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Employee Selection
          </label>
          
          <div className="relative">
            {/* The Trigger Button (Looks like a Select) */}
            <button
              type="button"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm font-bold text-slate-700 hover:bg-white hover:border-blue-200 transition-all"
            >
              <div className="flex items-center gap-2 truncate">
                <User size={16} className={selectedEmail ? "text-orange-500" : "text-slate-300"} />
                {selectedEmail ? (
                   <span className="truncate">{selectedUserName} <span className="text-[10px] opacity-50 font-normal">({selectedEmail})</span></span>
                ) : (
                  <span className="text-slate-400">Choose an employee...</span>
                )}
              </div>
              <ChevronDown size={18} className={`text-slate-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* The Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-orange-100 overflow-hidden animate-in fade-in zoom-in duration-150">
                {/* Search Bar Inside Dropdown */}
                <div className="p-3 border-b border-orange-100 bg-orange-50/50">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Type to search..."
                      className="w-full pl-9 pr-4 py-2 bg-white border border-orange-200 rounded-lg text-xs font-bold outline-none focus:border-[#E68736] focus:shadow-[0_0_0_4px_rgba(230,135,54,0.1)] transition-all text-slate-400"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Users List */}
                <div className="max-h-60 overflow-y-auto">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(u => (
                      <div
                        key={u._id}
                        onClick={() => handleSelectUser(u)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex flex-col transition-colors border-b border-orange-100 last:border-0"
                      >
                        <span className="text-xs font-bold text-slate-700">{u.firstName} {u.lastName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{u.email}</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs font-bold text-slate-300 italic">No employees found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Permissions Section */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
            <span>
              Select Labels{" "}
              {selectedPerms.length > 0 && <span className="text-blue-500">({selectedPerms.length} selected)</span>}
            </span>
          </label>

          <div className="relative mb-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search permissions..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-100 bg-slate-50 outline-none text-[11px] font-bold text-slate-600 focus:bg-white focus:border-blue-200 transition-all"
              value={permSearch}
              onChange={(e) => setPermSearch(e.target.value)}
            />
          </div>

          <div className="border-2 border-slate-100 rounded-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-slate-50 bg-slate-50/30">
            {filteredPermissions.length > 0 ? (
              filteredPermissions.map(p => (
                <div
                  key={p.permissionId || p._id}
                  onClick={() => togglePermission(p.name)}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all select-none ${
                    selectedPerms.includes(p.name)
                      ? 'bg-orange-600 text-white'
                      : 'bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    selectedPerms.includes(p.name) ? 'bg-white border-white' : 'border-slate-300'
                  }`}>
                    {selectedPerms.includes(p.name) && <Check size={10} strokeWidth={4} className="text-blue-600" />}
                  </div>
                  <span className="text-[11px] font-mono font-bold truncate">{p.name}</span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs font-bold text-slate-300 uppercase">Empty</div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => handleAction('assign')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Check size={14} /> Grant
          </button>
          <button
            onClick={() => handleAction('revoke')}
            className="bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-rose-100 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="text-lg leading-none">×</span> Revoke
          </button>
        </div>
      </div>
    </div>
  );
}