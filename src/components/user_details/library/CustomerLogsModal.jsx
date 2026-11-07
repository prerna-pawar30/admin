import React from 'react';
import { Download, Calendar, History } from 'lucide-react';
import { Dialog, DialogBody, DialogHeader } from '../../ui/Dialog';

const CustomerLogsModal = ({ logs, onClose }) => {
    const groupDownloads = (logs) => {
        if (!logs || !Array.isArray(logs)) return [];
        const groups = {};
        logs.forEach(log => {
            if (!groups[log.libraryId]) {
                groups[log.libraryId] = { ...log, count: 0, latestDate: log.date };
            }
            groups[log.libraryId].count += 1;
            if (new Date(log.date) > new Date(groups[log.libraryId].latestDate)) {
                groups[log.libraryId].latestDate = log.date;
            }
        });
        return Object.values(groups);
    };

    const groups = groupDownloads(logs);

    return (
        <Dialog open onClose={onClose} size="sm" label="Download history">
            <DialogHeader icon={History} title="Download history" subtitle="Downloads grouped by library" onClose={onClose} />
            <DialogBody className="space-y-2.5">
                {groups.length > 0 ? (
                    groups.map((lib, idx) => (
                        <div key={idx} className="rounded-xl border border-slate-200 p-4 transition-colors hover:border-brand-200">
                            <div className="flex items-start justify-between gap-2">
                                <span className="min-w-0 break-words text-sm font-bold text-slate-800">{lib.brandName || "Unknown brand"}</span>
                                <span className="shrink-0 rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-700">
                                    {lib.category || "General"}
                                </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                                <span className="flex items-center gap-1.5 font-bold text-brand-600">
                                    <Download size={13} /> {lib.count} {lib.count === 1 ? "time" : "times"}
                                </span>
                                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                                    <Calendar size={12} /> {new Date(lib.latestDate).toLocaleDateString("en-IN")}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="py-10 text-center text-xs font-medium text-slate-400">No downloads yet.</p>
                )}
            </DialogBody>
        </Dialog>
    );
};

export default CustomerLogsModal;
