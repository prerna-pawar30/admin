import React from 'react';

export const PunchCard = ({ currentTime, status, sessionTime, isLoading, onPunch }) => {
  // logic to determine color and shadow based on status
  const getButtonStyles = () => {
    if (status === "HOLIDAY") return "bg-slate-300 text-slate-500 cursor-not-allowed border-slate-200";
    if (status === "OUT") return "bg-emerald-500 text-white shadow-emerald-200";
    if (status === "FORGOT") return "bg-amber-500 text-white shadow-amber-200";
    return "bg-rose-500 text-white shadow-rose-200";
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-slate-200/50 border border-orange-200 h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
      <div className="text-5xl font-black font-mono mb-2 tracking-tighter text-slate-800">
        {currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">
        {currentTime.toLocaleDateString("en-IN", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      {status === "IN" && (
        <div className="mb-8 flex flex-col items-center">
          <div className="px-6 py-2 bg-orange-100 rounded-2xl flex items-center gap-3 border border-orange-200">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-400"></span>
            </span>
            <span className="text-2xl font-black text-orange-400 font-mono">{sessionTime}</span>
          </div>
          <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Current Session Running</p>
        </div>
      )}

      <button 
        onClick={onPunch} 
        disabled={isLoading || status === "HOLIDAY"}
        className={`w-60 py-5 rounded-3xl text-2xl font-black transition-all active:scale-95 border-b-4 active:border-b-0 ${getButtonStyles()}`}
      >
        {isLoading ? (
          "PROCESSING..."
        ) : status === "HOLIDAY" ? (
          "HOLIDAY"
        ) : status === "OUT" ? (
          "PUNCH IN"
        ) : status === "FORGOT" ? (
          "FIX LOG"
        ) : (
          "PUNCH OUT"
        )}
      </button>

      {status === "HOLIDAY" && (
        <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Office is closed today
        </p>
      )}
    </div>
  );
};