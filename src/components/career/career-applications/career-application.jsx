import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CareerService } from '../../../backend/ApiService';

const Careerapplications = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  // Track which application is currently being updated in the list
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchList = async () => {
      setLoading(true);
      try {
        let response;
        if (jobId && jobId !== ":jobId") {
          response = await CareerService.getApplicationsByJobId(jobId);
        } else {
          response = await CareerService.getAllApplications();
        }
        if (response.success && response.data?.applications) {
          setApplications(response.data.applications);
        } else {
          setApplications([]);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [jobId]);

  // --- NEW: Status Update Handler for the List ---
  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      const res = await CareerService.updateApplicationStatus(applicationId, newStatus);
      if (res.success) {
        // Optimistically update the local list state
        setApplications(prev => 
          prev.map(app => app.applicationId === applicationId ? { ...app, status: newStatus } : app)
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewDetails = async (app) => {
    setSelectedApp(app);
    setModalLoading(true);
    try {
      const res = await CareerService.getApplicationById(app.applicationId);
      if (res.success) setSelectedApp(res.data);
    } catch (err) {
      console.error("Detail error:", err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
               <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
               <span className="text-xs font-bold tracking-widest text-orange-600 uppercase">Recruitment Portal</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Applications</h1>
            <p className="text-slate-500 font-medium">
              Managing <span className="text-slate-800">{applications.length} candidates</span> for Job ID: 
              <span className="ml-2 px-2 py-0.5 bg-slate-200 rounded text-xs font-mono">{jobId}</span>
            </p>
          </div>
          
          <div className="hidden md:block">
             <div className="bg-white shadow-sm border border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                  <p className="text-sm font-bold text-green-600">Active Pipeline</p>
                </div>
                <div className="h-8 w-[1px] bg-slate-200"></div>
                <div className="text-orange-500 text-2xl font-black">{applications.length}</div>
             </div>
          </div>
        </header>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-slate-400 font-medium animate-pulse">Syncing with database...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200 shadow-sm">
            <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">No applications yet</h3>
            <p className="text-slate-500 mt-1 max-w-xs mx-auto text-sm leading-relaxed">This position hasn't received any candidates. Try checking your job posting visibility.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-8 py-5 text-[11px] uppercase tracking-[0.15em] font-black text-slate-400">Applicant Info</th>
                    <th className="px-8 py-5 text-[11px] uppercase tracking-[0.15em] font-black text-slate-400">Experience</th>
                    <th className="px-8 py-5 text-[11px] uppercase tracking-[0.15em] font-black text-slate-400">Application Status</th>
                    <th className="px-8 py-5 text-[11px] uppercase tracking-[0.15em] font-black text-slate-400 text-right">Resume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app._id} className="group hover:bg-orange-50/30 transition-all duration-200">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                            {(app.applicant?.firstName || app.firstName || 'A').charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                              {app.applicant?.firstName || app.firstName} {app.applicant?.lastName || app.lastName}
                            </div>
                            <div className="text-xs text-slate-500 font-medium">{app.applicant?.email || app.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
                          {app.applicant?.totalExperienceYears || 0 } Years Exp
                        </span>
                      </td>
                      
                      {/* --- NEW: STATUS DROPDOWN SECTION --- */}
                      <td className="px-8 py-6">
                        <div className="relative inline-block w-40">
                          <select 
                            value={app.status || 'pending'}
                            disabled={updatingId === app.applicationId}
                            onChange={(e) => handleStatusChange(app.applicationId, e.target.value)}
                            className={`w-full appearance-none px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight border outline-none transition-all cursor-pointer
                              ${app.status === 'shortlisted' ? 'bg-green-50 text-green-700 border-green-200' : 
                                app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                                'bg-blue-50 text-blue-700 border-blue-200'}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          {updatingId === app.applicationId && (
                            <div className="absolute right-8 top-1/2 -translate-y-1/2">
                              <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleViewDetails(app)}
                          className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-200 transition-all active:scale-95"
                        >
                          View Profile
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- Application Details Modal --- */}
        {selectedApp && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden relative flex flex-col animate-in fade-in zoom-in duration-300">
              
              {/* Modal Header */}
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Candidate Profile</h2>
                    {modalLoading && (
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-orange-100 text-orange-600 rounded text-[9px] font-black uppercase tracking-tighter">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping"></div>
                        Syncing Details
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Reviewing application for position {jobId}</p>
                </div>
                <button 
                  onClick={() => setSelectedApp(null)}
                  className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  
                  {/* Left Column: Personal */}
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-[11px] font-black text-orange-500 uppercase tracking-[0.2em] mb-5">Personal Information</h3>
                      <div className="space-y-4">
                        <DetailItem label="Full Name" value={`${selectedApp.applicant?.firstName || selectedApp.firstName} ${selectedApp.applicant?.lastName || selectedApp.lastName}`} />
                        <DetailItem label="Email Address" value={selectedApp.applicant?.email || selectedApp.email} isEmail />
                        <DetailItem label="Contact Number" value={selectedApp.applicant?.phone} />
                        <DetailItem label="Current Location" value={`${selectedApp.applicant?.city || 'N/A'}, ${selectedApp.applicant?.state || ''}`} />
                      </div>
                    </section>

                    <section>
                      <h3 className="text-[11px] font-black text-orange-500 uppercase tracking-[0.2em] mb-5">Online Presence</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {['LinkedIn', 'GitHub', 'Portfolio'].map(platform => {
                          const url = selectedApp.applicant?.[`${platform.toLowerCase()}Url`];
                          return (
                            <div key={platform} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="text-xs font-bold text-slate-600">{platform}</span>
                              {url ? (
                                <a href={url} target="_blank" rel="noreferrer" className="text-xs font-bold text-orange-600 hover:underline">Visit Link</a>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-bold italic">Not Linked</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </div>

                  {/* Right Column: Professional */}
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-[11px] font-black text-orange-500 uppercase tracking-[0.2em] mb-5">Professional Summary</h3>
                      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-5">
                        <DetailItem label="Current Company" value={selectedApp.applicant?.currentCompany} />
                        <div className="grid grid-cols-2 gap-4">
                          <DetailItem label="Notice Period" value={`${selectedApp.applicant?.noticePeriodDays || 0} Days`} />
                          <DetailItem label="Total Exp" value={`${selectedApp.applicant?.totalExperienceYears || 0} Years`} />
                        </div>
                        <div className="h-[1px] bg-slate-200 w-full"></div>
                        <div className="grid grid-cols-2 gap-4">
                          <DetailItem label="Current CTC" value={selectedApp.applicant?.currentCTC ? `₹${selectedApp.applicant?.currentCTC}` : 'N/A'} />
                          <DetailItem label="Expected CTC" value={selectedApp.applicant?.expectedCTC ? `₹${selectedApp.applicant?.expectedCTC}` : 'N/A'} />
                        </div>
                      </div>
                    </section>
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="mt-12">
                  <h3 className="text-[11px] font-black text-orange-500 uppercase tracking-[0.2em] mb-4">Application Note</h3>
                  <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100/50">
                    <p className="text-slate-700 leading-relaxed text-sm italic font-medium">
                      "{selectedApp.coverLetter || "The candidate did not include a specific cover letter with this application."}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-slate-100 bg-white flex justify-end">
                <a 
                  href={selectedApp.resume} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full md:w-auto bg-orange-500 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-orange-200 hover:bg-orange-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Download CV / Resume
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Polished Sub-component
const DetailItem = ({ label, value, isEmail }) => (
  <div className="group">
    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1.5 transition-colors group-hover:text-orange-400">{label}</p>
    <p className={`text-sm font-bold ${isEmail ? 'text-slate-600 break-all' : 'text-slate-900'}`}>
      {value || <span className="text-slate-300 font-normal italic">Not specified</span>}
    </p>
  </div>
);

export default Careerapplications;