import React from "react";
import { Trash2, Plus } from "lucide-react";

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

const inputCls =
  "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 outline-none focus:border-[#E68736] focus:ring-2 focus:ring-orange-100 transition-colors placeholder-gray-300";

export default function SpecificationsSection({ specifications, setSpecifications }) {
  const addSpec = () => setSpecifications([...specifications, { key: "", value: "" }]);

  const removeSpec = (idx) => setSpecifications(specifications.filter((_, i) => i !== idx));

  const updateSpec = (idx, field, val) => {
    const ns = [...specifications];
    ns[idx][field] = val;
    setSpecifications(ns);
  };

  return (
    <Card>
      <SectionHeading step="3" title="Technical specifications" />

      {/* Column headers */}
      {specifications.length > 0 && (
        <div className="grid grid-cols-[1fr_1fr_36px] gap-3 mb-2 px-1">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Property</span>
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Value</span>
          <span />
        </div>
      )}

      {/* Spec rows */}
      <div className="space-y-2 mb-3">
        {specifications.map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_36px] gap-3 items-center">
            <input
              className={inputCls}
              placeholder="e.g. Weight"
              value={s.key}
              onChange={e => updateSpec(i, "key", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="e.g. 500g"
              value={s.value}
              onChange={e => updateSpec(i, "value", e.target.value)}
            />
            <button
              onClick={() => removeSpec(i)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {specifications.length === 0 && (
        <div className="py-8 text-center border border-dashed border-gray-200 rounded-lg mb-3">
          <p className="text-sm text-gray-400">No specifications yet</p>
          <p className="text-xs text-gray-300 mt-1">
            Add key details like weight, diameter, thread type…
          </p>
        </div>
      )}

      {/* Add button */}
      <button
        onClick={addSpec}
        className="flex items-center gap-1.5 text-sm text-[#E68736] hover:opacity-70 transition-opacity"
      >
        <Plus size={15} /> Add specification
      </button>
    </Card>
  );
}