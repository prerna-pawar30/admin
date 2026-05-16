import React, { useState } from 'react';
import { EmployeeService } from '../../backend/ApiService';
import { USER_ROLES, ROLE_LABELS } from '../../constants/UserRoles';
import InputGroup from '../ui/InputGroup'; 
import DropdownGroup from '../ui/DropdownGroup'; 
import Swal from 'sweetalert2';
import { Eye, EyeOff, Lock, User, Mail, ShieldCheck } from 'lucide-react'; // Using Lucide for clean icons

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
    
    // Basic frontend validation for password length
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
    <div className="min-h-screen  flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-orange-200">
        <div className="flex flex-col md:flex-row">
          
          {/* Form Section */}
          <div className="flex-1 p-8 md:p-12">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <ShieldCheck className="text-[#E68736]" size={32} />
                Add New Employee
              </h2>
              <p className="text-slate-400 font-medium mt-2">Setup credentials and system permissions</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              
              <InputGroup 
                label="First Name" 
                placeholder="Enter first name" 
                value={formData.firstName}
                onChange={(val) => updateField('firstName', val)}
                required 
              />
              
              <InputGroup 
                label="Last Name" 
                placeholder="Enter last name" 
                value={formData.lastName}
                onChange={(val) => updateField('lastName', val)}
                required 
              />

              <div className="md:col-span-2">
                <InputGroup 
                  label="Work Email" 
                  type="email"
                  placeholder="name@digident.in" 
                  value={formData.email}
                  onChange={(val) => updateField('email', val)}
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
                  required 
                />
              </div>

              {/* Password Section with Eye Toggle */}
              <div className="relative group">
                <div className="relative">
                  <InputGroup 
                    label="Initial Password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={(val) => updateField('password', val)}
                    required 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[3.2rem] text-slate-400 hover:text-[#E68736] transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {/* Visual Password Requirement Hint */}
                <p className={`text-[10px] mt-1 font-bold uppercase tracking-wider ${formData.password.length >= 8 ? 'text-green-500' : 'text-slate-400'}`}>
                  {formData.password.length >= 8 ? '✓ Length OK' : '○ Min. 8 characters'}
                </p>
              </div>

              <DropdownGroup 
                label="System Role"
                options={roleOptions}
                value={formData.role}
                onChange={(val) => updateField('role', val)}
                required
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="md:col-span-2 mt-6 bg-[#E68736] text-white text-sm font-black uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-[#d5762a] shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none"
              >
                {isSubmitting ? 'Processing...' : 'Register Employee'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCreate;