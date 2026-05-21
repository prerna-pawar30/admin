/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { UserService } from "../../backend/ApiService"; 
import Pagination from "../ui/Pagination"; 
import { Calendar, Shield, Mail, Layers, CheckCircle2, XCircle } from "lucide-react";

export default function UserDetails() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await UserService.getAllUsers();
      
      // Matches the provided API payload footprint: response.data.users
      if (response && response.success && response.data?.users) {
        setUsers(response.data.users);
      } else if (Array.isArray(response)) {
        setUsers(response);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Compute layout slicing
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  // Helper to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/30 p-4 sm:p-6 lg:p-10 text-slate-900 antialiased">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl border border-orange-200/80 shadow-sm overflow-hidden">
        
        {/* DASHBOARD CONSOLE CONTROL HEADER */}
        <header className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              User <span className="text-[#E68736]">Management</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
              Monitor customer classification data pipelines, roles, and security authentication parameters.
            </p>
          </div>
          
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden md:inline">Per Page:</span>
            <select 
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); 
              }}
              className="border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#E68736] cursor-pointer transition-all appearance-none pr-8 relative min-w-[110px]"
            >
              {[5, 10, 20, 50].map(val => (
                <option key={val} value={val}>SHOW {val}</option>
              ))}
            </select>
          </div>
        </header>

        {/* COMPREHENSIVE DATA TABLE COMPONENT */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center bg-white">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-[#E68736] mb-4"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Master Database...</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="p-4 pl-6 sm:pl-8">User Profile</th>
                  <th className="p-4 hidden md:table-cell">Identity & Contact</th>
                  <th className="p-4 text-center">Role / System</th>
                  <th className="p-4">Created On</th>
                  <th className="p-4">Last Updated</th>
                  <th className="p-4 pr-6 sm:pr-8 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {currentUsers.map((user) => {
                  // Normalize data structures (handle polymorphic variants across your dataset objects)
                  const fallbackName = user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Anonymous User";
                  const fallbackAvatar = user.avatar || user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=f8fafc&color=64748b`;
                  const userRole = user.role || "buyer";
                  const identityProvider = user.provider || (user.providerId ? "google" : "manual");
                  const isActiveState = user.isActive !== undefined ? user.isActive : true;

                  return (
                    <tr key={user._id} className="hover:bg-slate-50/40 transition-colors group">
                      
                      {/* Avatar & Identifiers Name Block */}
                      <td className="p-4 pl-6 sm:pl-8">
                        <div className="flex items-center gap-3.5">
                          <img 
                            src={fallbackAvatar} 
                            alt={fallbackName} 
                            className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-100 group-hover:ring-[#E68736]/20 transition-all shrink-0 bg-slate-50"
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}`; }}
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-800 uppercase tracking-tight block group-hover:text-[#E68736] transition-colors text-sm">
                              {fallbackName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5 select-all">
                              {user._id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Channels */}
                      <td className="p-4 hidden md:table-cell">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail size={13} className="text-slate-400" />
                            <span className="font-semibold text-xs text-slate-700">{user.email}</span>
                          </div>
                          {user.instituteName && (
                            <div className="flex items-center gap-1.5 text-slate-400 pl-5">
                              <span className="text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                                {user.instituteName}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Role Metrics Badge Cluster */}
                      <td className="p-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                         
                          <span className="text-[12px] font-bold text-slate-400 uppercase tracking-tight">
                             {identityProvider}
                          </span>
                        </div>
                      </td>

                      {/* Registered Node Timeline */}
                      <td className="p-4 text-slate-600 font-semibold text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>

                      {/* Mutated / Update Timeline */}
                      <td className="p-4 text-slate-500 font-medium text-xs">
                        <div className="flex items-center gap-1.5">
                          <Layers size={13} className="text-slate-300" />
                          <span>{formatDate(user.updatedAt)}</span>
                        </div>
                      </td>

                      {/* Activity System Checkbox Indicators */}
                      <td className="p-4 pr-6 sm:pr-8 text-center">
                        <div className="flex items-center justify-center">
                          {isActiveState ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              <CheckCircle2 size={11} className="shrink-0" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 border border-rose-100 text-rose-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              <XCircle size={11} className="shrink-0" />
                              <span>Suspended</span>
                            </span>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}

                {users.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <div className="text-slate-400 font-bold uppercase text-xs tracking-widest">
                        No accounts mapped to this interface partition.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION ANCHOR LAYOUT BAR */}
        <div className="border-t border-slate-100 bg-white px-4 py-1.5">
          <Pagination 
            totalItems={users.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
        
      </div>
    </div>
  );
}