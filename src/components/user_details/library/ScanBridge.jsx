import PageHeader, { SearchInput } from "../../ui/PageHeader";
import React, { useEffect, useMemo, useState } from "react";
import { CustomerService } from "../../../backend/ApiService";
import { Mail, Phone, Box, CheckCircle2, Library, RefreshCw, Building2, Clock, Truck } from "lucide-react";
import Pagination from "../../ui/Pagination";
import InitialsAvatar from "../../ui/InitialsAvatar";
import Swal from "sweetalert2";

/**
 * ScanBridge requests: one row per request with a "Mark delivered" action. Pending / delivered
 * tabs on top. Table-style rows from `lg` up, cards below; never scrolls sideways.
 */

const ROW_GRID = "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1fr)_150px]";

const isDeliveredValue = (value) => value === true || value === "true" || value === 1;

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "delivered", label: "Delivered" },
];

const ScanbridgeLibrary = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const itemsPerPage = 10;

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await CustomerService.getScanbridgeLibrary();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching scanbridge data:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handlePatch = async (customerId, logId) => {
    const result = await Swal.fire({
      title: "Mark as delivered?",
      text: "The request will move to Delivered.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Mark delivered",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    setUpdatingId(logId);
    try {
      await CustomerService.updateScanbridgeStatus({ customerId, logId, isdelivered: true });
      setCustomers((prev) => prev.map((item) => (item.logId === logId ? { ...item, isdelivered: true } : item)));
      Swal.fire({ title: "Delivered", text: "Status updated.", icon: "success", timer: 1400, showConfirmButton: false });
      fetchCustomers();
    } catch {
      Swal.fire({ title: "Update failed", text: "The server could not update the status.", icon: "error" });
    } finally {
      setUpdatingId(null);
    }
  };

  const counts = useMemo(() => {
    const delivered = customers.filter((item) => isDeliveredValue(item.isdelivered)).length;
    return { all: customers.length, delivered, pending: customers.length - delivered };
  }, [customers]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return customers.filter((item) => {
      const delivered = isDeliveredValue(item.isdelivered);
      if (tab === "pending" && delivered) return false;
      if (tab === "delivered" && !delivered) return false;
      if (!term) return true;
      return [item?.email, item?.firstName, item?.lastName, item?.companyName, item?.brandName, item?.mobileNumber].some(
        (value) => value && String(value).toLowerCase().includes(term)
      );
    });
  }, [customers, searchTerm, tab]);

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);

  const changeTab = (next) => {
    setTab(next);
    setCurrentPage(1);
  };

  return (
    <div className="min-w-0 text-slate-800">
      <PageHeader
        icon={Library}
        title="ScanBridge Requests"
        description="Track ScanBridge orders and update their fulfilment status."
        badge={counts.pending ? `${counts.pending} pending` : undefined}
        actions={
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search name, email, company…"
          />
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((item) => {
          const isActive = tab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => changeTab(item.key)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
                isActive ? "bg-slate-900 text-white shadow-sm" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {item.label}
              <span className={`rounded-full px-1.5 text-[11px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                {counts[item.key]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {loading && customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <RefreshCw className="animate-spin text-brand-500" size={26} />
            <span className="text-xs font-semibold text-slate-500">Loading ScanBridge requests…</span>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
              <Library size={22} />
            </span>
            <p className="text-sm font-bold text-slate-700">
              {searchTerm ? "No requests match your search" : tab === "pending" ? "No pending requests" : tab === "delivered" ? "Nothing delivered yet" : "No ScanBridge requests yet"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {searchTerm ? "Try a different name, email or company." : "New requests from the website will show up here."}
            </p>
          </div>
        ) : (
          <>
            <div className={`hidden gap-x-4 border-b border-slate-100 bg-slate-50/70 px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:grid ${ROW_GRID}`}>
              <span>Customer</span>
              <span>Email &amp; phone</span>
              <span>Request</span>
              <span className="text-right">Status</span>
            </div>

            <ul className="divide-y divide-slate-100">
              {currentItems.map((item) => {
                const isDelivered = isDeliveredValue(item.isdelivered);
                const name = `${item.firstName || ""} ${item.lastName || ""}`.trim() || "Unnamed customer";

                const nameBlock = (
                  <div className="flex min-w-0 items-center gap-3">
                    <InitialsAvatar name={name} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold capitalize text-slate-800" title={name}>
                        {name.toLowerCase()}
                      </p>
                      <p className="flex min-w-0 items-center gap-1 text-xs font-medium text-brand-600">
                        <Building2 size={12} className="shrink-0" />
                        <span className="truncate">{item.companyName || "No company"}</span>
                      </p>
                    </div>
                  </div>
                );

                const request = (
                  <div className="min-w-0">
                    <span
                      className={`inline-flex max-w-full items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                        isDelivered ? "bg-emerald-50 text-emerald-700" : "bg-brand-50 text-brand-700"
                      }`}
                    >
                      <Box size={11} className="shrink-0" />
                      <span className="truncate">{item.category || "ScanBridge"}</span>
                    </span>
                    <p className="mt-1 truncate text-xs text-slate-500">Brand: {item.brandName || "N/A"}</p>
                  </div>
                );

                const action = isDelivered ? (
                  <span className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-xl bg-emerald-50 px-3 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 size={14} /> Delivered
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={updatingId === item.logId}
                    onClick={() => handlePatch(item.customerId, item.logId)}
                    className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-brand-500 px-3.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 disabled:opacity-60"
                  >
                    {updatingId === item.logId ? <RefreshCw size={13} className="animate-spin" /> : <Truck size={14} />}
                    Mark delivered
                  </button>
                );

                return (
                  <li key={item.logId} className="transition-colors hover:bg-slate-50/60">
                    {/* Phone / tablet: card */}
                    <div className="space-y-3 px-4 py-4 sm:px-5 lg:hidden">
                      <div className="flex items-start justify-between gap-3">
                        {nameBlock}
                        {!isDelivered && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                            <Clock size={11} /> Pending
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-600">
                        <p className="flex min-w-0 items-center gap-1.5">
                          <Mail size={13} className="shrink-0 text-slate-400" />
                          <span className="min-w-0 break-all">{item.email || "N/A"}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Phone size={13} className="shrink-0 text-slate-400" />
                          {item.mobileNumber || "N/A"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                        {request}
                        {action}
                      </div>
                    </div>

                    {/* Desktop: table-style row */}
                    <div className={`hidden items-center gap-x-4 px-6 py-3.5 lg:grid ${ROW_GRID}`}>
                      {nameBlock}
                      <div className="min-w-0 space-y-1 text-xs text-slate-600">
                        <p className="flex min-w-0 items-center gap-1.5">
                          <Mail size={13} className="shrink-0 text-slate-400" />
                          <span className="truncate" title={item.email}>
                            {item.email || "N/A"}
                          </span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Phone size={13} className="shrink-0 text-slate-400" />
                          {item.mobileNumber || "N/A"}
                        </p>
                      </div>
                      {request}
                      <div className="flex justify-end">{action}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {filtered.length > itemsPerPage && (
          <div className="border-t border-slate-100 bg-white px-4">
            <Pagination totalItems={filtered.length} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanbridgeLibrary;
