import { useEffect, useState } from "react";
import { HiOutlineMail, HiOutlinePhone, HiOutlineCalendar, HiOutlineTrash } from "react-icons/hi";
import { ContactService } from "../../backend/ApiService";
import Pagination from "../ui/Pagination";
import Loader from "../ui/Loader";
import PageShell from "../ui/PageShell";

export default function InquiryPage() {
  const [inquiries, setInquiries] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchInquiries = async (page = 1) => {
    setLoading(true);
    try {
      const { contacts, pagination: pgData } = await ContactService.getAllInquiries(page);
      setInquiries(contacts || []);
      setPagination(pgData || {});
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      // Small timeout to ensure the loader feels smooth
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchInquiries(currentPage);
  }, [currentPage]);

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
        <div className="rounded-2xl border border-orange-100 bg-white px-4 py-2.5 shadow-sm sm:px-6 sm:py-3">
          <span className="mr-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
            Total:
          </span>
          <span className="text-xl font-black text-[#E68736]">
            {pagination.totalContacts || 0}
          </span>
        </div>
      }
      contentClassName="w-full"
    >
      <div className="w-full min-w-0">
        <div className="min-h-[400px] overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-sm sm:rounded-[24px]">
          {loading ? (
            /* 2. Apply your Loader component */
            <Loader 
              variant="section" 
              color="orange-500" 
              text="Syncing Inquiries..." 
            />
          ) : (
            <>
              <div className="overflow-x-auto px-3 py-4 sm:px-6 sm:py-6 md:px-10">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="bg-[#E68736]">
                      <th className="text-left text-white text-[10px] font-black uppercase tracking-wider p-4 rounded-l-xl">Customer</th>
                      <th className="text-left text-white text-[10px] font-black uppercase tracking-wider p-4">Contact Info</th>
                      <th className="text-left text-white text-[10px] font-black uppercase tracking-wider p-4">Message</th>
                      <th className="text-left text-white text-[10px] font-black uppercase tracking-wider p-4">Date</th>
                      <th className="text-center text-white text-[10px] font-black uppercase tracking-wider p-4 rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.length > 0 ? (
                      inquiries.map((item) => (
                        <tr key={item._id} className="group hover:bg-orange-50/50 transition-all">
                          <td className="p-4 bg-white border-y border-l border-orange-50 rounded-l-xl group-hover:border-orange-200">
                            <div className="font-bold text-slate-700 capitalize">
                              {item.firstName} {item.lastName}
                            </div>
                          </td>
                          <td className="p-4 bg-white border-y border-orange-50 group-hover:border-orange-200">
                            <div className="flex items-center gap-2 text-xs font-semibold text-orange-600">
                              <HiOutlineMail /> {item.email}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                              <HiOutlinePhone /> {item.phone}
                            </div>
                          </td>
                          <td className="p-4 bg-white border-y border-orange-50 group-hover:border-orange-200">
                            <p className="text-xs text-slate-600 line-clamp-2 max-w-xs leading-relaxed">
                              {item.message}
                            </p>
                          </td>
                          <td className="p-4 bg-white border-y border-orange-50 group-hover:border-orange-200">
                            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                              <HiOutlineCalendar className="text-orange-400" />
                              {new Date(item.createdAt).toLocaleDateString('en-GB', {
                                 day: '2-digit', month: 'short', year: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="p-4 bg-white border-y border-r border-orange-50 rounded-r-xl text-center group-hover:border-orange-200">
                            <button className="p-2.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all cursor-pointer">
                              <HiOutlineTrash size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-20 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                          No New Inquiries Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* 3. Integrated Pagination */}
              <Pagination 
                totalItems={pagination.totalContacts || 0}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}