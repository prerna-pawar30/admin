import { useEffect, useState } from "react";
import { HiOutlineMail, HiOutlinePhone, HiOutlineCalendar, HiOutlineTrash, HiOutlineUser } from "react-icons/hi";
import { ContactService } from "../../backend/ApiService";
import Pagination from "../ui/Pagination";
import Loader from "../ui/Loader";
import PageShell from "../ui/PageShell";

export default function InquiryPage() {
  const [inquiries, setInquiries] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Matches your API limit

const fetchInquiries = async (page = 1) => {
    setLoading(true);
    try {
      // 'res' is already { contacts: [...], pagination: {...} }
      const res = await ContactService.getAllInquiries(page);
      
      // Update this part to access res directly, not res.data
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
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <PageShell
      title={
        <span>
          <span className="text-[#E68736]">Customer </span>
          <span className="text-gray-900">Inquiries</span>
        </span>
      }
      description="Manage and respond to customer messages"
      actions={
        <div className="rounded-2xl border border-orange-100 bg-white px-4 py-2 shadow-sm">
          <span className="mr-2 text-[10px] font-black uppercase tracking-wider text-slate-400">Total:</span>
          <span className="text-xl font-black text-[#E68736]">{pagination.totalContacts || 0}</span>
        </div>
      }
    >
      <div className="w-full">
        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center bg-white rounded-3xl border border-orange-100">
            <Loader variant="section" color="orange-500" text="Syncing Inquiries..." />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Desktop Table View (Hidden on Mobile) */}
            <div className="hidden lg:block overflow-hidden rounded-[24px] border border-orange-200 bg-white shadow-sm">
              <div className="overflow-x-auto px-6 py-6">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="bg-[#E68736]">
                      <th className="text-left text-white text-[10px] font-black uppercase tracking-wider p-4 rounded-l-xl">Customer</th>
                      <th className="text-left text-white text-[10px] font-black uppercase tracking-wider p-4">Contact Info</th>
                      <th className="text-left text-white text-[10px] font-black uppercase tracking-wider p-4">Message</th>
                      <th className="text-left text-white text-[10px] font-black uppercase tracking-wider p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.length > 0 ? (
                      inquiries.map((item) => (
                        <tr key={item._id} className="group hover:bg-orange-50/30 transition-all">
                          <td className="p-4 bg-white border-y border-l border-orange-50 rounded-l-xl group-hover:border-orange-200">
                            <div className="font-bold text-slate-700 capitalize flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                <HiOutlineUser />
                              </div>
                              {item.firstName} {item.lastName}
                            </div>
                          </td>
                          <td className="p-4 bg-white border-y border-orange-50 group-hover:border-orange-200">
                            <div className="text-xs font-semibold text-orange-600 flex items-center gap-2">
                              <HiOutlineMail className="flex-shrink-0" /> {item.email}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                              <HiOutlinePhone className="flex-shrink-0" /> {item.phone}
                            </div>
                          </td>
                          <td className="p-4 bg-white border-y border-orange-50 group-hover:border-orange-200">
                            <p className="text-xs text-slate-600 line-clamp-2 max-w-xs leading-relaxed">{item.message}</p>
                          </td>
                          <td className="p-4 bg-white border-y border-orange-50 group-hover:border-orange-200">
                            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                              <HiOutlineCalendar className="text-orange-400" />
                              {formatDate(item.createdAt)}
                            </div>
                          </td>
                         
                        </tr>
                      ))
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile/Tablet Card View (Hidden on Desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
              {inquiries.map((item) => (
                <div key={item._id} className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 font-bold">
                        {item.firstName[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 capitalize">{item.firstName} {item.lastName}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                    <button className="text-red-400 p-2"><HiOutlineTrash size={20}/></button>
                  </div>
                  <div className="space-y-2 border-t border-slate-50 pt-3">
                    <div className="flex items-center gap-2 text-xs text-orange-600"><HiOutlineMail /> {item.email}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500"><HiOutlinePhone /> {item.phone}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600 italic">
                    "{item.message}"
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {!loading && inquiries.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No New Inquiries Found</p>
              </div>
            )}

            {/* Pagination Integration */}
            <div className="mt-6 flex justify-center">
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