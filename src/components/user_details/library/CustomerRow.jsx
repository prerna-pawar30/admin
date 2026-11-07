import React from "react";
import { Mail, Phone, Trash2, Layers, Building2 } from "lucide-react";
import InitialsAvatar from "../../ui/InitialsAvatar";

/**
 * One library contact. Desktop (lg+): a compact 12-column row that lines up with the header in
 * CustomerList (4 / 4 / 3 / 1). Below lg: a compact card.
 */
const CustomerRow = ({ user, onDelete, onViewLogs }) => {
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unnamed contact";
  const logCount = user.logLibrary?.length || 0;

  const handleDelete = () => {
    if (!user.customerId) {
      console.error("Delete action blocked: 'customerId' is missing on this object.", user);
      return;
    }
    onDelete(user.customerId);
  };

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2.5 px-4 py-3 transition-colors hover:bg-slate-50/70 sm:px-5 lg:grid-cols-12 lg:gap-x-4 lg:px-6">
      {/* Name + company */}
      <div className="flex min-w-0 items-center gap-3 lg:col-span-4">
        <InitialsAvatar name={name} className="h-9 w-9 text-[11px]" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800" title={name}>
            {name}
          </p>
          <p className="flex min-w-0 items-center gap-1 text-xs text-brand-600">
            <Building2 size={12} className="shrink-0" />
            <span className="truncate">{user.companyName || "No company"}</span>
          </p>
        </div>
      </div>

      {/* Delete: top-right on phones, last column on desktop */}
      <div className="flex justify-end lg:order-last lg:col-span-1">
        <button
          type="button"
          onClick={handleDelete}
          title="Delete contact"
          aria-label={`Delete ${name}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Email + phone */}
      <div className="col-span-2 min-w-0 text-xs text-slate-600 sm:flex sm:flex-wrap sm:gap-x-4 lg:col-span-4 lg:block lg:space-y-0.5">
        <p className="flex min-w-0 items-center gap-1.5">
          <Mail size={13} className="shrink-0 text-slate-400" />
          <span className="truncate" title={user.email}>
            {user.email || "N/A"}
          </span>
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 sm:mt-0">
          <Phone size={13} className="shrink-0 text-slate-400" />
          {user.mobileNumber || "N/A"}
        </p>
      </div>

      {/* Downloads */}
      <div className="col-span-2 lg:col-span-3">
        <button
          type="button"
          onClick={() => onViewLogs(user.logLibrary)}
          className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand-50 px-2.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-500 hover:text-white"
        >
          <Layers size={13} />
          {logCount} {logCount === 1 ? "download" : "downloads"}
        </button>
      </div>
    </li>
  );
};

export default CustomerRow;