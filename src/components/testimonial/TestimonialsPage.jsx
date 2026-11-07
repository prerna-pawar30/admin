import PageHeader from "../ui/PageHeader";
import { Dialog, DialogBody, DialogButton, DialogFooter, DialogHeader } from "../ui/Dialog";
import React, { useCallback, useEffect, useState } from "react";
import {
  MessageSquareQuote,
  Search,
  Loader2,
  Inbox,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
  Plus,
  Mail,
  Phone,
  Building2,
  Package,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { TestimonialService } from "../../backend/ApiService";
import { formatDate, initials } from "../../lib/format";

const PRIMARY = "#E68736";
const LIMIT = 9;

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Published" },
  { key: "hidden", label: "Hidden" },
];

const EMPTY_FORM = {
  name: "",
  email: "",
  contactNumber: "",
  organizationName: "",
  purchasedProduct: "",
  feedback: "",
  suggestions: "",
  displayOrder: 0,
  isActive: false,
};

/* ------------------------------------------------------------------ */
/*  Create / Edit modal                                                */
/* ------------------------------------------------------------------ */
const TestimonialModal = ({ mode, initial, onClose, onSaved }) => {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.feedback.trim()) {
      toast.error("Name, email and feedback are required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      contactNumber: form.contactNumber?.trim() || "",
      organizationName: form.organizationName?.trim() || "",
      purchasedProduct: form.purchasedProduct?.trim() || "",
      feedback: form.feedback.trim(),
      suggestions: form.suggestions?.trim() || "",
      displayOrder: Number(form.displayOrder) || 0,
      isActive: Boolean(form.isActive),
    };

    setSaving(true);
    try {
      if (mode === "edit") {
        await TestimonialService.updateTestimonial(initial.testimonialId, payload);
        toast.success("Testimonial updated");
      } else {
        await TestimonialService.createTestimonial(payload);
        toast.success("Testimonial added");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.details?.[0] ||
          "Could not save testimonial"
      );
    } finally {
      setSaving(false);
    }
  };

  const field =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#E68736] focus:ring-2 focus:ring-orange-100";

  return (
    <Dialog open onClose={onClose} size="lg" label={mode === "edit" ? "Edit testimonial" : "Add testimonial"}>
      <DialogHeader
        icon={MessageSquareQuote}
        title={mode === "edit" ? "Edit testimonial" : "Add testimonial"}
        subtitle="Customer feedback shown on the website"
        onClose={onClose}
      />
      <DialogBody>
        <form id="testimonial-form" onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                Name *
              </label>
              <input className={field} value={form.name} onChange={set("name")} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                Email *
              </label>
              <input
                type="email"
                className={field}
                value={form.email}
                onChange={set("email")}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                Contact Number
              </label>
              <input
                className={field}
                value={form.contactNumber}
                onChange={set("contactNumber")}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                Organization
              </label>
              <input
                className={field}
                value={form.organizationName}
                onChange={set("organizationName")}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                Purchased Product
              </label>
              <input
                className={field}
                value={form.purchasedProduct}
                onChange={set("purchasedProduct")}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                className={field}
                value={form.displayOrder}
                onChange={set("displayOrder")}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              Feedback *
            </label>
            <textarea
              rows={4}
              className={field}
              value={form.feedback}
              onChange={set("feedback")}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              Suggestions
            </label>
            <textarea
              rows={2}
              className={field}
              value={form.suggestions}
              onChange={set("suggestions")}
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((f) => ({ ...f, isActive: e.target.checked }))
              }
              className="h-4 w-4 rounded border-slate-300 text-[#E68736] focus:ring-[#E68736]"
            />
            Publish on website
          </label>

        </form>
      </DialogBody>
      <DialogFooter>
        <DialogButton tone="ghost" onClick={onClose}>
          Cancel
        </DialogButton>
        <DialogButton tone="primary" type="submit" form="testimonial-form" isLoading={saving} className="flex-1 sm:flex-none">
          {mode === "edit" ? "Save changes" : "Add testimonial"}
        </DialogButton>
      </DialogFooter>
    </Dialog>
  );
};

