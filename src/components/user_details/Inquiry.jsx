import { useEffect, useState } from "react";
import { HiOutlineMail, HiOutlinePhone, HiOutlineCalendar, HiOutlineUser } from "react-icons/hi";
import { ContactService } from "../../backend/ApiService";
import Pagination from "../ui/Pagination";
import Loader from "../ui/Loader";
import PageShell from "../ui/PageShell";

export default function InquiryPage() {
  const [inquiries, setInquiries] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const fetchInquiries = async (page = 1) => {
    setLoading(true);
    try {
      const res = await ContactService.getAllInquiries(page);
      setInquiries(res?.contacts || []);
      setPagination(res?.pagination || {});
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries(currentPage);
  }, [currentPage]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', 
      month: 'short', 
      year: 'numeric'
    });
  };

  return (
    <PageShell
      title={
        <span>
          <span className="text-[#E68736]">Customer </span>
          <span className="text-slate-900">Inquiries</span>
        </span>
      }
      description="Manage and respond to incoming customer messages"
      actions={
        <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-2 shadow-sm flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Inquiries:</span>
          <span className="text-lg font-black text-[#E68736]">{pagination.totalContacts || 0}</span>
        </div>
      }
    >
      <div className="w-full">
        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <Loader variant="section" color="orange-500" text="Syncing Inquiries..." />
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* DESKTOP VIEW (Table UI) */}
            <div className="hidden lg:block bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-[#E68736] text-white font-bold text-xs uppercase tracking-wider">
                      <th className="p-4 pl-6 w-1/4">Customer Profile</th>
                      <th className="p-4 w-1/4">Contact Info</th>
                      <th className="p-4 w-1/3">Message</th>
                      <th className="p-4 pr-6 text-center w-1/6">Received Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inquiries.length > 0 ? (
                      inquiries.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/60 transition-colors group">
                          {/* Profile */}
                          <td className="p-4 pl-6 align-middle">
                            <div className="font-bold text-slate-900 text-sm capitalize flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#E68736] font-semibold border border-orange-100/50 shrink-0">
                                <HiOutlineUser size={15} />
                              </div>
                              <span className="truncate">{item.firstName} {item.lastName}</span>
                            </div>
                          </td>
                          
                          {/* Contact Info */}
                          <td className="p-4 align-middle">
                            <div className="space-y-1 text-xs text-slate-500">
                              <div className="flex items-center gap-2 font-medium text-orange-600/90 hover:text-[#E68736] transition-colors">
                                <HiOutlineMail size={14} className="text-slate-400 shrink-0 group-hover:text-[#E68736]" /> 
                                <span className="truncate max-w-[200px]">{item.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <HiOutlinePhone size={14} className="text-slate-400 shrink-0" /> 
                                <span>{item.phone || 'N/A'}</span>
                              </div>
                            </div>
                          </td>
                          
                          {/* Message Body */}
                          <td className="p-4 align-middle">
                            <p className="text-xs text-slate-600 line-clamp-2 max-w-md leading-relaxed pr-4 font-normal">
                              {item.message}
                            </p>
                          </td>
                          
                          {/* Date */}
                          <td className="p-4 pr-6 align-middle text-center">
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                              <HiOutlineCalendar className="text-[#E68736]" size={13} />
                              <span>{formatDate(item.createdAt)}</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE & TABLET CARD VIEW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
              {inquiries.map((item) => (
                <div key={item._id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 hover:border-orange-200/80 transition-colors">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#E68736] font-bold border border-orange-100 shrink-0 uppercase">
                        {item.firstName ? item.firstName[0] : <HiOutlineUser />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 capitalize text-sm truncate">{item.firstName} {item.lastName}</h4>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold mt-0.5">
                          <HiOutlineCalendar size={12} className="text-[#E68736]" />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs">
                    <div className="flex items-center gap-2 text-orange-600/90 font-medium">
                      <HiOutlineMail className="text-slate-400 shrink-0" /> 
                      <span className="truncate">{item.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <HiOutlinePhone className="text-slate-400 shrink-0" /> 
                      <span>{item.phone || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs text-slate-600 leading-relaxed font-normal italic">
                    "{item.message}"
                  </div>
                </div>
              ))}
            </div>

            {/* EMPTY STATE */}
            {!loading && inquiries.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No New Inquiries Found</p>
              </div>
            )}

            {/* PAGINATION FOOTER */}
            <div className="pt-2 flex justify-center bg-transparent">
              <Pagination 
                totalItems={pagination.totalContacts || 0}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}