import React from "react";

export default function TabNavigation({ activeTab, coupons, handleTabChange, tabsConfig }) {
  return (
    <div className="mb-6 inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
      {tabsConfig.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icon size={14} />
            {tab.label}
            <span className={`ml-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${activeTab === tab.id ? "bg-brand-50 text-brand-700" : "bg-slate-200/70 text-slate-500"}`}>
              {tab.id === activeTab ? coupons.length : "-"}
            </span>
          </button>
        );
      })}
    </div>
  );
}