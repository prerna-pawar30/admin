import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EmployeeService } from '../../backend/ApiService';
import Swal from 'sweetalert2';

const ResetPassword = () => {
  const { token } = useParams(); // Gets token from URL path
  const navigate = useNavigate();
  
  const [passwords, setPasswords] = useState({ 
    newPassword: '', 
    conformNewPassword: '' 
  });

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  const handleReset = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (passwords.newPassword !== passwords.conformNewPassword) {
      return Swal.fire('Error', 'Passwords do not match!', 'error');
    }

    Swal.fire({
      title: 'Updating Password...',
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false
    });

    try {
      // Using the standardized service layer
      const result = await EmployeeService.resetPassword(token, passwords);

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Password changed successfully!',
          confirmButtonColor: '#E68736'
        }).then(() => {
          navigate('/login');
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Token invalid or expired'
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 ">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border-t-4 border-[#E68736]">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Set New Password</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Please enter and confirm your new secure password.
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input 
              type="password" 
              name="newPassword"
              placeholder="Enter new password" 
              required 
              className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-[#E68736] transition-all"
              value={passwords.newPassword}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input 
              type="password" 
              name="conformNewPassword"
              placeholder="Confirm new password" 
              required 
              className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-[#E68736] transition-all"
              value={passwords.conformNewPassword}
              onChange={handleChange}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#E68736] text-white py-2 rounded font-bold hover:bg-[#d5762a] shadow-md transition-colors active:transform active:scale-[0.98]"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;