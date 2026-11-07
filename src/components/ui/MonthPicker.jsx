import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MONTH_NAMES, shiftMonth } from "../../utils/IstTime";

/** Month / year switcher: arrows plus selects. value = { month: 1-12, year }. */
export default function MonthPicker({ value, onChange, maxValue, minYear = 2024, className = "" }) {
  const isAfterMax = (candidate) => maxValue && candidate.year * 12 + candidate.month > maxValue.year * 12 + maxValue.month;
  const next = shiftMonth(value, 1);
  const years = [];
  const lastYear = maxValue?.year || value.year + 1;
  for (let year = Math.min(minYear, value.year); year <= lastYear; year += 1) years.push(year);

  const change = (candidate) => {
    if (!isAfterMax(candidate)) onChange(candidate);
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button type="button" aria-label="Previous month" onClick={() => change(shiftMonth(value, -1))} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
        <ChevronLeft size={16} />
      </button>
      <select
        aria-label="Month"
        value={value.month}
        onChange={(event) => change({ ...value, month: Number(event.target.value) })}
        className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-sm font-bold text-slate-700"
      >
        {MONTH_NAMES.map((name, index) => (
          <option key={name} value={index + 1} disabled={isAfterMax({ year: value.year, month: index + 1 })}>
            {name}
          </option>
        ))}
      </select>
      <select
        aria-label="Year"
        value={value.year}
        onChange={(event) => change({ ...value, year: Number(event.target.value) })}
        className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-sm font-bold text-slate-700"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
      <button
        type="button"
        aria-label="Next month"
        disabled={isAfterMax(next)}
        onClick={() => change(next)}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
