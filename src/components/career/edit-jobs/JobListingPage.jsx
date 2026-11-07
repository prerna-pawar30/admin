/* eslint-disable no-unused-vars */
import PageHeader from "../../ui/PageHeader";
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CareerService } from '../../../backend/ApiService';
import {
  Trash2,
  Users,
  MapPin,
  Briefcase,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import Swal from 'sweetalert2';
import JobEditorModal from './JobEditorModal';

const JobListingPage = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedJob, setSelectedJob] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const limit = 12;

  const primaryColor = "#E68736";

  useEffect(() => {
    fetchJobs();
  }, [currentPage]);

  const fetchJobs = async () => {
    setLoading(true);

    try {
      const response = await CareerService.getAllJobs(
        currentPage,
        limit
      );

      if (response.success) {
        setJobs(response.data.jobs || []);

        setTotalPages(
          response.data.pagination?.totalPages || 1
        );

        setTotalItems(
          response.data.pagination?.totalItems || 0
        );
      }
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
    });

    if (confirm.isConfirmed) {
      try {
        Swal.fire({
          title: 'Deleting...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const res = await CareerService.deleteJob(id);

        if (res.success) {
          await Swal.fire({
            title: 'Deleted!',
            text: `The ${title} listing has been removed.`,
            icon: 'success',
            confirmButtonColor: primaryColor,
          });

          fetchJobs();
        } else {
          throw new Error(res.message || "Failed to delete");
        }
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text:
            error.message ||
            'An unexpected error occurred while deleting.',
          icon: 'error',
          confirmButtonColor: primaryColor,
        });
      }
    }
  };

  const handleSaveUpdate = async () => {
    try {
      const targetId = selectedJob.jobId;

      const dataToSend = { ...editData };

      const fieldsToRemove = [
        '_id',
        'jobId',
        'slug',
        'createdBy',
        'updatedBy',
        'createdAt',
        'updatedAt',
        '__v'
      ];

      fieldsToRemove.forEach(field => delete dataToSend[field]);

      if (dataToSend.description) {
        dataToSend.description = dataToSend.description.map(
          desc => ({
            text: desc.text
          })
        );
      }

      const res = await CareerService.updateJob(
        targetId,
        dataToSend
      );

      if (res.success) {
        setIsEditing(false);
        setSelectedJob(null);

        fetchJobs();

        Swal.fire({
          title: 'Updated!',
          text: 'Job saved successfully.',
          icon: 'success',
          confirmButtonColor: primaryColor,
        });
      }
    } catch (error) {
      Swal.fire(
        "Update Failed",
        "Check validation details",
        "error"
      );
    }
  };

  if (loading)
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-[#E68736]"></div>

        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-4">
          Syncing Career Portal
        </p>
      </div>
    );

  return (
    <div>
      <div>

        {isEditing && (
          <JobEditorModal
            editData={editData}
            setEditData={setEditData}
            onSave={handleSaveUpdate}
            onClose={() => setIsEditing(false)}
            primaryColor={primaryColor}
          />
        )}

        <PageHeader
          icon={Briefcase}
          title="Job Listings"
          badge={`${totalItems} positions`}
          description="Manage open roles and review applications."
        />

        {/* JOB LIST */}
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.jobId}
              className="group bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 hover:border-[#E68736]/60 hover:shadow-md transition-all"
            >
              <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">

                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-2.5">
                    <span className="px-2 py-0.5 bg-orange-50 border border-orange-100 text-[#E68736] text-[11px] font-bold uppercase rounded-md">
                      {job.employmentType?.replace('_', ' ')}
                    </span>

                    <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 text-[11px] font-bold uppercase rounded-md">
                      {job.workplaceType}
                    </span>
                  </div>

                  <h3 className="font-semibold text-base sm:text-lg text-slate-900">
                    {job.title}
                  </h3>

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">

                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Briefcase size={14} />
                      <span className="text-xs font-semibold uppercase">
                        {job.department}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin size={14} />
                      <span className="text-xs font-semibold uppercase">
                        {job.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-wrap items-center gap-3">

                  <button
                    onClick={() =>
                      navigate(`/catalog/career/jobs/${job.jobId}`)
                    }
                    className="flex items-center gap-2 border border-slate-200 bg-white text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold uppercase"
                  >
                    <Users size={15} />
                    Applications
                  </button>

                  <button
                    onClick={() => handleViewJob(job.jobId)}
                    className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold uppercase hover:border-[#E68736] hover:text-[#E68736]"
                  >
                    Edit Post
                  </button>

                  <button
                    onClick={() =>
                      handleDeleteJob(job.jobId, job.title)
                    }
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY */}
        {jobs.length === 0 && (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200/80 mt-6">
            <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">
              No active vacancies posted yet
            </p>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">

            <button
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage(prev => prev - 1);
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Prev
            </button>

            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;

              return (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page);

                    window.scrollTo({
                      top: 0,
                      behavior: 'smooth'
                    });
                  }}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                    currentPage === page
                      ? 'bg-[#E68736] text-white'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage(prev => prev + 1);

                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white disabled:opacity-50"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListingPage;