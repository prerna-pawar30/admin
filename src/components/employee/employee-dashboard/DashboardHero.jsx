import React from 'react';
import { User, LayoutDashboard, ChevronRight, Fingerprint } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate

const DashboardHero = ({ user, loading, onPunchClick }) => {
  const navigate = useNavigate(); // 2. Initialize navigate function

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'EM';

  // 3. Create a handler that triggers the punch logic AND redirects
  const handlePunchAndRedirect = (e) => {
    // If you have existing punch-in logic passed from parent, call it
    if (onPunchClick) {
      onPunchClick(e);
    }
    
    // Redirect to the dashboard route
    navigate('/workforce/portal'); 
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 sm:p-8 rounded-[2rem] border border-orange-100 shadow-sm">
      
      {/* User Info */}
      <div className="flex items-center gap-5">
        {/* Avatar */}
        <div className="relative">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-[1.5rem] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-100 ring-4 ring-orange-50">
            <span className="text-xl sm:text-2xl font-black tracking-tight">{initials}</span>
          </div>
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-white shadow-sm" />
        </div>

        {/* Text */}
        <div>
          <p className="text-orange-500 font-bold text-[10px] uppercase tracking-[0.15em] mb-0.5">
            Personal Workspace
          </p>
          {loading ? (
            <div className="space-y-2">
              <div className="h-7 w-40 bg-slate-100 animate-pulse rounded-lg" />
              <div className="h-4 w-28 bg-slate-100 animate-pulse rounded-lg" />
            </div>
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 leading-tight">
                {user?.firstName} {user?.lastName}
              </h1>
              <div className="flex items-center gap-1.5 mt-1 text-slate-400 font-semibold text-xs">
                <LayoutDashboard size={12} />
                <span>{user?.role || 'Staff Member'}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Punch In Button */}
      <button
        onClick={handlePunchAndRedirect} // 4. Update the onClick handler
        className="group flex items-center gap-3 bg-slate-900 hover:bg-orange-500 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-200 shadow-lg hover:shadow-orange-200 hover:shadow-xl active:scale-95"
      >
        <Fingerprint size={18} className="group-hover:animate-pulse" />
        System Punch In
        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default DashboardHero;