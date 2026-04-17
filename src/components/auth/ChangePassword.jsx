import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { EmployeeService } from '../../backend/ApiService';
import Swal from 'sweetalert2';

const ChangePassword = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({ 
    email: user?.email || '', 
    password: '' 
  });

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
          navigate('workforce/dashboard'); 
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Set Your Password</h2>
        <p className="text-gray-500 mb-6 text-sm text-center">Welcome! Please set a new secure password.</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Email</label>
            <input type="email" required readOnly className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md outline-none cursor-not-allowed" value={formData.email} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input type="password" required placeholder="Enter new password"
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E68736]"
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-[#E68736] hover:bg-[#d5762a] text-white font-medium py-2 rounded-md transition shadow-md">
            Set Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;