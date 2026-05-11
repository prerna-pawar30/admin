import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const legendItems = [
  { color: 'bg-emerald-500', label: 'Present', textColor: 'text-emerald-600' },
  { color: 'bg-red-500', label: 'Absent', textColor: 'text-red-500' },
  { color: 'bg-amber-500', label: 'Half Day', textColor: 'text-amber-600' },
  { color: 'bg-purple-500', label: 'Late', textColor: 'text-purple-600' },
  { color: 'bg-cyan-500', label: 'Early', textColor: 'text-cyan-600' },
  { color: 'bg-orange-500', label: 'Leave', textColor: 'text-orange-600' },
  { color: 'bg-rose-400', label: 'Holiday', textColor: 'text-rose-500' },
];

const LegendItem = ({ color, label, textColor }) => (
  <div className="flex items-center gap-1.5">
    <div className={`w-2 h-2 rounded-full ${color} shrink-0`} />
    <span className={`text-[10px] font-bold uppercase tracking-wide ${textColor}`}>{label}</span>
  </div>
);

const SkeletonCell = () => (
  <div className="h-16 sm:h-[4.5rem] rounded-2xl bg-slate-100 animate-pulse" />
);

const AttendanceCalendar = ({
  currentDate,
  onMonthChange,
  canGoBack,
  getDayDetails,
  monthNames,
  dayNames,
  daysInMonth,
  firstDayOfMonth,
  loading = false,
}) => {
  return (
    <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
            <Calendar size={17} className="text-orange-500" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onMonthChange(-1)}
              disabled={!canGoBack}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
                ${!canGoBack ? 'opacity-25 cursor-not-allowed' : 'hover:bg-slate-100 active:scale-95'}`}
            >
              <ChevronLeft size={16} className="text-slate-500" />
            </button>
            <h3 className="text-base font-black uppercase tracking-wide text-slate-800 w-44 text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button
              onClick={() => onMonthChange(1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-all active:scale-95"
            >
              <ChevronRight size={16} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {legendItems.map(item => (
            <LegendItem key={item.label} {...item} />
          ))}
        </div>
      </div>

      {/* Day Name Headers */}
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pb-3">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {[...Array(firstDayOfMonth)].map((_, i) => (
          <div key={`empty-${i}`} className="h-16 sm:h-[4.5rem]" />
        ))}

        {loading
          ? Array.from({ length: daysInMonth }).map((_, i) => <SkeletonCell key={i} />)
          : Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const details = getDayDetails(day);
              const isEmpty = !details.label || details.label === '';

              return (
                <div
                  key={day}
                  style={details.customStyle || {}}
                  className={`
                    h-16 sm:h-[4.5rem] rounded-2xl border-2 flex flex-col items-center justify-center
                    relative overflow-hidden transition-all duration-150 select-none
                    ${!details.customStyle ? details.style : 'border-slate-200'}
                  `}
                >
                  <span className={`font-black z-10 ${isEmpty ? 'text-slate-200 text-base' : 'text-slate-800 text-base sm:text-lg'}`}>
                    {day}
                  </span>

                  {!isEmpty && (
                    <span className="text-[7px] sm:text-[8px] font-extrabold uppercase tracking-tight z-10 text-center px-1 mt-0.5 leading-tight max-w-full truncate">
                      {details.label}
                    </span>
                  )}

                  {/* Dot indicator(s) */}
                  <div className="absolute bottom-1.5 flex gap-0.5">
                    {details.dots && details.dots.map((dotClass, idx) => (
                      <div key={idx} className={`w-1.5 h-1.5 rounded-full ${dotClass} opacity-70`} />
                    ))}
                  </div>
                </div>
              );
            })}
      </div>

      {!loading && (
        <div className="mt-6 pt-5 border-t border-slate-50 flex flex-wrap gap-3 justify-end">
          <span className="text-[10px] text-slate-400 font-medium">
            Sundays are rest days · Mixed colors indicate multiple statuses
          </span>
        </div>
      )}
    </div>
  );
};

export default AttendanceCalendar;