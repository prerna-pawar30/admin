import React, { useState } from "react";
import Swal from "sweetalert2";

// Constants for the ClickUp Look
const PRIORITIES = [
  { label: "Urgent", color: "#dc2626", bg: "#fef2f2", icon: "🔴" },
  { label: "High",   color: "#ea580c", bg: "#fff7ed", icon: "🟠" },
  { label: "Normal", color: "#f97316", bg: "#fff7ed", icon: "🟡" },
  { label: "Low",    color: "#64748b", bg: "#f8fafc", icon: "⚪" },
];

const STATUSES = [
  { label: "To Do", dot: "#94a3b8" },
  { label: "In Progress", dot: "#f97316" },
  { label: "In Review", dot: "#f59e0b" },
  { label: "Done", dot: "#22c55e" },
];

const TAGS = [
  { label: "Feature", color: "#ea580c", bg: "#fff7ed" },
  { label: "Bug", color: "#dc2626", bg: "#fef2f2" },
  { label: "Research", color: "#0369a1", bg: "#f0f9ff" },
  { label: "Design", color: "#7c3aed", bg: "#f5f3ff" },
];

const MEMBERS = ["Alex Kim", "Priya Patel", "Jordan Lee", "Sam Rivera", "Casey Morgan"];
const AVATAR_COLORS = ["#f97316", "#ea580c", "#dc2626", "#0369a1", "#0f766e"];
const getInitials = (name) => name.split(" ").map((n) => n[0]).join("");

