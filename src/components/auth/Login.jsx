/* eslint-disable no-unused-vars */
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
    <div className="min-h-screen flex items-center justify-center p-4 md:p-10 font-sans">
      <div className="max-w-5xl w-full bg-white rounded-3xl border border-orange-100 shadow-lg overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side: Illustration & Branding */}
        <div className="hidden md:flex md:w-1/2 bg-[#FFF9F5] flex-col items-center justify-center p-12 border-r border-gray-100">
          <img 
            src={loginHero} 
            alt="Workforce Illustration" 
            className="w-full max-w-[380px] h-auto transform hover:scale-105 transition-transform duration-500"
          />
          <div className="text-center mt-10">
            <h1 className="text-4xl font-black text-gray-800 tracking-tight">
              DIGI<span className="text-[#E68736]">DENT</span>
            </h1>
            <p className="text-gray-500 mt-3 text-lg font-medium">
              Precision in dental workforce management.
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-8 lg:p-16">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Please login to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input 
                type="email" 
                placeholder="name@digident.in" 
                className={`w-full px-4 py-4 rounded-xl border-2 transition-all outline-none ${
                  fieldErrors.email ? 'border-red-400' : 'border-gray-100 focus:border-[#E68736] bg-gray-50 focus:bg-white'
                }`}
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-2 font-semibold tracking-wide uppercase">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" size="sm" className="text-[#E68736] text-sm font-bold hover:underline">
                  Forgot?
                </Link>
              </div>
              
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className={`w-full px-4 py-4 pr-12 rounded-xl border-2 transition-all outline-none ${
                    fieldErrors.password ? 'border-red-400' : 'border-gray-100 focus:border-[#E68736] bg-gray-50 focus:bg-white'
                  }`}
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E68736] transition-colors p-1"
                >
                  {showPassword ? <HiOutlineEyeOff className="text-xl" /> : <HiOutlineEye className="text-xl" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-2 font-semibold tracking-wide uppercase">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#E68736] hover:bg-[#cf7429] text-white py-4 rounded-xl font-black text-lg shadow-lg hover:shadow-[#e68736]/30 transition-all active:scale-[0.98] mt-4"
            >
              LOG IN
            </button>
          </form>

          <div className="mt-12 text-center text-gray-400 text-xs font-medium uppercase tracking-[2px]">
            &copy; 2026 Digident India
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;