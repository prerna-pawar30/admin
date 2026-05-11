import React from 'react';

const FilterTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'attendance', label: 'Attendance' },
    { id: 'leaves', label: 'Leaves' },
    { id: 'punchout', label: 'Punch-Out' }
  ];

  return (
    <div className="flex bg-slate-200/50 p-1.5 rounded-[1.2rem] backdrop-blur-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
            activeTab === tab.id
              ? "bg-white text-slate-900 shadow-md"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;