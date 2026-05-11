import React from "react";
import { AlignLeft, Trash2, UploadCloud, Plus, X } from "lucide-react";
import TextareaGroup from "../../ui/TextareaGroup";

export default function DescriptionSection({ commonForm, setCommonForm, handleFileSelection }) {
  const addSection = () => setCommonForm({ ...commonForm, descriptionSections: [...commonForm.descriptionSections, { text: "", images: [] }] });
  const updateSection = (idx, field, val) => {
    const newSections = [...commonForm.descriptionSections];
    newSections[idx][field] = val;
    setCommonForm({ ...commonForm, descriptionSections: newSections });
  };
  const removeSection = (idx) => setCommonForm({ ...commonForm, descriptionSections: commonForm.descriptionSections.filter((_, i) => i !== idx) });

  return (
    <section className="bg-white rounded-3xl border border-orange-200  p-8 space-y-8">
      <div className="flex items-center gap-2 mb-2"><AlignLeft className="text-[#E68736]" size={20} /><h2 className="font-bold text-lg text-slate-900">Product Context & Description</h2></div>
      <TextareaGroup label="Short Description" rows={2} value={commonForm.shortDescription} onChange={v => setCommonForm({ ...commonForm, shortDescription: v })} />
      <div className="space-y-10">
        {commonForm.descriptionSections.map((section, idx) => (
          <div key={idx} className="relative p-6 bg-slate-50/50 rounded-3xl border border-orange-200 space-y-4">
            <div className="flex justify-between items-center"><span className="text-[10px] font-black text-[#E68736] uppercase tracking-[0.2em]">Paragraph {idx + 1}</span>{idx > 0 && <button onClick={() => removeSection(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>}</div>
            <TextareaGroup label="Paragraph Content" rows={4} value={section.text} onChange={v => updateSection(idx, 'text', v)} />
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Section Image</label>
              <div className="flex flex-wrap gap-4">
                {section.images?.map((file, i) => (
                  <div key={i} className="w-20 h-20 border border-orange-200 rounded-xl overflow-hidden relative bg-white shadow-sm">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="section" />
                    <button onClick={() => {
                       const newSections = [...commonForm.descriptionSections];
                       newSections[idx].images = newSections[idx].images.filter((_, imgI) => imgI !== i);
                       setCommonForm({...commonForm, descriptionSections: newSections});
                    }} className="absolute top-1 right-1 bg-white rounded-full p-1"><X size={10}/></button>
                  </div>
                ))}
                <label className="w-20 h-20 border-2 border-dashed border-orange-200 rounded-xl flex items-center justify-center cursor-pointer bg-white hover:bg-orange-50">
                  <UploadCloud className="text-orange-300" size={20} />
                  <input type="file" multiple className="hidden" onChange={e => handleFileSelection(e, null, 'descImages', idx)} />
                </label>
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={addSection} className="w-full py-4 border-2 border-dashed border-orange-200 rounded-2xl text-slate-400 font-bold text-sm hover:border-[#E68736] hover:text-[#E68736] flex items-center justify-center gap-2"><Plus size={18} /> Add Another Paragraph</button>
      </div>
    </section>
  );
}