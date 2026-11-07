import logo from "../../assets/home/digident-logo.png";
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EmployeeService } from '../../backend/ApiService';
import Swal from 'sweetalert2';
import InputGroup from '../ui/InputGroup'; // Reusable input component with label and styling
const ResetPassword = () => {
  const { token } = useParams(); // Gets token from URL path
  const navigate = useNavigate();
  
  const [passwords, setPasswords] = useState({ 
    newPassword: '', 
    confirmNewPassword: '' 
  });

  // Unified handler for InputGroup
  const handleChange = (name, value) => {
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReset = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (passwords.newPassword !== passwords.confirmNewPassword) {
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
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_64px_rgba(15,23,42,0.08)] sm:p-8">
        <img src={logo} alt="Digident" className="mb-6 h-11 w-auto" />
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Set a new password</h1>
        <p className="mt-1.5 mb-6 text-sm text-slate-500">Enter and confirm your new password.</p>

        <form onSubmit={handleReset} className="space-y-5">
          <InputGroup
            label="New Password"
            type="password"
            name="newPassword"
            placeholder="Enter new password"
            required
            value={passwords.newPassword}
            onChange={val => handleChange('newPassword', val)}
          />
          <InputGroup
            label="Confirm New Password"
            type="password"
            name="confirmNewPassword"
            placeholder="Confirm new password"
            required
            value={passwords.confirmNewPassword}
            onChange={val => handleChange('confirmNewPassword', val)}
          />

    

          <button 
            type="submit" 
            className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
          >
            Update password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;