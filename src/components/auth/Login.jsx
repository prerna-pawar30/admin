/* eslint-disable no-unused-vars */
import logo from "../../assets/home/digident-logo.png";
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
// Import Eye icons
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

// Import assets and services
import loginHero from '../../assets/login.webp'; 
import { loginSuccess } from '../../store/slices/AuthSlice';
import { loginUser, EmployeeService } from '../../backend/ApiService';
import { validateLoginForm } from '../../validators/AuthValidator';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    
    try {
      // 1. Client-side Validation
      const cleanData = validateLoginForm(formData);
      
      Swal.fire({
        title: 'Verifying...',
        didOpen: () => { Swal.showLoading(); },
        allowOutsideClick: false
      });

      // 2. Perform Login
      const result = await loginUser(cleanData);
      
      if (result.success) {
        const token = result.data.accessToken;
        let userData = result.data; // Initial user data from login response

        // 3. Dispatch initial success so Interceptors have the token for the next call
        dispatch(loginSuccess({ user: userData, token }));

        try {
          const email = userData?.email;
          if (email) {
            // 4. Fetch Full Employee Profile
            const profileRes = await EmployeeService.getEmployeeByEmail(email);
            if (profileRes?.success && profileRes.data) {
              userData = profileRes.data;
              // Update store with enriched profile data
              dispatch(loginSuccess({ user: userData, token }));
            }
          }
        } catch (profileErr) {
          console.error('Profile fetch failed, proceeding with basic info:', profileErr);
        }

        // 5. Success Notification and Redirect
        Swal.fire({
          icon: 'success',
          title: 'Welcome!',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          if (userData.isNewEmployee) {
            navigate('/account/change-password');
          } else {
            const role = Number(userData.role);
            // Admin/Root (0,1) go to root, others to dashboard
            (role === 0 || role === 1) 
              ? navigate('/') 
              : navigate('/workforce/dashboard');
          }
        });
      }
    } catch (err) {
      if (err.validationErrors) {
        setFieldErrors(err.validationErrors);
        Swal.close(); // Close "Verifying..." spinner so user can fix fields
      } else {
        // Handle API Errors (e.g., 401 Unauthorized or 500 Server Error)
        Swal.fire({ 
          icon: 'error', 
          title: 'Login Failed', 
          text: err.response?.data?.message || 'Invalid Credentials' 
        });
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4 sm:p-6">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.08)] md:min-h-[600px]">
        {/* Illustration */}
        <div className="hidden flex-col items-center justify-center bg-brand-50 p-12 md:flex md:w-1/2">
          <img src={loginHero} alt="" className="h-auto w-full max-w-[360px]" />
          <div className="mt-8 text-center">
            <p className="text-2xl font-bold tracking-tight text-slate-900">Digident Admin</p>
            <p className="mt-2 text-sm text-slate-500">Catalog, sales and workforce — in one place.</p>
          </div>
        </div>

        {/* Form */}
        <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-12 md:w-1/2 lg:px-16">
          <img src={logo} alt="Digident" className="mb-8 h-12 w-auto self-start" />
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
            <p className="mt-1.5 text-sm text-slate-500">Sign in to your account to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="name@digident.in"
                className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 ${fieldErrors.email ? "border-red-400" : "border-slate-200 hover:border-slate-300"}`}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {fieldErrors.email && <p className="mt-1.5 text-xs font-medium text-red-500">{fieldErrors.email}</p>}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 pr-11 ${fieldErrors.password ? "border-red-400" : "border-slate-200 hover:border-slate-300"}`}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:text-slate-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <HiOutlineEyeOff className="text-lg" /> : <HiOutlineEye className="text-lg" />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1.5 text-xs font-medium text-red-500">{fieldErrors.password}</p>}
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 active:scale-[0.99]"
            >
              Sign in
            </button>
          </form>

          <p className="mt-10 text-xs text-slate-400">&copy; {new Date().getFullYear()} Digident India</p>
        </div>
      </div>
    </div>
  );
};

export default Login;