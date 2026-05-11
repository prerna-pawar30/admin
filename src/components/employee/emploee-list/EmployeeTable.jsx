import React, { useState } from "react";
import { HiMail } from "react-icons/hi";
import Swal from "sweetalert2";
import { EmployeeService } from "../../../backend/ApiService"; 
import { USER_ROLES, ROLE_LABELS } from "../../../constants/UserRoles";

/**
 * RoleBadge Component
 * A styled select dropdown that looks like a badge
 */
const RoleBadge = ({ role, onChange, isLoading }) => {
  // Styles mapped to your USER_ROLES constants
  const roleStyles = {
    [USER_ROLES.SUPER_ADMIN]: "bg-purple-100 text-purple-700 border-purple-200",
    [USER_ROLES.ADMIN]: "bg-indigo-100 text-indigo-700 border-indigo-200",
    [USER_ROLES.MANAGER]: "bg-blue-100 text-blue-700 border-blue-200",
    [USER_ROLES.EXECUTIVE]: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="relative inline-block">
      <select
        disabled={isLoading}
        value={role}
        // Ensure the value is sent as a Number to the handler
        onChange={(e) => onChange(Number(e.target.value))}
        className={`appearance-none cursor-pointer px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase border outline-none transition-all text-center ${
          roleStyles[role] || "bg-slate-100 text-slate-700 border-slate-200"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"}`}
      >
        {Object.entries(ROLE_LABELS).map(([value, label]) => (
          <option key={value} value={Number(value)} className="bg-white text-slate-900">
            {label}
          </option>
        ))}
      </select>
      
      {/* Loading Spinner overlay for the specific badge */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/20 rounded-full">
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

/**
 * Main EmployeeTable Component
 */
const EmployeeTable = ({ employees, loading, onSelectEmployee, setEmployees }) => {
  const [updatingId, setUpdatingId] = useState(null);

  const handleRoleChange = async (email, newRole, currentId) => {
    // 1. Prevent API call if the role hasn't actually changed
    const originalEmployees = [...employees];
    const currentEmp = employees.find(e => e._id === currentId);
    if (currentEmp && currentEmp.role === newRole) return;

    try {
      setUpdatingId(currentId);

      // 2. OPTIMISTIC UPDATE: Change UI immediately for "Fast" feel
      const updatedList = employees.map((emp) => 
        emp._id === currentId ? { ...emp, role: newRole } : emp
      );
      setEmployees(updatedList);

      // 3. API CALL (Payload matches your Postman screenshot)
      const payload = {
        email: email,
        role: newRole,
        permission: "auth.account.update"
      };

      const response = await EmployeeService.updateEmployee(payload);

      // 4. Handle Success
      if (response.success || response.statusCode === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Role Updated',
          text: `Access level changed to ${ROLE_LABELS[newRole]}`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        });
      } else {
        throw new Error(response.message || "Update failed");
      }
    } catch (error) {
      // 5. REVERT: If API fails, roll back the UI
      setEmployees(originalEmployees);
      
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'Could not update role. Reverting change.',
      });
      console.error("Role update error:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Team Member</th>
              <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Access Level</th>
              <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Privileges</th>
              <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="4" className="py-24 text-center">
                  <div className="w-10 h-10 border-4 border-[#E68736] border-t-transparent rounded-full animate-spin mx-auto"></div>
                </td>
              </tr>
            ) : employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp._id} className="hover:bg-[#FFFBF7] transition-all group">
                  {/* Member Info */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-white shadow-lg uppercase">
                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                      </div>
                      <div>
                        <div className="text-sm font-black uppercase tracking-tight">{emp.firstName} {emp.lastName}</div>
                        <div className="text-xs text-slate-500 font-bold flex items-center gap-1 lowercase">
                          <HiMail className="text-[#E68736]" /> {emp.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Dynamic Role Update Cell */}
                  <td className="px-8 py-5">
                    <RoleBadge 
                      role={emp.role} 
                      isLoading={updatingId === emp._id}
                      onChange={(newRole) => handleRoleChange(emp.email, newRole, emp._id)} 
                    />
                  </td>

                  {/* Permissions/Privileges */}
                  <td className="px-8 py-5">
                    <button 
                      onClick={() => onSelectEmployee(emp)} 
                      className="flex flex-wrap gap-1 items-center hover:opacity-70 transition-opacity text-left outline-none"
                    >
                      {emp.permissions?.length > 0 ? (
                        <>
                          <span className="text-[10px] bg-[#E68736] text-white px-2 py-0.5 rounded-md font-black uppercase">
                            {emp.permissions[0].replace("_", " ")}
                          </span>
                          {emp.permissions.length > 1 && (
                            <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-md font-black">
                              +{emp.permissions.length - 1}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 uppercase italic">Limited Access</span>
                      )}
                    </button>
                  </td>

                  {/* Date Joined */}
                  <td className="px-8 py-5 text-right font-mono text-[11px] font-bold text-slate-400">
                    {emp.createdAt 
                      ? new Date(emp.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
                      : 'N/A'
                    }
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No matches found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;