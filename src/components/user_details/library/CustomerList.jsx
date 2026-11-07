import PageHeader, { SearchInput } from "../../ui/PageHeader";
import React, { useState, useEffect } from "react";
import { CustomerService } from "../../../backend/ApiService";
import CustomerRow from "./CustomerRow";
import CustomerLogsModal from "./CustomerLogsModal";
import Pagination from "../../ui/Pagination";
import { Users, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";

/**
 * Library contacts: people who downloaded brand library files. Table-style rows from `lg` up,
 * cards below that; never scrolls sideways.
 */
const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUserLogs, setSelectedUserLogs] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const itemsPerPage = 10;

  const fetchCustomers = async (page = currentPage) => {
    try {
      setLoading(true);
      const responseData = await CustomerService.getAllCustomers(page, itemsPerPage);
      if (responseData?.success && responseData?.data) {
        setCustomers(responseData.data.users || []);
        setTotalRecords(responseData.data.pagination?.totalUsers || 0);
      } else {
        setCustomers([]);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setCustomers([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this contact?",
      text: "The contact and its download history will be removed. This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });
    if (!result.isConfirmed) return;

    try {
      const response = await CustomerService.deleteCustomer(id);
      if (response.success) {
        Swal.fire({ title: "Deleted", text: "The contact has been removed.", icon: "success", timer: 1600, showConfirmButton: false });
        fetchCustomers();
      } else {
        Swal.fire({ title: "Could not delete", text: response.message || "Please try again.", icon: "error" });
      }
    } catch (err) {
      console.error("Failed to process delete operation:", err);
      Swal.fire({ title: "Could not delete", text: "An error occurred while connecting to the server.", icon: "error" });
    }
  };

  // Search filters the current page (the API paginates and has no search parameter).
  const term = searchTerm.trim().toLowerCase();
  const filteredCustomers = term
    ? customers.filter((customer) =>
        [customer?.email, customer?.firstName, customer?.lastName, customer?.companyName, customer?.mobileNumber].some(
          (value) => value && String(value).toLowerCase().includes(term)
        )
      )
    : customers;

  return (
    <div className="min-w-0 text-slate-800">
      {selectedUserLogs && <CustomerLogsModal logs={selectedUserLogs} onClose={() => setSelectedUserLogs(null)} />}

      <PageHeader
        icon={Users}
        title="Library Contacts"
        description="Customers who downloaded brand library files, with their activity."
        badge={totalRecords ? `${totalRecords} contacts` : undefined}
        actions={<SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search name, email, company…" />}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {loading && customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14">
            <RefreshCw size={26} className="animate-spin text-brand-500" />
            <span className="text-xs font-semibold text-slate-500">Loading contacts…</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
              <Users size={22} />
            </span>
            <p className="text-sm font-bold text-slate-700">{term ? "No contacts match your search" : "No library contacts yet"}</p>
            <p className="mt-1 text-xs text-slate-400">
              {term ? "Search looks at the contacts on this page." : "Contacts appear here after someone downloads a library file."}
            </p>
          </div>
        ) : (
          <div className={loading ? "pointer-events-none opacity-60 transition-opacity" : "transition-opacity"}>
            <div className="hidden grid-cols-12 gap-x-4 border-b border-slate-100 bg-slate-50/70 px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:grid">
              <span className="col-span-4">Contact</span>
              <span className="col-span-4">Email &amp; phone</span>
              <span className="col-span-3">Downloads</span>
              <span className="col-span-1 text-right">Delete</span>
            </div>
            <ul className="divide-y divide-slate-100">
              {filteredCustomers.map((user) => (
                <CustomerRow key={user._id} user={user} onDelete={handleDelete} onViewLogs={setSelectedUserLogs} />
              ))}
            </ul>
          </div>
        )}

        {totalRecords > itemsPerPage && (
          <div className="border-t border-slate-100 bg-white px-4">
            <Pagination totalItems={totalRecords} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;