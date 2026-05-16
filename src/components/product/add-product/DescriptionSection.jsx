import React from "react";
import { Trash2, Plus, X, UploadCloud } from "lucide-react";
import TextareaGroup from "../../ui/TextareaGroup";

const Card = ({ children }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5">
    {children}
  </div>
);

const SectionHeading = ({ step, title }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <span className="w-6 h-6 rounded-full bg-[#E68736] text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
      {step}
    </span>
    <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">{title}</h2>
  </div>
);

export default function DescriptionSection({ commonForm, setCommonForm, handleFileSelection }) {
  const addSection = () =>
    setCommonForm({
      ...commonForm,
      descriptionSections: [...commonForm.descriptionSections, { text: "", images: [] }],
    });

  const updateSection = (idx, field, val) => {
    const newSections = [...commonForm.descriptionSections];
    newSections[idx][field] = val;
    setCommonForm({ ...commonForm, descriptionSections: newSections });
  };

  const removeSection = (idx) =>
    setCommonForm({
      ...commonForm,
      descriptionSections: commonForm.descriptionSections.filter((_, i) => i !== idx),
    });

  return (
    <Card>
      <SectionHeading step="2" title="Description" />

      {/* Short description */}
      <div className="mb-5">
        <TextareaGroup
          label="Short description"
          rows={2}
          value={commonForm.shortDescription}
          onChange={v => setCommonForm({ ...commonForm, shortDescription: v })}
          placeholder="A brief one or two line summary shown on product listings…"
        />
      </div>

      <hr className="border-gray-100 mb-5" />

      {/* Long description paragraphs */}
      <p className="text-xs font-medium text-gray-500 mb-3">
        Detailed description — add as many paragraphs as needed
      </p>

      <div className="space-y-3">
        {commonForm.descriptionSections.map((section, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50/50"
          >
            {/* Para header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                Paragraph {idx + 1}
              </span>
              {idx > 0 && (
                <button
                  onClick={() => removeSection(idx)}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
                >
                  <Trash2 size={13} /> Remove
                </button>
              )}
            </div>

            {/* Text */}
            <div className="mb-3">
              <TextareaGroup
                label="Content"
                rows={4}
                value={section.text}
                onChange={v => updateSection(idx, "text", v)}
                placeholder="Describe this aspect of the product…"
              />
            </div>

            {/* Images for this paragraph */}
            <div>
              <p className="text-[11px] font-medium text-gray-400 mb-2">
                Section image (optional)
              </p>
              <div className="flex flex-wrap gap-2">
                {section.images?.map((file, i) => (
                  <div
                    key={i}
                    className="relative w-14 h-14 rounded-lg border border-gray-200 overflow-hidden bg-white flex-shrink-0"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      className="w-full h-full object-cover"
                      alt="section"
                    />
                    <button
                      onClick={() => {
                        const newSections = [...commonForm.descriptionSections];
                        newSections[idx].images = newSections[idx].images.filter(
                          (_, imgI) => imgI !== i
                        );
                        setCommonForm({ ...commonForm, descriptionSections: newSections });
                      }}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/50 rounded-full flex items-center justify-center"
                    >
                      <X size={9} className="text-white" />
                    </button>
                  </div>
                ))}
                <label className="w-14 h-14 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#E68736] hover:bg-orange-50 transition-colors flex-shrink-0 gap-0.5">
                  <UploadCloud size={15} className="text-gray-400" />
                  <span className="text-[9px] text-gray-400">Upload</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={e => handleFileSelection(e, null, "descImages", idx)}
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add paragraph button */}
      <button
        type="button"
        onClick={addSection}
        className="w-full mt-3 py-2.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#E68736] hover:text-[#E68736] flex items-center justify-center gap-2 transition-colors"
      >
        <Plus size={15} /> Add another paragraph
      </button>
    </Card>
  );
}