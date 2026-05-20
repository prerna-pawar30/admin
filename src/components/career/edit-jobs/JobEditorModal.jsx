/* eslint-disable no-unused-vars */
import React from 'react';
import { ArrowLeft, Save, Layers, DollarSign, Briefcase, Plus, Trash2, Sliders, CheckCircle } from 'lucide-react';
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
    <div className="fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-sm overflow-y-auto p-0 sm:p-4 md:p-6 flex justify-center items-center animate-fade-in">
      <div className="bg-white w-full max-w-5xl h-full sm:h-[90vh] shadow-2xl sm:rounded-2xl flex flex-col relative border border-slate-200/80 overflow-hidden">
        
        {/* CONSOLE NAVIGATION HEADER */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 flex justify-between items-center px-6 py-4 z-50 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-xl transition-all shrink-0 border border-slate-200/60 shadow-sm"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E68736] block mb-0.5">Management Console</span>
              <h2 className="font-black text-lg text-slate-900 truncate tracking-tight uppercase">
                {editData.title || "Configure Vacancy"}
              </h2>
            </div>
          </div>
          
          <button 
            onClick={onSave} 
            className="flex items-center gap-2 bg-[#E68736] hover:bg-[#cf752d] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md shadow-orange-500/10 transition-all shrink-0 group"
          >
            <Save size={14} className="group-hover:scale-110 transition-transform" /> 
            <span>Save Modifications</span>
          </button>
        </div>

        {/* MODERNIZED STREAMLINED WORKFLOW BODY */}
        <div className="flex-1 p-6 sm:p-10 space-y-12 overflow-y-auto bg-white">
          
          {/* SECTION 1: CORE POSITION FRAMEWORK */}
          <section className="space-y-6">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
              <Layers size={16} className="text-[#E68736]" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-800">1. Core Allocation Profile</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <Field label="Job Title Placement" value={editData.title} onChange={(v) => setEditData({...editData, title: v})} />
              <Field label="Target Department" value={editData.department} onChange={(v) => setEditData({...editData, department: v})} />
              <Field label="Geographic Location" value={editData.location} onChange={(v) => setEditData({...editData, location: v})} />
              <SelectField label="Workplace Architecture" value={editData.workplaceType} options={['onsite', 'remote', 'hybrid']} onChange={(v) => setEditData({...editData, workplaceType: v})} />
              <SelectField label="Employment Structural Type" value={editData.employmentType} options={['full_time', 'part_time', 'contract']} onChange={(v) => setEditData({...editData, employmentType: v})} />
              <SelectField label="Live Portal Status" value={editData.status} options={['published', 'draft', 'closed']} onChange={(v) => setEditData({...editData, status: v})} />
            </div>
          </section>

          {/* SECTION 2: METRICS & SYSTEM VALIDATIONS */}
          <section className="space-y-6">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
              <Sliders size={16} className="text-[#E68736]" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-800">2. Professional Benchmarks & Salary</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Experience Matrix Sub-Grid */}
              <div className="bg-slate-50/50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Experience Scope (Years)</span>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Minimum Cap" value={editData.minExperienceYears} type="number" onChange={(v) => setEditData({...editData, minExperienceYears: v})} />
                  <Field label="Maximum Cap" value={editData.maxExperienceYears} type="number" onChange={(v) => setEditData({...editData, maxExperienceYears: v})} />
                </div>
              </div>

              {/* Remuneration Matrix Sub-Grid */}
              <div className="bg-slate-50/50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Compensation Package</span>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Floor Target" value={editData.salary?.min} onChange={(v) => setEditData({...editData, salary: {...editData.salary, min: v}})} />
                  <Field label="Ceiling Target" value={editData.salary?.max} onChange={(v) => setEditData({...editData, salary: {...editData.salary, max: v}})} />
                </div>
              </div>

            </div>
          </section>

          {/* SECTION 3: TEXTUAL NARRATIVES Portfolio */}
          <section className="space-y-6">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
              <Briefcase size={16} className="text-[#E68736]" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-800">3. Narrative Overviews</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block ml-1">Short Brief Summary</label>
                <textarea 
                  className="w-full border border-slate-200/80 rounded-xl p-4 text-sm font-medium text-slate-700 focus:border-[#E68736] focus:ring-1 focus:ring-[#E68736]/10 outline-none transition-all min-h-[90px] resize-y bg-white placeholder-slate-300" 
                  placeholder="Summarize the core identity of this role for external visibility maps..."
                  value={editData.shortDescription} 
                  onChange={(e) => setEditData({...editData, shortDescription: e.target.value})} 
                />
              </div>

              {editData.description?.map((desc, idx) => (
                <div key={idx} className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block ml-1">Comprehensive Details Block {idx + 1}</label>
                  <textarea 
                    className="w-full border border-slate-200/80 rounded-xl p-4 text-sm font-medium text-slate-700 focus:border-[#E68736] focus:ring-1 focus:ring-[#E68736]/10 outline-none transition-all min-h-[140px] resize-y bg-white placeholder-slate-300" 
                    placeholder="Provide standard parameters, timeline markers, and daily expectations..."
                    value={desc.text} 
                    onChange={(e) => {
                      const newDesc = [...editData.description];
                      newDesc[idx].text = e.target.value;
                      setEditData({...editData, description: newDesc});
                    }} 
                  />
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: DEEP GRANULAR ARRAYS BREAKDOWN */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
            {['responsibilities', 'skills'].map((field) => (
              <div key={field} className="space-y-4">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-[#E68736]" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-800">{field} Breakdown</h3>
                  </div>
                  <button 
                    onClick={() => addArrayItem(field)} 
                    className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center"
                    title={`Add new ${field} metric`}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="space-y-3">
                  {editData[field]?.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center group animate-fade-in">
                      <div className="flex-1 relative">
                        <input 
                          className="w-full border border-slate-200/80 rounded-xl pl-4 pr-10 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#E68736] focus:ring-1 focus:ring-[#E68736]/10 bg-white transition-all" 
                          value={item} 
                          onChange={(e) => handleArrayChange(idx, e.target.value, field)} 
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-300 group-hover:text-slate-400 transition-colors">
                          #{idx + 1}
                        </span>
                      </div>
                      <button 
                        onClick={() => removeArrayItem(idx, field)} 
                        className="text-slate-300 hover:text-red-500 p-2 rounded-xl transition-all hover:bg-red-50 border border-transparent hover:border-red-100 shrink-0"
                      >
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  ))}
                  
                  {(!editData[field] || editData[field].length === 0) && (
                    <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      <p className="text-xs text-slate-400 font-medium italic">No parameters listed in this quadrant.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>

        </div>
      </div>
    </div>
  );
};

export default JobEditorModal;