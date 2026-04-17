import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${color}`} />
    <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
  </div>
);

const AttendanceCalendar = ({ 
  currentDate, 
  onMonthChange, 
  canGoBack, 
  getDayDetails, 
  monthNames, 
  dayNames, 
  daysInMonth, 
  firstDayOfMonth 
}) => (
  <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-white">
    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => onMonthChange(-1)} 
          disabled={!canGoBack} 
          className={`p-2 rounded-lg ${!canGoBack ? 'opacity-20' : 'hover:bg-slate-100'}`}
        >
          <ChevronLeft />
        </button>
        <h3 className="text-xl font-black uppercase">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button 
          onClick={() => onMonthChange(1)} 
          className="p-2 hover:bg-slate-100 rounded-lg"
        >
          <ChevronRight />
        </button>
      </div>
      <div className="flex flex-wrap gap-4">
        <LegendItem color="bg-emerald-500" label="Present" />
        <LegendItem color="bg-rose-500" label="Absent" />
        <LegendItem color="bg-purple-500" label="Late" />
      </div>
    </div>

    <div className="grid grid-cols-7 gap-2">
      {dayNames.map(day => (
        <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase pb-4">
          {day}
        </div>
      ))}
      
      {/* Empty slots for days before the 1st of the month */}
      {[...Array(firstDayOfMonth)].map((_, i) => (
        <div key={`empty-${i}`} className="h-16 sm:h-20" />
      ))}
      
      {/* Actual Days */}
      {Array.from({ length: daysInMonth }).map((_, i) => {
        const day = i + 1;
        const details = getDayDetails(day);
        return (
          <div 
            key={day} 
            className={`h-16 sm:h-20 rounded-2xl border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all ${details.style}`}
          >
            <span className="text-lg font-black z-10">{day}</span>
            <span className="text-[7px] font-bold uppercase z-10 text-center px-1">
              {details.label}
            </span>
            {details.dot !== 'transparent' && (
              <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${details.dot}`} />
            )}
          </div>
        );
      })}
    </div>
  </div>
);

export default AttendanceCalendar;