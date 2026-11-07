import logo from "../../assets/home/digident-logo.png";
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
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <form onSubmit={handleForgotSubmit} className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_64px_rgba(15,23,42,0.08)] sm:p-8">
        <img src={logo} alt="Digident" className="mb-6 h-11 w-auto" />
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Forgot your password?</h1>
        <p className="mt-1.5 mb-6 text-sm text-slate-500">Enter your registered email and we&apos;ll send you a reset link.</p>
        <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label>
        <input
          id="forgot-email"
          type="email" placeholder="name@digident.in" required autoComplete="email"
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300"
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="mt-5 w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600">
          Send reset link
        </button>
        <button type="button" onClick={() => navigate('/login')} className="mt-3 w-full rounded-xl py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100">
          Back to sign in
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;