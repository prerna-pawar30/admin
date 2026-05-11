import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmployeeService } from '../../backend/ApiService'; // Updated
import Swal from 'sweetalert2';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({ title: 'Processing...', didOpen: () => Swal.showLoading() });

    try {
      const response = await EmployeeService.forgotPassword(email);
      if (response.success) {
        Swal.fire('Link Sent!', 'Please check your email to reset your password.', 'success');
        navigate('/login');
      }
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Email not found', 'error');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 ">
      <form onSubmit={handleForgotSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border-t-4 border-[#E68736]">
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">Enter your registered email address.</p>
        <div className="mb-6">
          <input 
            type="email" placeholder="user@digident.in" required 
            className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-[#E68736]"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit" className="w-full bg-[#E68736] text-white py-2 rounded font-bold hover:bg-[#d5762a] transition-colors">
          Send Reset Link
        </button>
        <button type="button" onClick={() => navigate('/login')} className="w-full mt-3 text-sm text-gray-500 hover:underline">
          Back to Login
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;