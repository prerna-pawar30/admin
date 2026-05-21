import React, { useState } from 'react';
import { EmployeeService } from '../../backend/ApiService';
import { USER_ROLES, ROLE_LABELS } from '../../constants/UserRoles';
import InputGroup from '../ui/InputGroup'; 
import DropdownGroup from '../ui/DropdownGroup'; 
import Swal from 'sweetalert2';
import { Eye, EyeOff, ShieldCheck, User, Mail, Lock } from 'lucide-react';

const EmployeeCreate = () => {
  const initialState = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: USER_ROLES.SUPER_ADMIN.toString(),
    personalEmail: '',
    permission: 'auth.account.create'
  };

  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({
    value: value.toString(), 
    label
  }));

  const updateField = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 8) {
      return Swal.fire({
        icon: 'warning',
        title: 'Weak Password',
        text: 'Password must be at least 8 characters long.'
      });
    }

    setIsSubmitting(true);
    Swal.fire({
      title: 'Creating Employee...',
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false
    });

    try {
      const result = await EmployeeService.createEmployee(formData);
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Employee registered successfully!',
          timer: 2000,
          showConfirmButton: false
        });
        setFormData(initialState);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error?.details?.[0] || 
                           err.response?.data?.message || 
                           'Failed to create employee.';
      Swal.fire({ icon: 'error', title: 'Registration Failed', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50/50">
      <div className="max-w-4xl w-full bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-orange-100 overflow-visible">
        
        {/* Form Section */}
        <div className="p-6 sm:p-10 md:p-12">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <ShieldCheck className="text-[#E68736] shrink-0" size={32} />
              Add New Employee
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
              Setup credentials and system permissions
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            
            <InputGroup 
              label="First Name" 
              placeholder="Enter first name" 
              value={formData.firstName}
              onChange={(val) => updateField('firstName', val)}
              icon={<User size={14} />}
              required 
            />
            
            <InputGroup 
              label="Last Name" 
              placeholder="Enter last name" 
              value={formData.lastName}
              onChange={(val) => updateField('lastName', val)}
              icon={<User size={14} />}
              required 
            />

            <div className="md:col-span-2">
              <InputGroup 
                label="Work Email" 
                type="email"
                placeholder="name@digident.in" 
                value={formData.email}
                onChange={(val) => updateField('email', val)}
                icon={<Mail size={14} />}
                required 
              />
            </div>

            <div className="md:col-span-2">
              <InputGroup 
                label="Personal Email" 
                type="email"
                placeholder="personal@email.com" 
                value={formData.personalEmail}
                onChange={(val) => updateField('personalEmail', val)}
                icon={<Mail size={14} />}
                required 
              />
            </div>

            {/* Password Field Container */}
            <div className="flex flex-col gap-1 w-full">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Initial Password
              </span>

              <div className="relative w-full flex items-center">
                <div className="w-full">
                  <InputGroup 
                    label="" 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={(val) => updateField('password', val)}
                    icon={<Lock size={14} />}
                    required 
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#E68736] transition-colors z-10 p-1 flex items-center justify-center"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              <p className={`text-[9px] font-black uppercase tracking-wider ml-1 mt-0.5 transition-colors ${formData.password.length >= 8 ? 'text-green-500' : 'text-slate-400'}`}>
                {formData.password.length >= 8 ? '✓ Length OK' : '○ Min. 8 characters'}
              </p>
            </div>

            {/* System Role Dropdown Context */}
            <div className="w-full relative">
              <DropdownGroup 
                label="System Role"
                options={roleOptions}
                value={formData.role}
                onChange={(val) => updateField('role', val)}
                icon={<ShieldCheck size={14} />}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#E68736] text-white text-xs sm:text-sm font-black uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-[#d5762a] shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none"
              >
                {isSubmitting ? 'Processing...' : 'Register Employee'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCreate;