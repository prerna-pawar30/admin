/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CareerService } from '../../../backend/ApiService';
import { ChevronRight, Trash2, Users, MapPin, Briefcase } from 'lucide-react';
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
    // 1. Initial Confirmation Alert
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete the "${title}" position. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', // Red for danger
      cancelButtonColor: '#94a3b8', // Gray for cancel
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      // Custom styling to match your 3xl rounded corners
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl px-6 py-2 uppercase text-[10px] font-black tracking-widest',
        cancelButton: 'rounded-xl px-6 py-2 uppercase text-[10px] font-black tracking-widest'
      }
    });

    if (confirm.isConfirmed) {
      try {
        // Optional: Show a "Deleting..." loading state
        Swal.fire({
          title: 'Deleting...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const res = await CareerService.deleteJob(id);

        if (res.success) {
          // 2. Success Alert
          await Swal.fire({
            title: 'Deleted!',
            text: `The ${title} listing has been removed.`,
            icon: 'success',
            confirmButtonColor: primaryColor,
            customClass: {
              popup: 'rounded-3xl'
            }
          });
          
          // Refresh the list
          fetchJobs();
        } else {
          throw new Error(res.message || "Failed to delete");
        }
      } catch (error) {
        // 3. Error Alert
        Swal.fire({
          title: 'Error',
          text: error.message || 'An unexpected error occurred while deleting.',
          icon: 'error',
          confirmButtonColor: primaryColor,
          customClass: {
            popup: 'rounded-3xl'
          }
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
        Swal.fire({ title: 'Updated!', text: 'Job saved successfully.', icon: 'success', confirmButtonColor: primaryColor });
      }
    } catch (error) {
      Swal.fire("Update Failed", "Check validation details", "error");
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mb-4" style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}></div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Syncing Career Portal</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 md:p-12 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {isEditing && (
          <JobEditorModal 
            editData={editData} 
            setEditData={setEditData} 
            onSave={handleSaveUpdate} 
            onClose={() => setIsEditing(false)}
            primaryColor={primaryColor}
          />
        )}

        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active <span className="text-[#E68736]">Job Postings</span></h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Manage your company listings and review applicant flow.</p>
          </div>
          <div className="px-4 py-2 bg-orange-50 rounded-lg border border-orange-100">
             <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Total Positions: {jobs.length}</span>
          </div>
        </header>

        <div className="grid gap-6">
          {jobs.map((job) => (
            <div key={job.jobId} className="group relative bg-white rounded-3xl border border-slate-200 p-1 transition-all hover:border-[#E68736] hover:shadow-xl hover:shadow-orange-500/5">
              <div className="p-6 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                
                {/* Job Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-orange-100 text-[#E68736] text-[9px] font-black uppercase rounded tracking-wider">
                      {job.jobType || 'Full Time'}
                    </span>
                    <span className="text-slate-300 text-xs">•</span>
                    <span className="text-slate-400 text-xs font-mono">{job.jobId}</span>
                  </div>
                  <h3 className="font-extrabold text-2xl text-slate-800 tracking-tight group-hover:text-[#E68736] transition-colors uppercase">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Briefcase size={14} className="text-slate-400" />
                      <span className="text-xs font-bold uppercase tracking-tight">{job.department}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin size={14} className="text-slate-400" />
                      <span className="text-xs font-bold uppercase tracking-tight">{job.location}</span>
                    </div>
                  </div>
                </div>

                {/* Interaction Section */}
                <div className="flex flex-wrap items-center gap-3 lg:border-l lg:pl-8 border-slate-100">
                  
                  {/* VIEW APPLICATIONS - DESIGNED AS A CALL TO ACTION */}
                  <button 
                    onClick={() => navigate(`/catalog/career/jobs/${job.jobId}`)}
                    className="flex flex-col items-center justify-center  border border-slate-200 px-6 py-2 rounded-2xl hover:bg-[#E68736] hover:border-[#E68736] hover:text-white transition-all group/btn min-w-[140px]"
                  >
                    <Users size={18} className="mb-1 text-[#E68736] group-hover/btn:text-white transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Applications</span>
                  </button>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewJob(job.jobId)} 
                      className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-[#E68736] hover:text-[#E68736] transition-all flex items-center gap-2"
                    >
                      Edit Post
                    </button>

                    <button 
                      onClick={() => handleDeleteJob(job.jobId, job.title)}
                      className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                      title="Delete Listing"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                </div>
              </div>
            </div>
          ))}

          {jobs.length === 0 && (
            <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase size={24} className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No jobs posted yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListingPage;