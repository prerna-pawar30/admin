import React from "react";

const DEMO_TASKS = [
  { id: 1, title: "Finalize Payroll Report", priority: "High", due: "Today", status: "TO DO", tag: "Finance", color: "#f97316" },
  { id: 2, title: "Fix Login Bug", priority: "Medium", due: "12 May", status: "IN PROGRESS", tag: "Bug", color: "#3b82f6" },
  { id: 3, title: "Client Presentation", priority: "High", due: "15 May", status: "TO DO", tag: "Marketing", color: "#a855f7" },
  { id: 4, title: "Database Cleanup", priority: "Low", due: "20 May", status: "COMPLETED", tag: "DevOps", color: "#10b981" },
];

export default function TaskDashboard() {
  const statuses = ["TO DO", "IN PROGRESS", "COMPLETED"];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Live Workspace</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              Task Dashboard
              <span className="bg-slate-200/50 text-slate-500 px-2.5 py-1 rounded-lg text-xs font-black">
                {DEMO_TASKS.length}
              </span>
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Manage and track your team's sprint progress.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
              View Analytics
            </button>
            <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black hover:bg-orange-600 transition-all shadow-lg shadow-slate-200 active:scale-95 uppercase tracking-widest">
              + New Task
            </button>
          </div>
        </header>

        {/* Status Groupings */}
        <div className="grid grid-cols-1 gap-12">
          {statuses.map((status) => {
            const statusTasks = DEMO_TASKS.filter((t) => t.status === status);
            const isDone = status === "COMPLETED";
            const isProgress = status === "IN PROGRESS";
            
            const accentColor = isDone ? "#10b981" : isProgress ? "#3b82f6" : "#94a3b8";

            return (
              <div key={status} className="group">
                {/* Status Header */}
                <div className="flex items-center justify-between mb-5 px-2">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-1.5 rounded-full" style={{ backgroundColor: accentColor }}></div>
                    <h2 className="text-xs font-black text-slate-700 uppercase tracking-[0.15em]">{status}</h2>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">
                      {statusTasks.length}
                    </span>
                  </div>
                  <button className="text-[10px] font-black text-slate-300 hover:text-slate-500 uppercase tracking-widest transition-colors">
                    Batch Edit
                  </button>
                </div>

                {/* Task Table Card */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all group-hover:shadow-md group-hover:border-slate-300">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-8 py-4 w-[45%]">Task Details</th>
                        <th className="px-4 py-4">Deadline</th>
                        <th className="px-4 py-4">Priority</th>
                        <th className="px-8 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {statusTasks.length > 0 ? (
                        statusTasks.map((task) => (
                          <tr key={task.id} className="hover:bg-slate-50/50 transition-all group/row cursor-pointer">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="relative flex items-center justify-center">
                                  <input 
                                    type="checkbox" 
                                    checked={isDone}
                                    readOnly
                                    className="peer h-5 w-5 rounded-fuxll border-2 border-slate-200 text-orange-500 focus:ring-0 cursor-pointer appearance-none checked:bg-orange-500 checked:border-orange-500 transition-all" 
                                  />
                                  <svg className="absolute w-3 h-3 text-white hidden peer-checked:block pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <div className="flex flex-col">
                                  <span className={`text-sm font-bold transition-all ${isDone ? 'text-slate-400 line-through' : 'text-slate-700 group-hover/row:text-orange-600'}`}>
                                    {task.title}
                                  </span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span 
                                      className="text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider"
                                      style={{ backgroundColor: `${task.color}15`, color: task.color }}
                                    >
                                      {task.tag}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-5">
                              <div className="flex flex-col">
                                <span className={`text-xs font-bold ${task.due === 'Today' ? 'text-orange-500' : 'text-slate-500'}`}>
                                  {task.due}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-5">
                              <span className={`text-[10px] font-black flex items-center gap-1.5 ${task.priority === 'High' ? 'text-rose-500' : task.priority === 'Medium' ? 'text-orange-500' : 'text-slate-400'}`}>
                                <span className="text-xs">{task.priority === 'High' ? '🚩' : '🏳️'}</span>
                                {task.priority}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button className="opacity-0 group-hover/row:opacity-100 transition-all text-[10px] font-black bg-slate-100 text-slate-600 hover:bg-orange-500 hover:text-white px-4 py-2 rounded-lg uppercase tracking-widest">
                                {isDone ? 'Reopen' : 'Resolve'}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-8 py-10 text-center">
                            <p className="text-xs text-slate-300 font-bold italic tracking-wide">No active tasks in {status}</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}