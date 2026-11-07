import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";

/**
 * Compact "Recent Users" widget for the dashboard home page.
 *
 * Props:
 *  - users:     raw user array from UserService.getAllUsers()
 *  - loading:   boolean
 *  - limit:     how many recent users to show (default 5)
 *  - viewAllTo: route of the full Customers page
 */

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
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "?";

const joinedLabel = (dateString) => {
  if (!dateString) return { top: "—", bottom: "" };
  const d = new Date(dateString);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return { top: "Today", bottom: "" };
  if (days === 1) return { top: "Yesterday", bottom: "" };
  if (days < 7) return { top: `${days} days`, bottom: "ago" };
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return {
    top: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    bottom: sameYear ? "" : String(d.getFullYear()),
  };
};

const toCustomer = (user) => ({
  id: user._id,
  name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Anonymous user",
  email: user.email || "—",
  institute: user.instituteName,
  avatar: user.avatar || user.image || "",
  isActive: user.isActive !== undefined ? user.isActive : true,
  createdAt: user.createdAt,
});

const Avatar = ({ name, src }) => {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return <img src={src} alt="" onError={() => setFailed(true)} className="h-10 w-10 shrink-0 rounded-xl object-cover" />;
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

export default function RecentUsers({ users = [], loading = false, limit = 5, viewAllTo = "/customers" }) {
  const customers = useMemo(() => users.map(toCustomer), [users]);

  const recent = useMemo(
    () => [...customers].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, limit),
    [customers, limit]
  );

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = customers.filter((c) => {
      if (!c.createdAt) return false;
      const d = new Date(c.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const active = customers.filter((c) => c.isActive).length;
    return {
      total: customers.length,
      thisMonth,
      active,
      activePct: customers.length ? Math.round((active / customers.length) * 100) : 0,
    };
  }, [customers]);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Recent Users</h3>
          <p className="mt-0.5 text-xs text-slate-400">Latest sign-ups on the website</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
          <Users size={17} />
        </span>
      </div>

      {/* Summary: one segmented strip, labels never truncate */}
      <div className="mx-5 mt-4 rounded-xl border border-slate-100 bg-slate-50/60 sm:mx-6">
        <div className="grid grid-cols-3 divide-x divide-slate-200/70">
          {[
            { label: "Total", value: stats.total },
            { label: "This month", value: stats.thisMonth },
            { label: "Active", value: stats.active },
          ].map((s) => (
            <div key={s.label} className="px-3 py-3 text-center">
              {loading ? (
                <div className="mx-auto h-6 w-8 animate-pulse rounded bg-slate-200/70" />
              ) : (
                <p className="text-xl font-bold leading-none text-slate-900 tabular-nums">{s.value}</p>
              )}
              <p className="mt-1.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Active-rate bar */}
        <div className="border-t border-slate-200/70 px-4 py-2.5">
          <div className="mb-1.5 flex items-center justify-between text-[11px]">
            <span className="font-medium text-slate-500">Active rate</span>
            <span className="font-bold text-emerald-600 tabular-nums">{loading ? "—" : `${stats.activePct}%`}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/70">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: loading ? "0%" : `${stats.activePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 px-5 pt-4 sm:px-6">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Newest first</p>

        {loading ? (
          <ul>
            {Array.from({ length: limit }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
                  <div className="h-2.5 w-40 animate-pulse rounded bg-slate-100" />
                </div>
                <div className="h-3 w-10 animate-pulse rounded bg-slate-100" />
              </li>
            ))}
          </ul>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm font-semibold text-slate-700">No users yet</p>
            <p className="mt-0.5 text-xs text-slate-400">New sign-ups will show up here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((c) => {
              const joined = joinedLabel(c.createdAt);
              return (
                <li key={c.id} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-slate-50">
                  <Avatar name={c.name} src={c.avatar} />

                  <div className="min-w-0 flex-1">
                    <p className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate text-sm font-semibold capitalize text-slate-800" title={c.name}>
                        {c.name.toLowerCase()}
                      </span>
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.isActive ? "bg-emerald-500" : "bg-rose-400"}`}
                        title={c.isActive ? "Active" : "Suspended"}
                      />
                    </p>
                    <p className="truncate text-xs text-slate-500" title={c.email}>
                      {c.email}
                    </p>
                    {c.institute && (
                      <p className="truncate text-[11px] font-medium text-slate-400" title={c.institute}>
                        {c.institute}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-right leading-tight">
                    <p className="text-xs font-semibold text-slate-600">{joined.top}</p>
                    {joined.bottom && <p className="text-[11px] text-slate-400">{joined.bottom}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 border-t border-slate-100 px-5 py-3 sm:px-6">
        <Link
          to={viewAllTo}
          className="group flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-50"
        >
          View all customers
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}