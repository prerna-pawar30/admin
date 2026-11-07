import React from "react";
import { HiShieldCheck } from "react-icons/hi";
import { ShieldCheck } from "lucide-react";
import { Dialog, DialogBody, DialogButton, DialogFooter, DialogHeader } from "../../ui/Dialog";

const PermissionsModal = ({ employee, onClose }) => {
  if (!employee) return null;

  return (
    <Dialog open onClose={onClose} size="sm" label="Permissions">
      <DialogHeader
        icon={ShieldCheck}
        title="Permissions"
        subtitle={`${employee.firstName || ""} ${employee.lastName || ""}`.trim()}
        onClose={onClose}
      />
      <DialogBody>
        {employee.permissions?.length > 0 ? (
          <ul className="space-y-2">
            {employee.permissions.map((p) => (
              <li key={p} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-3">
                <HiShieldCheck className="shrink-0 text-emerald-500" size={18} />
                <span className="min-w-0 break-words text-xs font-semibold uppercase tracking-wider text-slate-700">{p.replace(/_/g, " ")}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-xs font-semibold text-slate-400">No special permissions</p>
        )}
      </DialogBody>
      <DialogFooter>
        <DialogButton tone="dark" onClick={onClose} className="w-full sm:w-auto">
          Close
        </DialogButton>
      </DialogFooter>
    </Dialog>
  );
};

export default PermissionsModal;
