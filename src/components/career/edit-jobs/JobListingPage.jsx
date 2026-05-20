/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CareerService } from '../../../backend/ApiService';
import { Trash2, Users, MapPin, Briefcase, Plus, Eye } from 'lucide-react';
import Swal from 'sweetalert2';
import JobEditorModal from './JobEditorModal';

const JobListingPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const primaryColor = "#E68736";

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await CareerService.getAllJobs();
      if (response.success) setJobs(response.data.jobs || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewJob = async (id) => {
    try {
      const response = await CareerService.getJobById(id);
      if (response?.success && response.data) {
        setSelectedJob(response.data);
        setEditData(response.data);
        setIsEditing(true);
      }
    } catch (error) {
      Swal.fire("Error", "Could not fetch job details", "error");
    }
  };

  const handleDeleteJob = async (id, title) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete the "${title}" position. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl px-5 py-2.5 uppercase text-[10px] font-bold tracking-widest',
        cancelButton: 'rounded-xl px-5 py-2.5 uppercase text-[10px] font-bold tracking-widest'
      }
    });

    if (confirm.isConfirmed) {
      try {
        Swal.fire({
          title: 'Deleting...',
          allowOutsideClick: false,
          didOpen: () => { Swal.showLoading(); }
        });

        const res = await CareerService.deleteJob(id);

        if (res.success) {
          await Swal.fire({
            title: 'Deleted!',
            text: `The ${title} listing has been removed.`,
            icon: 'success',
            confirmButtonColor: primaryColor,
            customClass: { popup: 'rounded-2xl' }
          });
          fetchJobs();
        } else {
          throw new Error(res.message || "Failed to delete");
        }
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error.message || 'An unexpected error occurred while deleting.',
          icon: 'error',
          confirmButtonColor: primaryColor,
          customClass: { popup: 'rounded-2xl' }
        });
      }
    }
  };

  const handleSaveUpdate = async () => {
    try {
      const targetId = selectedJob.jobId;
      const dataToSend = { ...editData };
      const fieldsToRemove = ['_id', 'jobId', 'slug', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt', '__v'];
      
      fieldsToRemove.forEach(field => delete dataToSend[field]);
      if (dataToSend.description) {
        dataToSend.description = dataToSend.description.map(desc => ({ text: desc.text }));
      }

      const res = await CareerService.updateJob(targetId, dataToSend);

      if (res.success) {
        setIsEditing(false);
        setSelectedJob(null);
        fetchJobs();
        Swal.fire({ 
          title: 'Updated!', 
          text: 'Job saved successfully.', 
          icon: 'success', 
          confirmButtonColor: primaryColor,
          customClass: { popup: 'rounded-2xl' }
        });
      }
    } catch (error) {
      Swal.fire("Update Failed", "Check validation details", "error");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50">
      <div className="relative flex items-center justify-center mb-4">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-[#E68736]"></div>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Syncing Career Portal</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/30 p-4 sm:p-6 lg:p-10 text-slate-900 antialiased">
      <div className="max-w-5xl mx-auto">
        
        {isEditing && (
          <JobEditorModal 
            editData={editData} 
            setEditData={setEditData} 
            onSave={handleSaveUpdate} 
            onClose={() => setIsEditing(false)}
            primaryColor={primaryColor}
          />
        )}

        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Active <span className="text-[#E68736]">Job Postings</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">Manage corporate active career listings and overview metrics.</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-2 shadow-sm flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Positions:</span>
            <span className="text-lg font-black text-[#E68736]">{jobs.length}</span>
          </div>
        </header>

        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.jobId} className="group bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 transition-all duration-200 hover:border-[#E68736]/60 hover:shadow-md hover:shadow-orange-500/[0.02]">
              <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                
                {/* Job Metadata Portfolio */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-2.5">
                    <span className="px-2 py-0.5 bg-orange-50 border border-orange-100 text-[#E68736] text-[9px] font-bold uppercase rounded-md tracking-wider">
                      {job.employmentType ? job.employmentType.replace('_', ' ') : 'Full Time'}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 text-[9px] font-bold uppercase rounded-md tracking-wider">
                      {job.workplaceType || 'Onsite'}
                    </span>
                    <span className="text-slate-300 hidden sm:inline text-xs">•</span>
                    <span className="text-slate-400 text-[11px] font-mono tracking-tight hidden sm:inline">{job.jobId}</span>
                  </div>
                  
                  <h3 className="font-bold text-lg sm:text-xl text-slate-800 tracking-tight transition-colors group-hover:text-[#E68736] uppercase truncate">
                    {job.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Briefcase size={14} className="text-slate-400 shrink-0" />
                      <span className="text-xs font-semibold uppercase tracking-tight text-slate-600">{job.department}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      <span className="text-xs font-semibold uppercase tracking-tight text-slate-600">{job.location}</span>
                    </div>
                  </div>
                </div>

                {/* Control Interactive Grid Blocks */}
                <div className="flex flex-wrap items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 shrink-0">
                  
                  <button 
                    onClick={() => navigate(`/catalog/career/jobs/${job.jobId}`)}
                    className="flex items-center justify-center gap-2 border border-slate-200/80 bg-white text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all text-xs font-bold uppercase tracking-wider shrink-0 w-full sm:w-auto"
                  >
                    <Users size={15} className="text-slate-400" />
                    <span>Applications</span>
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button 
                      onClick={() => handleViewJob(job.jobId)} 
                      className="flex-1 sm:flex-initial bg-white border border-slate-200/80 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:border-[#E68736] hover:text-[#E68736] transition-all"
                    >
                      Edit Post
                    </button>

                    <button 
                      onClick={() => handleDeleteJob(job.jobId, job.title)}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 shrink-0"
                      title="Delete Listing"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                </div>
              </div>
            </div>
          ))}

          {jobs.length === 0 && (
            <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200/80 shadow-sm">
              <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 border border-slate-100">
                <Briefcase size={20} className="text-slate-400" />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active vacancies posted yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListingPage;