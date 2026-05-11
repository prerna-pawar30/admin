/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { CareerService } from '../../backend/ApiService'; 
import Swal from 'sweetalert2'; // Import SweetAlert2

const CareerAdminContainer = () => {
  return (
    <div className="flex-1 min-h-screen p-6 md:p-12 lg:p-16 bg-[#F8FAFC] font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Hiring Portal</h1>
          <p className="text-slate-500 mt-2 text-lg">Manage your organization's career opportunities and talent pipeline.</p>
        </header>
        <CreateOpeningForm />
      </div>
    </div>
  );
};

const CreateOpeningForm = () => {
  const [formData, setFormData] = useState({
    permission: "career.job.create",
    title: "",
    department: "Engineering",
    location: "Surat, Gujarat",
    workplaceType: "onsite",
    employmentType: "full_time",
    experienceLevel: "junior",
    minExperienceYears: 1,
    maxExperienceYears: 3,
    openings: 1,
    salary: { min: 0, max: 0, currency: "INR", isVisible: true },
    shortDescription: "",
    description: [{ text: "" }],
    responsibilities: [""],
    requirements: [""],
    skills: [""],
    status: "published",
    isFeatured: true
  });

  const handleListChange = (index, value, field) => {
    const updatedList = [...formData[field]];
    updatedList[index] = value;
    setFormData({ ...formData, [field]: updatedList });
  };

  const addListField = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const removeListField = (index, field) => {
    if (formData[field].length > 1) {
      const updatedList = formData[field].filter((_, i) => i !== index);
      setFormData({ ...formData, [field]: updatedList });
    }
  };

  const handleDescriptionChange = (index, value) => {
    const updatedDesc = [...formData.description];
    updatedDesc[index] = { text: value };
    setFormData({ ...formData, description: updatedDesc });
  };

  const addDescriptionField = () => {
    setFormData({ ...formData, description: [...formData.description, { text: "" }] });
  };

  const removeDescriptionField = (index) => {
    if (formData.description.length > 1) {
      const updatedDesc = formData.description.filter((_, i) => i !== index);
      setFormData({ ...formData, description: updatedDesc });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submissionData = {
      ...formData,
      responsibilities: formData.responsibilities.filter(i => i.trim() !== ""),
      requirements: formData.requirements.filter(i => i.trim() !== ""),
      skills: formData.skills.filter(i => i.trim() !== ""),
      description: formData.description.filter(i => i.text.trim() !== "")
    };

    try {
      await CareerService.createJob(submissionData);
      
      // SWEET ALERT SUCCESS
      Swal.fire({
        title: 'Success!',
        text: 'Job Opening has been published successfully.',
        icon: 'success',
        confirmButtonColor: '#E68736',
        timer: 3000
      });

    } catch (error) {
      const msg = error.response?.data?.error?.details?.[0] || error.response?.data?.message || "Check all required fields";
      
      // SWEET ALERT ERROR
      Swal.fire({
        title: 'Error!',
        text: msg,
        icon: 'error',
        confirmButtonColor: '#d33',
      });

      console.error("Submission error details:", error.response?.data);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
      <div className="bg-[#1E293B] p-8 text-white">
        <h2 className="text-2xl font-bold">Create Job Opening</h2>
        <p className="text-slate-400 text-sm mt-1">Fill out all sections to list a new position.</p>
      </div>

      <form className="p-8 md:p-12 space-y-12" onSubmit={handleSubmit}>
        
        {/* Section: Role Identity */}
        <section>
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#E68736] mb-6">General Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <Input label="Job Title" placeholder="e.g. Senior Frontend Engineer" required onChange={(v) => setFormData({...formData, title: v})} />
            <Select label="Department" options={["Engineering", "Design", "Marketing", "HR"]} onChange={(v) => setFormData({...formData, department: v})} />
          </div>
        </section>

        {/* Section: Logistics */}
        <section>
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#E68736] mb-6">Work Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Select label="Workplace" options={["onsite", "remote", "hybrid"]} onChange={(v) => setFormData({...formData, workplaceType: v})} />
            <Select label="Employment" options={["full_time", "part_time", "contract"]} onChange={(v) => setFormData({...formData, employmentType: v})} />
            <Input label="Experience (Years)" type="number" onChange={(v) => setFormData({...formData, minExperienceYears: parseInt(v)})} />
            <Input label="Total Openings" type="number" onChange={(v) => setFormData({...formData, openings: parseInt(v)})} />
          </div>
        </section>

        {/* Section: Compensation */}
        <section className="bg-orange-50/50 p-8 rounded-2xl border border-orange-100">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#E68736] mb-6">Compensation (Annual)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input label="Min Salary" type="number" onChange={(v) => setFormData({...formData, salary: {...formData.salary, min: parseInt(v)}})} />
            <Input label="Max Salary" type="number" onChange={(v) => setFormData({...formData, salary: {...formData.salary, max: parseInt(v)}})} />
            <Select label="Currency" options={["INR", "USD"]} onChange={(v) => setFormData({...formData, salary: {...formData.salary, currency: v}})} />
          </div>
        </section>

        {/* Section: Summaries & Description */}
        <section className="space-y-8">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Short Description</label>
            <textarea 
              className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-[#E68736] outline-none min-h-[100px]"
              placeholder="A brief summary for the job card..."
              onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Detailed Description (Required)</label>
              <button type="button" onClick={addDescriptionField} className="text-xs font-bold text-[#E68736] hover:underline">+ Add Paragraph</button>
            </div>
            <div className="space-y-3">
              {formData.description.map((item, i) => (
                <div key={i} className="flex gap-2 group">
                  <textarea 
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-[#E68736] outline-none min-h-[100px]"
                    placeholder={`Description section ${i + 1}...`}
                    value={item.text}
                    onChange={(e) => handleDescriptionChange(i, e.target.value)}
                    required
                  />
                  {formData.description.length > 1 && (
                    <button type="button" onClick={() => removeDescriptionField(i)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Dynamic Lists */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <DynamicList label="Responsibilities" list={formData.responsibilities} onAdd={() => addListField('responsibilities')} onChange={(i,v)=>handleListChange(i,v,'responsibilities')} onRemove={(i) => removeListField(i, 'responsibilities')} />
          <DynamicList label="Requirements" list={formData.requirements} onAdd={() => addListField('requirements')} onChange={(i,v)=>handleListChange(i,v,'requirements')} onRemove={(i) => removeListField(i, 'requirements')} />
          <DynamicList label="Key Skills" list={formData.skills} onAdd={() => addListField('skills')} onChange={(i,v)=>handleListChange(i,v,'skills')} onRemove={(i) => removeListField(i, 'skills')} />
        </section>

        <div className="pt-6 border-t border-slate-100">
          <button type="submit" className="w-full md:w-max px-12 bg-[#E68736] hover:bg-[#cf7529] text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all active:scale-[0.98]">
            Publish Job Opening
          </button>
        </div>
      </form>
    </div>
  );
};

/* Reusable Components */
const Input = ({ label, type="text", placeholder, onChange, required }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">{label}</label>
    <input 
      type={type} 
      placeholder={placeholder}
      required={required}
      onChange={(e)=>onChange(e.target.value)} 
      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#E68736] focus:border-transparent transition-all outline-none text-slate-600"
    />
  </div>
);

const Select = ({ label, options, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">{label}</label>
    <div className="relative">
      <select 
        onChange={(e)=>onChange(e.target.value)} 
        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 appearance-none focus:bg-white focus:ring-2 focus:ring-[#E68736] outline-none text-slate-600"
      >
        {options.map(o => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  </div>
);

const DynamicList = ({ label, list, onAdd, onChange, onRemove }) => (
  <div className="flex flex-col gap-3">
    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">{label}</label>
    <div className="space-y-2">
      {list.map((item, i)=>(
        <div key={i} className="flex gap-2 group">
          <input 
            value={item} 
            placeholder={`Item ${i + 1}`}
            onChange={(e)=>onChange(i,e.target.value)} 
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white transition-all outline-none text-sm"
          />
          {list.length > 1 && (
            <button type="button" onClick={() => onRemove(i)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          )}
        </div>
      ))}
    </div>
    <button type="button" onClick={onAdd} className="text-sm font-semibold text-[#E68736] hover:text-[#cf7529] flex items-center gap-1 mt-1 transition-colors">
      <span className="text-lg">+</span> Add field
    </button>
  </div>
);

export default CareerAdminContainer;