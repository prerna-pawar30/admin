import React, { useState } from 'react';
import { EmployeeService } from '../../backend/ApiService';
import { USER_ROLES, ROLE_LABELS } from '../../constants/UserRoles';
import InputGroup from '../ui/InputGroup'; 
import DropdownGroup from '../ui/DropdownGroup'; 
import Swal from 'sweetalert2';

const EmployeeCreate = () => {
  // Initial state uses strings for all fields to satisfy backend validation
  const initialState = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: USER_ROLES.SUPER_ADMIN.toString(), // Defaults to "3" (string)
    personalEmail: '',
    permission: 'auth.account.create' // Updated to match your successful API log
  };

  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map roles to dropdown options
  const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({
    value: value.toString(), 
    label
  }));

  const updateField = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    Swal.fire({
      title: 'Creating Employee...',
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false
    });

    try {
      /* FIX: We no longer use parseInt(). 
         Sending formData directly ensures "role" remains a string, 
         preventing the "role must be a string" validation error.
      */
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
      // Improved error message extraction to show specific validation details if available
      const errorMessage = err.response?.data?.error?.details?.[0] || 
                           err.response?.data?.message || 
                           'Failed to create employee.';
      
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 ">
      <div className="max-w-3xl w-full bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 p-10 border-t-8 border-[#E68736]">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Add New Employee</h2>
          <p className="text-slate-400 font-medium mt-2">Set up credentials and system roles</p>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              placeholder="Enter work email" 
              value={formData.email}
              onChange={(val) => updateField('email', val)}
              required 
            />
          </div>

          <div className="md:col-span-2">
            <InputGroup 
              label="Personal Email" 
              type="email"
              placeholder="Enter personal email" 
              value={formData.personalEmail}
              onChange={(val) => updateField('personalEmail', val)}
              required 
            />
          </div>

          <InputGroup 
            label="Initial Password" 
            type="password"
            placeholder="Minimum 8 characters" 
            value={formData.password}
            onChange={(val) => updateField('password', val)}
            required 
          />

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
            className="md:col-span-2 mt-4 bg-[#E68736] text-white text-sm font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-[#d5762a] shadow-lg shadow-orange-200 transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none"
          >
            {isSubmitting ? 'Processing...' : 'Register Employee'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeCreate;