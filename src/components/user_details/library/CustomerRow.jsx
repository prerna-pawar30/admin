import React from 'react';
import { Mail, Phone, Trash2, Layers } from 'lucide-react';

const CustomerRow = ({ user, onDelete, onViewLogs }) => {
    
    const handleIdTransmission = () => {
        const targetId = user.customerId;
        if (!targetId) {
            console.error("Delete action blocked: 'customerId' is missing on this object.", user);
            return;
        }
        onDelete(targetId);
    };

    return (
        <tr className="hover:bg-slate-50/60 transition-colors group">
            <td className="p-4 pl-6 vertical-middle">
                <div className="font-bold text-slate-900 text-sm">{user.firstName} {user.lastName}</div>
                <div className="text-xs font-medium text-[#E68736] mt-0.5">{user.companyName || 'No Company Appended'}</div>
            </td>
            <td className="p-4 vertical-middle">
                <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-400 group-hover:text-[#E68736] transition-colors" />
                        <span className="truncate max-w-[200px]">{user.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400 group-hover:text-[#E68736] transition-colors" />
                        <span>{user.mobileNumber || 'N/A'}</span>
                    </div>
                </div>
            </td>
            <td className="p-4 vertical-middle">
                <button 
                    className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 hover:bg-[#E68736] hover:text-white border border-orange-100 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95"
                    onClick={() => onViewLogs(user.logLibrary)}
                >
                    <Layers size={13} />
                    View {user.logLibrary?.length || 0} Logs
                </button>
            </td>
            <td className="p-4 pr-6 vertical-middle text-center">
                <button 
                    className="inline-flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white p-2.5 rounded-xl transition-all active:scale-95 shadow-sm border border-rose-100"
                    onClick={handleIdTransmission}
                    title="Delete Record"
                >
                    <Trash2 size={15} />
                </button>
            </td>
        </tr>
    );
};

export default CustomerRow;