/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  User, ShieldCheck, Mail, Briefcase, Calendar, 
  Loader2, Key, Clock, Globe, Award, AlertCircle
} from 'lucide-react';
import { EmployeeService } from '../../backend/ApiService'; 
import { loginSuccess } from '../../store/slices/AuthSlice';

const Profile = () => {
  const { user, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [fetching, setFetching] = useState(!user);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const emailToFetch = user?.email || JSON.parse(localStorage.getItem('employeeUser'))?.email;
        const currentToken = localStorage.getItem('employeeToken');

        if (emailToFetch) {
          const response = await EmployeeService.getEmployeeByEmail(emailToFetch);
          if (response.success) {
            dispatch(loginSuccess({
              user: response.data,
              token: currentToken 
            }));
          } else {
            setError("Could not retrieve profile details.");
          }
        }
      } catch (err) {
        setError("Failed to synchronize profile with server.");
      } finally {
        setFetching(false);
      }
    };
    fetchProfileData();
  }, [dispatch, user?.email]);

  if (fetching) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] md:ml-72">
        <Loader2 className="text-[#E68736] animate-spin mb-4" size={40} />
        <p className="text-[#E68736] font-bold text-[10px] uppercase tracking-widest">Loading...</p>
      </div>
    );
  }

  const isAdmin = Number(role) === 0 || Number(role) === 1;

  return (
    /* MAIN WRAPPER: 
       - md:ml-72: Moves content to the right on desktop to clear the sidebar.
       - pt-24: Clears the fixed top header.
    */
    <div className="min-h-screen  px-4  transition-all duration-300 md:ml-32">
      
      {/* Content Container - max-w-5xl ensures it doesn't get TOO wide on large monitors */}
      <div className="max-w-5xl ml-0">
        
        {/* HERO SECTION */}
        <div className="relative rounded-[2rem] overflow-hidden bg-slate-900 shadow-2xl mb-8 border border-white/5">
          <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-[#E68736] opacity-20 blur-[80px] rounded-full"></div>
          
          <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-[#E68736] rounded-full blur-md opacity-30"></div>
              <div className="relative p-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <div className={`w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center text-white ${isAdmin ? 'bg-slate-800' : 'bg-[#E68736]'}`}>
                  {isAdmin ? <ShieldCheck size={56} strokeWidth={1.5} /> : <User size={56} strokeWidth={1.5} />}
                </div>
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-4">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Authorized Session</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
                {user.firstName} <span className="text-[#E68736]">{user.lastName}</span>
              </h1>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white text-slate-900 text-[10px] font-black uppercase tracking-wider shadow-sm">
                  <Award size={14} className="text-[#E68736]" />
                  {isAdmin ? 'System Admin' : 'Employee'}
                </span>
                <span className="px-4 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 text-[10px] font-bold uppercase tracking-widest">
                  ID: {user.employeeId || 'DIGI-001'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Globe size={14} /> Workspace
              </h2>
              <div className="space-y-6">
                <InfoItem icon={<Mail size={18}/>} label="Work Email" value={user.email} />
                <InfoItem icon={<Briefcase size={18}/>} label="Department" value={user.department || "General Administration"} />
                <InfoItem icon={<Calendar size={18}/>} label="Joined Date" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <h2 className="text-[10px] font-black text-[#E68736] uppercase tracking-widest mb-8 border-b border-slate-50 pb-4">
                Access & Permissions
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <InfoItem icon={<ShieldCheck size={18}/>} label="Role Type" value={isAdmin ? 'Full Access' : 'Standard'} />
                <InfoItem icon={<Key size={18}/>} label="Status" value="Verified & Active" />
              </div>

              <div className="space-y-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Award size={14} /> Modular Permissions
                </p>
                <div className="flex flex-wrap gap-2">
                  {user.permissions?.length > 0 ? (
                    user.permissions.map((perm, index) => (
                      <span key={index} className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-600 text-[9px] font-black rounded-xl uppercase hover:bg-[#E68736]/10 hover:text-[#E68736] transition-all">
                        {perm.replace(/_/g, ' ')}
                      </span>
                    ))
                  ) : (
                    <div className="w-full p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-slate-400 text-[11px] italic">General workplace permissions applied.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Footer Status */}
            <div className="flex flex-col md:flex-row items-center justify-between p-5 bg-slate-100/50 rounded-[2rem] border border-slate-100 gap-4">
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-slate-400" />
                <p className="text-[10px] font-bold text-slate-600 uppercase">
                  Last Profile Update: {user.updatedAt ? new Date(user.updatedAt).toLocaleTimeString() : 'Recently'}
                </p>
              </div>
              <div className="text-[9px] font-black text-slate-400 uppercase bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                Recorded By: <span className="text-slate-700">{user.createdBy || 'System'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 group">
    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#E68736] shadow-sm flex-shrink-0 group-hover:bg-[#E68736] group-hover:text-white transition-all">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-0.5">{label}</p>
      <p className="text-[13px] font-black text-slate-800 truncate">{value || 'Not Defined'}</p>
    </div>
  </div>
);

export default Profile;