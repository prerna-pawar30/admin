import PageHeader, { SearchInput } from "../ui/PageHeader";
import { useEffect, useMemo, useState } from "react";
import { UserService } from "../../backend/ApiService";
import Pagination from "../ui/Pagination";
import { Calendar, Mail, RefreshCw, CheckCircle2, XCircle, Users, Building2 } from "lucide-react";

/**
 * Customers: registered website users. Wide screens show table-style rows; below `lg` each
 * customer is a card. No horizontal scrolling at any width.
 */

// Same columns for the header and every row.
const ROW_GRID = "lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.6fr)_88px_112px_112px_104px]";

const AVATAR_COLORS = ["#e68736", "#0ea5e9", "#8b5cf6", "#10b981", "#f43f5e", "#f59e0b", "#6366f1", "#14b8a6"];

const colorFor = (text = "") => {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
};

/** Normalises the different user shapes the API returns. */
const toCustomer = (user) => {
  const name = user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Anonymous user";
  return {
    id: user._id,
    name,
    email: user.email || "—",
    institute: user.instituteName,
    avatar: user.avatar || user.image || "",
    provider: user.provider || (user.providerId ? "google" : "manual"),
    isActive: user.isActive !== undefined ? user.isActive : true,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const Avatar = ({ name, src }) => {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return <img src={src} alt="" onError={() => setFailed(true)} className="h-10 w-10 shrink-0 rounded-xl bg-slate-50 object-cover ring-1 ring-slate-200" />;
  }
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
      style={{ background: colorFor(name) }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
};

const StatusBadge = ({ isActive }) =>
  isActive ? (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600">
      <CheckCircle2 size={11} className="shrink-0" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-rose-100 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-rose-500">
      <XCircle size={11} className="shrink-0" /> Suspended
    </span>
  );

const ProviderBadge = ({ provider }) => (
  <span className="inline-flex whitespace-nowrap rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">{provider}</span>
);

const NameBlock = ({ customer }) => (
  <div className="flex min-w-0 items-center gap-3">
    <Avatar name={customer.name} src={customer.avatar} />
    <div className="min-w-0">
      <p className="truncate text-sm font-bold capitalize text-slate-800" title={customer.name}>
        {customer.name.toLowerCase()}
      </p>
      <p className="truncate font-mono text-[11px] text-slate-400 select-all" title={customer.id}>
        {customer.id}
      </p>
    </div>
  </div>
);

const CustomerRow = ({ customer }) => (
  <li className="transition-colors hover:bg-slate-50/60">
    {/* Phone / tablet: card */}
    <div className="space-y-3 px-4 py-4 sm:px-5 lg:hidden">
      <div className="flex items-start justify-between gap-3">
        <NameBlock customer={customer} />
        <StatusBadge isActive={customer.isActive} />
      </div>
      <div className="space-y-1.5 text-xs">
        <p className="flex min-w-0 items-center gap-1.5 text-slate-700">
          <Mail size={13} className="shrink-0 text-slate-400" />
          <span className="min-w-0 break-all font-semibold">{customer.email}</span>
        </p>
        {customer.institute && (
          <p className="flex min-w-0 items-center gap-1.5 text-slate-500">
            <Building2 size={13} className="shrink-0 text-slate-400" />
            <span className="min-w-0 break-words font-medium">{customer.institute}</span>
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500">
        <ProviderBadge provider={customer.provider} />
        <span className="inline-flex items-center gap-1">
          <Calendar size={12} className="text-slate-400" /> Joined {formatDate(customer.createdAt)}
        </span>
        <span className="inline-flex items-center gap-1">
          <RefreshCw size={12} className="text-slate-400" /> Updated {formatDate(customer.updatedAt)}
        </span>
      </div>
    </div>

    {/* Desktop: table-style row */}
    <div className={`hidden items-center gap-x-4 px-6 py-3.5 lg:grid ${ROW_GRID}`}>
      <NameBlock customer={customer} />
      <div className="min-w-0">
        <p className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Mail size={13} className="shrink-0 text-slate-400" />
          <span className="truncate" title={customer.email}>
            {customer.email}
          </span>
        </p>
        {customer.institute && (
          <p className="mt-1 truncate pl-5 text-[11px] font-medium uppercase tracking-wider text-slate-400" title={customer.institute}>
            {customer.institute}
          </p>
        )}
      </div>
      <div>
        <ProviderBadge provider={customer.provider} />
      </div>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
        <Calendar size={13} className="shrink-0 text-slate-400" /> {formatDate(customer.createdAt)}
      </p>
      <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <RefreshCw size={12} className="shrink-0 text-slate-300" /> {formatDate(customer.updatedAt)}
      </p>
      <div className="flex justify-end">
        <StatusBadge isActive={customer.isActive} />
      </div>
    </div>
  </li>
);

export default function UserDetails() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await UserService.getAllUsers();
      if (response && response.success && response.data?.users) {
        setUsers(response.data.users);
      } else if (Array.isArray(response)) {
        setUsers(response);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const customers = useMemo(() => users.map(toCustomer), [users]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((customer) =>
      [customer.name, customer.email, customer.institute, customer.id].some((value) => value && String(value).toLowerCase().includes(term))
    );
  }, [customers, search]);

  const activeCount = useMemo(() => customers.filter((customer) => customer.isActive).length, [customers]);

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentCustomers = filtered.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);

  return (
    <div className="min-w-0 text-slate-900">
      <PageHeader
        icon={Users}
        title="Customers"
        description="Registered website customers and their account details."
        badge={loading ? undefined : `${customers.length} total · ${activeCount} active`}
        actions={
          <>
            <SearchInput
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search name, email or clinic..."
            />
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-sm text-slate-700 shadow-sm sm:w-auto"
              aria-label="Customers per page"
            >
              {[5, 10, 20, 50].map((val) => (
                <option key={val} value={val}>
                  {val} per page
                </option>
              ))}
            </select>
          </>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-brand-500" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Loading customers…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
              <Users size={22} />
            </span>
            <p className="text-sm font-bold text-slate-700">{search ? "No customers match your search" : "No customers yet"}</p>
            <p className="mt-1 text-xs text-slate-400">{search ? "Try a different name, email or clinic." : "Customers appear here once they sign up on the website."}</p>
          </div>
        ) : (
          <>
            <div
              className={`hidden gap-x-4 border-b border-slate-100 bg-slate-50/70 px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:grid ${ROW_GRID}`}
            >
              <span>Customer</span>
              <span>Contact</span>
              <span>Sign-in</span>
              <span>Joined</span>
              <span>Updated</span>
              <span className="text-right">Status</span>
            </div>
            <ul className="divide-y divide-slate-100">
              {currentCustomers.map((customer) => (
                <CustomerRow key={customer.id} customer={customer} />
              ))}
            </ul>
          </>
        )}

        {!loading && filtered.length > itemsPerPage && (
          <div className="border-t border-slate-100 bg-white px-4">
            <Pagination totalItems={filtered.length} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
          </div>
        )}
      </div>
    </div>
  );
}