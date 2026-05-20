import React from 'react';
import { X, Download, Calendar } from 'lucide-react';

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

    return (
        <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4 z-50 transition-opacity animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[85vh] border border-slate-100 animate-slide-up"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Download History</h3>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">Aggregated logs by collection</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-slate-500 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-5 overflow-y-auto space-y-3 custom-scrollbar">
                    {groupDownloads(logs).length > 0 ? (
                        groupDownloads(logs).map((lib, idx) => (
                            <div key={idx} className="bg-white border border-slate-200/70 p-4 rounded-xl shadow-sm hover:border-orange-200/80 transition-colors">
                                <div className="flex justify-between items-start gap-2">
                                    <span className="font-bold text-slate-800 text-sm tracking-tight">{lib.brandName || "Unknown Brand"}</span>
                                    <span className="bg-orange-100 text-orange-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                                        {lib.category || "General"}
                                    </span>
                                </div>
                                
                                <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5 font-bold text-[#E68736]">
                                        <Download size={13} />
                                        <span>{lib.count} Times</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-400 font-medium text-[11px]">
                                        <Calendar size={12} />
                                        <span>{new Date(lib.latestDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-slate-400 font-medium text-xs italic">
                            No logs registered for this profile.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerLogsModal;