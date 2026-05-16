/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { HiMail, HiChevronDown, HiUserGroup } from "react-icons/hi";
import { LuCalendarDays, LuShieldAlert } from "react-icons/lu";
import Swal from "sweetalert2";
import { EmployeeService } from "../../../backend/ApiService";
import { USER_ROLES, ROLE_LABELS } from "../../../constants/UserRoles";
// Import your Pagination component
import Pagination from "../../../components/ui/Pagination"; 

/**
 * RoleBadge Component
 */
const RoleBadge = ({ role, onChange, isLoading }) => {
  const roleStyles = {
    [USER_ROLES.SUPER_ADMIN]: "bg-purple-50 text-purple-600 border-purple-100",
    [USER_ROLES.ADMIN]: "bg-indigo-50 text-indigo-600 border-indigo-100",
    [USER_ROLES.MANAGER]: "bg-blue-50 text-blue-600 border-blue-100",
    [USER_ROLES.EXECUTIVE]: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  return (
    <div className="relative inline-flex items-center group">
      <select
        disabled={isLoading}
        value={role}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`appearance-none cursor-pointer pl-3 pr-8 py-1.5 rounded-lg text-[10px] md:text-xs font-bold uppercase border outline-none transition-all ${
          roleStyles[role] || "bg-slate-50 text-slate-600 border-slate-200"
        } ${isLoading ? "opacity-40" : "hover:border-[#E68736] hover:bg-white"}`}
      >
        {Object.entries(ROLE_LABELS).map(([value, label]) => (
          <option key={value} value={Number(value)} className="bg-white text-slate-900 lowercase first-letter:uppercase">
            {label}
          </option>
        ))}
      </select>
      <HiChevronDown className={`absolute right-2 pointer-events-none transition-transform ${isLoading ? 'animate-pulse' : 'group-hover:translate-y-0.5'}`} />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-[#E68736] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

const EmployeeTable = ({ employees, loading, onSelectEmployee, setEmployees }) => {
  const [updatingId, setUpdatingId] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Define how many employees per page

  // Calculate Sliced Data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = employees.slice(indexOfFirstItem, indexOfLastItem);

  const handleRoleChange = async (email, newRole, currentId) => {
    const originalEmployees = [...employees];
    const currentEmp = employees.find(e => e._id === currentId);
    if (currentEmp && currentEmp.role === newRole) return;

    try {
      setUpdatingId(currentId);
      const updatedList = employees.map((emp) => 
        emp._id === currentId ? { ...emp, role: newRole } : emp
      );
      setEmployees(updatedList);

      const payload = { email, role: newRole, permission: "auth.account.update" };
      const response = await EmployeeService.updateEmployee(payload);

      if (response.success || response.statusCode === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Role Updated',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
        });
      } else { throw new Error(); }
    } catch (error) {
      setEmployees(originalEmployees);
      Swal.fire({ icon: 'error', title: 'Update Failed', text: 'Reverting changes...' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left">
                <div className="flex items-center gap-2"><HiUserGroup size={14}/> Member</div>
              </th>
              <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left">Access Role</th>
              <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left">Permissions</th>
              <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                <div className="flex items-center justify-end gap-2"><LuCalendarDays size={14}/> Joined</div>
              </th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="4" className="py-32 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-[3px] border-[#E68736] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-bold text-slate-400 animate-pulse">Syncing Team Data...</span>
                  </div>
                </td>
              </tr>
            ) : currentEmployees.length > 0 ? (
              currentEmployees.map((emp) => (
                <tr key={emp._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-white text-sm shadow-md group-hover:scale-105 transition-transform">
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 capitalize leading-none mb-1.5">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                          <HiMail className="text-[#E68736]" size={12} /> {emp.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-5">
                    <RoleBadge 
                      role={emp.role} 
                      isLoading={updatingId === emp._id}
                      onChange={(newRole) => handleRoleChange(emp.email, newRole, emp._id)} 
                    />
                  </td>

                  <td className="px-8 py-5">
                    <button 
                      onClick={() => onSelectEmployee(emp)} 
                      className="flex items-center gap-1.5 hover:bg-white p-1 rounded-lg transition-all border border-transparent hover:border-slate-200"
                    >
                      {emp.permissions?.length > 0 ? (
                        <>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded font-bold uppercase">
                            {emp.permissions[0].split('.')[1] || emp.permissions[0]}
                          </span>
                          {emp.permissions.length > 1 && (
                            <span className="text-[10px] bg-[#E68736] text-white px-1.5 py-1 rounded font-black">
                              +{emp.permissions.length - 1}
                            </span>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-300">
                          <LuShieldAlert size={12}/>
                          <span className="text-[10px] font-bold uppercase italic">Restricted</span>
                        </div>
                      )}
                    </button>
                  </td>

                  <td className="px-8 py-5 text-right font-medium text-slate-400 text-xs">
                    {emp.createdAt 
                      ? new Date(emp.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) 
                      : '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-24 text-center">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">No active team members found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Integration */}
      {!loading && employees.length > 0 && (
        <Pagination 
          totalItems={employees.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

export default EmployeeTable;