/* ------------------------------------------------------------------ */
/*  Card                                                               */
/* ------------------------------------------------------------------ */
const TestimonialCard = ({ item, busy, onToggle, onEdit, onDelete }) => (
  <div className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 transition-all hover:border-[#E68736]/60 hover:shadow-md">
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-100 text-sm font-bold text-[#E68736]">
          {initials(item.name)}
        </span>
        <div>
          <h3 className="font-bold capitalize leading-tight text-slate-800">
            {item.name}
          </h3>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {item.organizationName || "—"}
          </p>
        </div>
      </div>

      <span
        className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
          item.isActive
            ? "bg-green-50 text-green-600"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {item.isActive ? "Published" : "Hidden"}
      </span>
    </div>

    <p className="mb-4 line-clamp-4 flex-1 text-sm italic leading-relaxed text-slate-600">
      “{item.feedback}”
    </p>

    {item.suggestions && (
      <p className="mb-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
        <span className="font-bold uppercase tracking-wide">Suggestion: </span>
        {item.suggestions}
      </p>
    )}

    <div className="mb-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
      <p className="flex items-center gap-2">
        <Mail size={13} className="text-slate-400" /> {item.email}
      </p>
      {item.contactNumber && (
        <p className="flex items-center gap-2">
          <Phone size={13} className="text-slate-400" /> {item.contactNumber}
        </p>
      )}
      {item.purchasedProduct && (
        <p className="flex items-center gap-2">
          <Package size={13} className="text-slate-400" /> {item.purchasedProduct}
        </p>
      )}
      <p className="flex items-center gap-2">
        <Calendar size={13} className="text-slate-400" />
        {formatDate(item.submittedAt || item.createdAt)}
        <span className="ml-auto rounded-md bg-slate-100 px-1.5 py-0.5 font-bold text-slate-500">
          #{item.displayOrder ?? 0}
        </span>
      </p>
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={() => onToggle(item)}
        disabled={busy}
        className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold uppercase transition-all disabled:opacity-50 ${
          item.isActive
            ? "border border-slate-200 text-slate-600 hover:bg-slate-50"
            : "bg-[#E68736] text-white shadow-md shadow-orange-200"
        }`}
      >
        {busy ? (
          <Loader2 size={14} className="animate-spin" />
        ) : item.isActive ? (
          <EyeOff size={14} />
        ) : (
          <Eye size={14} />
        )}
        {item.isActive ? "Hide" : "Publish"}
      </button>
      <button
        onClick={() => onEdit(item)}
        className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:border-[#E68736] hover:text-[#E68736]"
      >
        <Pencil size={16} />
      </button>
      <button
        onClick={() => onDelete(item)}
        className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
      >
        <Trash2 size={16} />
      </button>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
const TestimonialsPage = () => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState(null); // { mode, initial }

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const isActive =
        status === "active" ? true : status === "hidden" ? false : undefined;

      const { testimonials, pagination: pg } =
        await TestimonialService.getAllTestimonials({
          page,
          limit: LIMIT,
          isActive,
          search,
        });

      setItems(testimonials);
      setPagination(pg);
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (item) => {
    setBusyId(item.testimonialId);
    try {
      await TestimonialService.updateTestimonial(item.testimonialId, {
        isActive: !item.isActive,
      });
      toast.success(item.isActive ? "Hidden from website" : "Published");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update visibility");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item) => {
    const confirm = await Swal.fire({
      title: "Delete this testimonial?",
      text: `${item.name}'s feedback will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });
    if (!confirm.isConfirmed) return;

    try {
      await TestimonialService.deleteTestimonial(item.testimonialId);
      toast.success("Testimonial deleted");
      // step back a page if we just emptied the last one
      if (items.length === 1 && page > 1) setPage((p) => p - 1);
      else load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not delete testimonial");
    }
  };

  const totalPages = pagination.totalPages || 1;

  return (
    <div>
      <div>
        <PageHeader
          icon={MessageSquareQuote}
          title="Testimonials"
          description="Customer feedback shown on the website."
          actions={
            <button
              type="button"
              onClick={() => setModal({ mode: "create", initial: {} })}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
            >
              <Plus size={16} strokeWidth={2.5} /> Add testimonial
            </button>
          }
        />

        {/* CONTROLS */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex gap-1 rounded-xl bg-slate-100 p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setStatus(tab.key);
                  setPage(1);
                }}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  status === tab.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name, email, organization…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-[#E68736] focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        {/* BODY */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-32">
            <Loader2 className="animate-spin text-[#E68736]" size={40} />
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Loading testimonials
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center">
            <Inbox size={36} className="text-slate-300" />
            <p className="text-sm font-bold text-slate-600">
              No testimonials found
            </p>
            <p className="text-xs text-slate-400">
              Try a different filter or add one manually.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              {pagination.totalItems} total
            </p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <TestimonialCard
                  key={item.testimonialId}
                  item={item}
                  busy={busyId === item.testimonialId}
                  onToggle={handleToggle}
                  onEdit={(it) => setModal({ mode: "edit", initial: it })}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            {[...Array(totalPages)].map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-10 w-10 rounded-xl text-sm font-bold transition-all ${
                    page === p
                      ? "bg-[#E68736] text-white"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-50"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {modal && (
        <TestimonialModal
          mode={modal.mode}
          initial={modal.initial}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
    </div>
  );
};

export default TestimonialsPage;
