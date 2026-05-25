/* eslint-disable no-unused-vars */
import React from 'react';
import { ArrowLeft, Save, Layers, Briefcase, Plus, Trash2, Sliders, CheckCircle, Gift } from 'lucide-react';
import { Field } from './JobComponents';
import DropdownGroup from '../../../components/ui/DropdownGroup';

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

  // Config for all array sections
  const arraySections = [
    { field: 'responsibilities', label: 'Responsibilities', icon: CheckCircle },
    { field: 'requirements',     label: 'Requirements',     icon: CheckCircle },
    { field: 'skills',           label: 'Skills',           icon: CheckCircle },
    { field: 'perks',            label: 'Perks & Benefits', icon: Gift        },
  ];

  return (
    <div className="fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4 md:p-6 flex justify-center items-center animate-fade-in overflow-visible">
      <div className="bg-white w-full max-w-5xl h-full sm:h-[90vh] shadow-2xl sm:rounded-2xl flex flex-col relative border border-slate-200/80 overflow-visible">

        {/* HEADER */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 flex justify-between items-center px-6 py-4 z-50 shrink-0 sm:rounded-t-2xl">
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

        {/* BODY */}
        <div className="flex-1 p-6 sm:p-10 space-y-12 overflow-y-auto bg-white overflow-x-visible">

          {/* SECTION 1: CORE POSITION FRAMEWORK */}
          <section className="space-y-6 overflow-visible relative z-40">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
              <Layers size={16} className="text-[#E68736]" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-800">1. Core Allocation Profile</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 overflow-visible">
              <Field label="Job Title Placement" value={editData.title} onChange={(v) => setEditData({ ...editData, title: v })} />

              <DropdownGroup
                label="Target Department"
                value={editData.department}
                options={[
                  { value: "Engineering", label: "Engineering" },
                  { value: "Design",      label: "Design"      },
                  { value: "Marketing",   label: "Marketing"   },
                  { value: "HR",          label: "HR"          },
                ]}
                onChange={(v) => setEditData({ ...editData, department: v })}
              />

              <Field label="Geographic Location" value={editData.location} onChange={(v) => setEditData({ ...editData, location: v })} />

              <DropdownGroup
                label="Workplace Architecture"
                value={editData.workplaceType}
                options={[
                  { value: "onsite", label: "Onsite" },
                  { value: "remote", label: "Remote" },
                  { value: "hybrid", label: "Hybrid" },
                ]}
                onChange={(v) => setEditData({ ...editData, workplaceType: v })}
              />

              <DropdownGroup
                label="Employment Structural Type"
                value={editData.employmentType}
                options={[
                  { value: "full_time", label: "Full Time" },
                  { value: "part_time", label: "Part Time" },
                  { value: "contract",  label: "Contract"  },
                ]}
                onChange={(v) => setEditData({ ...editData, employmentType: v })}
              />

              <DropdownGroup
                label="Experience Level"
                value={editData.experienceLevel}
                options={[
                  { value: "junior",    label: "Junior"    },
                  { value: "mid",       label: "Mid"       },
                  { value: "senior",    label: "Senior"    },
                  { value: "lead",      label: "Lead"      },
                  { value: "executive", label: "Executive" },
                ]}
                onChange={(v) => setEditData({ ...editData, experienceLevel: v })}
              />

              <DropdownGroup
                label="Live Portal Status"
                value={editData.status}
                options={[
                  { value: "published", label: "Published" },
                  { value: "draft",     label: "Draft"     },
                  { value: "closed",    label: "Closed"    },
                ]}
                onChange={(v) => setEditData({ ...editData, status: v })}
              />

              <Field
                label="Total Openings"
                value={editData.openings}
                type="number"
                onChange={(v) => setEditData({ ...editData, openings: parseInt(v) || 1 })}
              />
            </div>
          </section>

          {/* SECTION 2: METRICS & SALARY */}
          <section className="space-y-6 overflow-visible relative z-30">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
              <Sliders size={16} className="text-[#E68736]" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-800">2. Professional Benchmarks & Salary</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Experience Range */}
              <div className="bg-slate-50/50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Experience Scope (Years)</span>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Minimum Cap" value={editData.minExperienceYears} type="number" onChange={(v) => setEditData({ ...editData, minExperienceYears: parseInt(v) || 0 })} />
                  <Field label="Maximum Cap" value={editData.maxExperienceYears} type="number" onChange={(v) => setEditData({ ...editData, maxExperienceYears: parseInt(v) || 0 })} />
                </div>
              </div>

              {/* Salary */}
              <div className="bg-slate-50/50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Compensation Package</span>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Floor Target" value={editData.salary?.min} type="number" onChange={(v) => setEditData({ ...editData, salary: { ...editData.salary, min: parseInt(v) || 0 } })} />
                  <Field label="Ceiling Target" value={editData.salary?.max} type="number" onChange={(v) => setEditData({ ...editData, salary: { ...editData.salary, max: parseInt(v) || 0 } })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <DropdownGroup
                    label="Currency"
                    value={editData.salary?.currency || 'INR'}
                    options={[
                      { value: "INR", label: "INR ₹" },
                      { value: "USD", label: "USD $" },
                      { value: "EUR", label: "EUR €" },
                      { value: "GBP", label: "GBP £" },
                    ]}
                    onChange={(v) => setEditData({ ...editData, salary: { ...editData.salary, currency: v } })}
                  />
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editData.salary?.isVisible ?? true}
                        onChange={(e) => setEditData({ ...editData, salary: { ...editData.salary, isVisible: e.target.checked } })}
                        className="w-4 h-4 rounded accent-[#E68736] cursor-pointer"
                      />
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Show Salary</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: NARRATIVES */}
          <section className="space-y-6 relative z-20">
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
                  onChange={(e) => setEditData({ ...editData, shortDescription: e.target.value })}
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
                      newDesc[idx] = { ...newDesc[idx], text: e.target.value };
                      setEditData({ ...editData, description: newDesc });
                    }}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: ARRAY FIELDS — responsibilities, requirements, skills, perks */}
          <section className="space-y-10 pt-4 relative z-10">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
              <CheckCircle size={16} className="text-[#E68736]" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-800">4. Role Breakdown Parameters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {arraySections.map(({ field, label, icon: Icon }) => (
                <div key={field} className="space-y-4">
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-[#E68736]" />
                      <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-800">{label}</h4>
                    </div>
                    <button
                      onClick={() => addArrayItem(field)}
                      className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center"
                      title={`Add ${label}`}
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
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}

                    {(!editData[field] || editData[field].length === 0) && (
                      <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <p className="text-xs text-slate-400 font-medium italic">No {label.toLowerCase()} listed yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default JobEditorModal;