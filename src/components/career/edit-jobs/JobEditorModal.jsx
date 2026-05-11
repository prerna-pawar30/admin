/* eslint-disable no-unused-vars */
import React from 'react';
import { ArrowLeft, Save, Layers, DollarSign, Briefcase, Plus, Trash2 } from 'lucide-react';
import { Field, SelectField } from './JobComponents';

const JobEditorModal = ({ editData, setEditData, onSave, onClose, primaryColor }) => {
  
  const handleArrayChange = (index, value, field) => {
    const newArray = [...editData[field]];
    newArray[index] = value;
    setEditData({ ...editData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setEditData({ ...editData, [field]: [...(editData[field] || []), ""] });
  };

  const removeArrayItem = (index, field) => {
    const newArray = editData[field].filter((_, i) => i !== index);
    setEditData({ ...editData, [field]: newArray });
  };

  return (
    <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm overflow-y-auto px-4 py-8 flex justify-center items-start">
      <div className="bg-white w-full max-w-5xl shadow-2xl rounded-2xl flex flex-col relative">
        
        {/* STICKY HEADER */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b flex justify-between items-center px-6 py-5 z-50 rounded-t-2xl">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={22} className="text-gray-500" />
            </button>
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E68736]">Job Editor</h2>
              <p className="font-bold text-xl leading-none text-slate-800">{editData.title || "Edit Job"}</p>
            </div>
          </div>
          <button onClick={onSave} className="flex items-center gap-2 bg-[#E68736] hover:bg-[#cf752d] text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-100 transition-all">
            <Save size={16} /> Save Changes
          </button>
        </div>

        {/* FORM BODY */}
        <div className="p-6 md:p-12 space-y-12">
          {/* Section 1: General */}
          <section>
            <div className="flex items-center gap-3 mb-8 text-slate-400">
              <Layers size={18} />
              <h3 className="text-xs font-black uppercase tracking-[0.15em]">1. General Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Field label="Job Title" value={editData.title} onChange={(v) => setEditData({...editData, title: v})} />
              <Field label="Department" value={editData.department} onChange={(v) => setEditData({...editData, department: v})} />
              <Field label="Location" value={editData.location} onChange={(v) => setEditData({...editData, location: v})} />
              <SelectField label="Workplace" value={editData.workplaceType} options={['onsite', 'remote', 'hybrid']} onChange={(v) => setEditData({...editData, workplaceType: v})} />
              <SelectField label="Employment" value={editData.employmentType} options={['full_time', 'part_time', 'contract']} onChange={(v) => setEditData({...editData, employmentType: v})} />
              <SelectField label="Status" value={editData.status} options={['published', 'draft', 'closed']} onChange={(v) => setEditData({...editData, status: v})} />
            </div>
          </section>

          {/* Section 2: Requirements */}
          <section className="bg-slate-50/50 p-8 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-8 text-slate-400">
              <DollarSign size={18} />
              <h3 className="text-xs font-black uppercase tracking-[0.15em]">2. Requirements & Salary</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <Field label="Min Experience" type="number" value={editData.minExperienceYears} onChange={(v) => setEditData({...editData, minExperienceYears: v})} />
              <Field label="Max Experience" type="number" value={editData.maxExperienceYears} onChange={(v) => setEditData({...editData, maxExperienceYears: v})} />
              <Field label="Min Salary" type="number" value={editData.salary?.min} onChange={(v) => setEditData({...editData, salary: {...editData.salary, min: v}})} />
              <Field label="Max Salary" type="number" value={editData.salary?.max} onChange={(v) => setEditData({...editData, salary: {...editData.salary, max: v}})} />
            </div>
          </section>

          {/* Section 3: Description */}
          <section>
            <div className="flex items-center gap-3 mb-8 text-slate-400">
              <Briefcase size={18} />
              <h3 className="text-xs font-black uppercase tracking-[0.15em]">3. Job Description</h3>
            </div>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-500">Summary</label>
                <textarea className="w-full border-2 border-slate-100 rounded-xl p-4 min-h-[100px] text-sm" value={editData.shortDescription} onChange={(e) => setEditData({...editData, shortDescription: e.target.value})} />
              </div>
              {editData.description?.map((desc, idx) => (
                <div key={idx} className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-500">Block {idx + 1}</label>
                  <textarea className="w-full border-2 border-slate-100 rounded-xl p-4 min-h-[150px] text-sm" value={desc.text} onChange={(e) => {
                    const newDesc = [...editData.description];
                    newDesc[idx].text = e.target.value;
                    setEditData({...editData, description: newDesc});
                  }} />
                </div>
              ))}
            </div>
          </section>

          {/* Lists: Responsibilities & Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-10">
            {['responsibilities', 'skills'].map((field) => (
              <div key={field}>
                <div className="flex justify-between items-center mb-6 pb-2 border-b">
                  <h3 className="text-xs font-black uppercase tracking-widest">{field}</h3>
                  <button onClick={() => addArrayItem(field)} className="p-1.5 bg-slate-900 text-white rounded-lg"><Plus size={16} /></button>
                </div>
                <div className="space-y-4">
                  {editData[field]?.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-center group">
                      <input className="flex-1 border-b-2 border-slate-50 focus:border-[#E68736] py-2 text-sm outline-none bg-transparent" value={item} onChange={(e) => handleArrayChange(idx, e.target.value, field)} />
                      <button onClick={() => removeArrayItem(idx, field)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobEditorModal;