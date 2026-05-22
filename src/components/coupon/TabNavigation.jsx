import React from "react";

export default function TabNavigation({ activeTab, coupons, handleTabChange, tabsConfig }) {
  return (
    <div className="flex items-center gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
      {tabsConfig.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === tab.id ? "bg-white text-[#E68736] shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon size={14} />
            {tab.label}
            <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] ${activeTab === tab.id ? "bg-orange-100" : "bg-slate-200 text-slate-500"}`}>
              {tab.id === activeTab ? coupons.length : "-"}
            </span>
          </button>
        );
      })}
    </div>
  );
}