export default function AdminTaskPage() {
  const [task, setTask] = useState({
    title: "",
    status: "To Do",
    priority: "Normal",
    assignees: [],
    deadline: "",
    startDate: "",
    description: "",
    tags: [],
    estimate: "",
  });

  const [activeSection, setActiveSection] = useState("details");
  const [memberSearch, setMemberSearch] = useState("");
  const [memberDropdown, setMemberDropdown] = useState(false);

  const filteredMembers = MEMBERS.filter(
    (m) => m.toLowerCase().includes(memberSearch.toLowerCase()) && !task.assignees.includes(m)
  );

  const handleTagToggle = (tagLabel) =>
    setTask((p) => ({
      ...p,
      tags: p.tags.includes(tagLabel) ? p.tags.filter((t) => t !== tagLabel) : [...p.tags, tagLabel],
    }));

  const handleAssignee = (m) => {
    setTask((p) => ({ ...p, assignees: [...p.assignees, m] }));
    setMemberDropdown(false);
    setMemberSearch("");
  };

  const removeAssignee = (m) =>
    setTask((p) => ({ ...p, assignees: p.assignees.filter((a) => a !== m) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!task.title.trim()) return;

    Swal.fire({
      title: "Task Created",
      text: "Task added to the workspace successfully.",
      icon: "success",
      confirmButtonColor: "#f97316",
    });

    setTask({
      title: "", status: "To Do", priority: "Normal", assignees: [],
      deadline: "", startDate: "", description: "", tags: [], estimate: ""
    });
  };

  const selPriority = PRIORITIES.find((p) => p.label === task.priority);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      {/* Header Bar */}
      <div className="bg-[#1e293b] h-14 px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-black text-white italic">W</div>
          <span className="text-white font-bold text-sm tracking-tight">WorkSpace Admin</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white border-2 border-slate-700">A</div>
      </div>

      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Internal Title Section */}
          <div className="px-8 pt-8 pb-4 border-b border-slate-50">
            <div className="flex items-center gap-2 mb-2">
               <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
               <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Create New Task</span>
            </div>
            <input
              type="text"
              placeholder="Task name..."
              className="w-full text-2xl font-extrabold text-slate-800 placeholder:text-slate-300 outline-none border-b-2 border-transparent focus:border-slate-100 transition-all pb-2"
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
            />

            {/* Status Pills */}
            <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
              {STATUSES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setTask({ ...task, status: s.label })}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold transition-all whitespace-nowrap ${
                    task.status === s.label ? "bg-orange-50 border-orange-200 text-orange-600 shadow-sm" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }}></span>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-6 mt-6">
              {["details", "subtasks", "activity"].map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSection(s)}
                  className={`pb-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                    activeSection === s ? "border-orange-500 text-slate-800" : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
            
            {/* Left Column: Form Details */}
            <div className="lg:col-span-8 p-8 border-r border-slate-50">
              {activeSection === "details" ? (
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Description</label>
                    <textarea
                      placeholder="Add task details, links, or requirements..."
                      className="w-full min-h-[150px] p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
                      value={task.description}
                      onChange={(e) => setTask({ ...task, description: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Set Priority</label>
                    <div className="flex flex-wrap gap-3">
                      {PRIORITIES.map((p) => {
                        const isSel = task.priority === p.label;
                        return (
                          <button
                            key={p.label}
                            onClick={() => setTask({ ...task, priority: p.label })}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                              isSel ? "shadow-md scale-105" : "opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                            }`}
                            style={{ borderColor: isSel ? p.color : "#f1f5f9", background: isSel ? p.bg : "white", color: isSel ? p.color : "#64748b" }}
                          >
                            <span>{p.icon}</span> {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Labels / Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {TAGS.map((tag) => {
                        const isSel = task.tags.includes(tag.label);
                        return (
                          <button
                            key={tag.label}
                            onClick={() => handleTagToggle(tag.label)}
                            className={`px-3 py-1.5 rounded-lg border text-[11px] font-black transition-all ${
                              isSel ? "border-transparent text-white" : "border-slate-100 bg-white text-slate-400"
                            }`}
                            style={{ backgroundColor: isSel ? tag.color : "" }}
                          >
                            {isSel && "✓ "} {tag.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-2xl mb-4">📭</div>
                  <h3 className="font-bold text-slate-400 uppercase text-xs tracking-tighter">No {activeSection} found</h3>
                </div>
              )}
            </div>

            {/* Right Column: Sidebar Metadata */}
            <div className="lg:col-span-4 bg-slate-50/50 p-8 space-y-8">
              {/* Assignees Section */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Assignees</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {task.assignees.map((a, i) => (
                    <div key={a} className="flex items-center gap-2 bg-white border border-slate-200 pl-1 pr-3 py-1 rounded-full shadow-sm animate-in fade-in zoom-in duration-200">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                        {getInitials(a)}
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">{a}</span>
                      <button onClick={() => removeAssignee(a)} className="text-orange-500 hover:text-red-500 text-xs font-bold">×</button>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  <input
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-100"
                    placeholder="Search people..."
                    value={memberSearch}
                    onChange={(e) => { setMemberSearch(e.target.value); setMemberDropdown(true); }}
                    onFocus={() => setMemberDropdown(true)}
                  />
                  {memberDropdown && filteredMembers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl z-50 p-2 overflow-hidden">
                      {filteredMembers.map((m, i) => (
                        <div
                          key={m}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-orange-50 rounded-lg cursor-pointer transition-colors"
                          onMouseDown={() => handleAssignee(m)}
                        >
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                            {getInitials(m)}
                          </div>
                          <span className="text-xs font-bold text-slate-600">{m}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Due Date</label>
                  <input type="date" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs outline-none" value={task.deadline} onChange={(e) => setTask({ ...task, deadline: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Time Estimate</label>
                  <input className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs outline-none" placeholder="e.g. 4h" value={task.estimate} onChange={(e) => setTask({ ...task, estimate: e.target.value })} />
                </div>
              </div>

              {/* Task Summary Box */}
              <div className="bg-slate-800 rounded-2xl p-5 text-white shadow-lg">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Workspace Summary</p>
                <div className="space-y-3">
                   <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Priority</span>
                      <span className="font-bold" style={{ color: selPriority?.color }}>{selPriority?.icon} {task.priority}</span>
                   </div>
                   <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Status</span>
                      <span className="font-bold text-orange-400">{task.status}</span>
                   </div>
                   <div className="flex justify-between text-xs border-t border-slate-700 pt-3">
                      <span className="text-slate-400">Assignees</span>
                      <span className="font-bold">{task.assignees.length}</span>
                   </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-95"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}