import React from "react";
import { Activity, ChevronLeft, ChevronRight, Plus, ShieldCheck, ShieldMinus, Trash2, Circle } from "lucide-react";

/**
 * Permission history: who created / granted / revoked / deleted what, newest first. Paginated by
 * the server (PermissionPage passes page + pagination).
 */

const ACTIONS = {
  create: { label: "created", icon: Plus, tone: "bg-brand-50 text-brand-600" },
  assign: { label: "granted", icon: ShieldCheck, tone: "bg-emerald-50 text-emerald-600" },
  revoke: { label: "revoked", icon: ShieldMinus, tone: "bg-rose-50 text-rose-600" },
  delete: { label: "deleted", icon: Trash2, tone: "bg-slate-100 text-slate-600" },
  delete_all: { label: "deleted all permissions", icon: Trash2, tone: "bg-rose-50 text-rose-600" },
};

const personName = (person, fallbackEmail) => {
  if (person) {
    const name = person.name || `${person.firstName || ""} ${person.lastName || ""}`.trim();
    return name || person.email;
  }
  return fallbackEmail || "System";
};

const when = (log) => {
  const value = log.timestamp || log.createdAt;
  if (!value) return { date: "", time: "" };
  const date = new Date(value);
  return {
    date: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    time: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
};

export default function AuditLogFeed({ logs = [], pagination = {}, page = 1, setPage }) {
  const totalPages = pagination?.totalPages || 1;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Activity size={17} />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-800">Activity log</h2>
            <p className="text-xs text-slate-500">{pagination?.totalItems ? `${pagination.totalItems} events` : "Every change to permissions"}</p>
          </div>
        </div>
        {totalPages > 1 && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              disabled={!pagination?.prevPage}
              onClick={() => setPage(page - 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-1.5 text-xs font-semibold text-slate-600">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={!pagination?.nextPage}
              onClick={() => setPage(page + 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </header>

      {logs.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-slate-400">No permission changes yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {logs.map((log) => {
            const meta = ACTIONS[log.action?.toLowerCase()] || { label: log.action || "changed", icon: Circle, tone: "bg-slate-100 text-slate-500" };
            const Icon = meta.icon;
            const actor = personName(log.actionBy, log.actionByEmail);
            const target = log.actionFor ? personName(log.actionFor, log.actionFor?.email) : null;
            const { date, time } = when(log);
            return (
              <li key={log._id} className="flex items-start gap-3 px-5 py-3">
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}>
                  <Icon size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">{actor}</span> {meta.label}{" "}
                    {log.permission && log.permission !== "all" && (
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800 [overflow-wrap:anywhere]">{log.permission}</code>
                    )}
                    {target && (
                      <>
                        {" "}
                        {log.action === "revoke" ? "from" : "for"} <span className="font-semibold text-slate-800">{target}</span>
                      </>
                    )}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {date} · {time}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}