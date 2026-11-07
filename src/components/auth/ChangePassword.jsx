/* eslint-disable no-unused-vars */
import PageHeader from "../ui/PageHeader";
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { EmployeeService } from '../../backend/ApiService';
import Swal from 'sweetalert2';
import { LuLock, LuMail, LuEye, LuEyeOff } from 'react-icons/lu';

const ChangePassword = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({ 
    email: user?.email || '', 
    password: '' 
  });
  
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    Swal.fire({
      title: 'Updating Password...',
      didOpen: () => { Swal.showLoading(); },
      allowOutsideClick: false
    });
    
    try {
      const result = await EmployeeService.changePassword(formData);

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Password set successfully!',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          navigate('/workforce/dashboard'); 
        });
      }
    } catch (error) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Update Failed', 
        text: error.response?.data?.message || 'Could not update password.' 
      });
    }
  };

  return (
    <div>
      <PageHeader icon={LuLock} title="Change Password" description="Set a new password for your account." />
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field (Read Only) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-2">
              <LuMail size={14} className="text-slate-400"/> Email Address
            </label>
            <input 
              type="email" 
              required 
              readOnly 
              className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-500 font-medium outline-none cursor-not-allowed" 
              value={formData.email} 
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-2">
              <LuLock size={14} className="text-slate-400"/> New Password
            </label>
            <div className="relative group">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                placeholder="••••••••"
                className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none transition-all focus:border-brand-400 focus:ring-4 focus:ring-orange-50 group-hover:border-slate-300"
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#E68736] transition-colors"
              >
                {showPassword ? <LuEyeOff size={20}/> : <LuEye size={20}/>}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
          >
            Update password
          </button>
        </form>
        
        <p className="mt-5 text-xs text-slate-500">
          Make sure your password is at least 8 characters long.
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;