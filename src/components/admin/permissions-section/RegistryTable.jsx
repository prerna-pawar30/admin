import React, { useMemo, useState } from "react";
import { Shield, ChevronLeft, ChevronRight, Trash2, Search } from "lucide-react";

/**
 * All permission names, searchable, 10 per page. Each row shows the module (first part), the
 * full name and a colour-coded action (last part).
 */

const PAGE_SIZE = 10;

const ACTION_TONES = {
  create: "bg-emerald-50 text-emerald-700",
  read: "bg-sky-50 text-sky-700",
  update: "bg-amber-50 text-amber-700",
  delete: "bg-rose-50 text-rose-700",
  remove: "bg-rose-50 text-rose-700",
  revoke: "bg-rose-50 text-rose-700",
};

const splitName = (name = "") => {
  const parts = name.split(".");
  return { module: parts[0] || name, action: parts.length > 1 ? parts[parts.length - 1] : "" };
};

export default function RegistryTable({ permissions = [], loading, onDelete }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const list = Array.isArray(permissions) ? permissions : [];
    const term = search.trim().toLowerCase();
    return term ? list.filter((perm) => perm.name.toLowerCase().includes(term)) : list;
  }, [permissions, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Shield size={17} />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-800">Permission registry</h2>
            <p className="text-xs text-slate-500">{(permissions || []).length} permissions</p>
          </div>
        </div>
        <div className="relative w-full sm:w-60">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search permissions…"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 outline-none focus:border-brand-400"
          />
        </div>
      </header>

      {loading && !rows.length ? (
        <div className="space-y-2 p-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-9 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-slate-400">{search ? "No permissions match your search." : "No permissions yet. Create one on the left."}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map((perm) => {
            const { module, action } = splitName(perm.name);
            return (
              <li key={perm.permissionId || perm._id} className="group flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-slate-50/70">
                <span className="hidden w-24 shrink-0 truncate text-xs font-semibold capitalize text-slate-500 sm:block" title={module}>
                  {module}
                </span>
                <code className="min-w-0 flex-1 truncate font-mono text-xs text-slate-800" title={perm.name}>
                  {perm.name}
                </code>
                {action && (
                  <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${ACTION_TONES[action] || "bg-slate-100 text-slate-600"}`}>
                    {action}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onDelete(perm.permissionId)}
                  title="Delete permission"
                  aria-label={`Delete ${perm.name}`}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <footer className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-3">
          <span className="text-xs text-slate-500">
            {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setPage(safePage - 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 text-xs font-semibold text-slate-600">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </footer>
      )}
    </section>
  );
}