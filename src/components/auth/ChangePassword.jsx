/* eslint-disable no-unused-vars */
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
    <div className="min-h-screen flex items-center justify-center  px-4">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-46   rounded-b-[3rem]"></div>
      
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl shadow-slate-200 border border-orange-200 p-10 relative">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#E68736] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-100">
            <LuLock className="text-white text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Set Your Password</h2>
          <p className="text-slate-400 mt-2 text-sm font-medium italic">Welcome! Let's secure your account.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field (Read Only) */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <LuMail size={14} className="text-[#E68736]"/> Email Address
            </label>
            <input 
              type="email" 
              required 
              readOnly 
              className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium outline-none cursor-not-allowed" 
              value={formData.email} 
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <LuLock size={14} className="text-[#E68736]"/> New Password
            </label>
            <div className="relative group">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                placeholder="••••••••"
                className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold outline-none transition-all focus:border-[#E68736] focus:ring-4 focus:ring-orange-50 group-hover:border-slate-300"
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
            className="w-full bg-slate-900 hover:bg-[#E68736] text-white font-bold py-4 rounded-xl transition-all duration-300  transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Create Password
          </button>
        </form>
        
        <p className="mt-8 text-center text-xs text-slate-400 font-medium">
          Make sure your password is at least 8 characters long.
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;