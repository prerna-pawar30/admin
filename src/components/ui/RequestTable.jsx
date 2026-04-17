import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const RequestTable = ({ data, loading, activeTab, onAction }) => {
  if (loading) {
    return (
      <table className="w-full">
        <tbody>
          <tr>
            <td className="py-40 text-center text-slate-300 font-black uppercase text-xs animate-pulse tracking-[0.3em]">
              Processing Requests...
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
          <th className="px-10 py-6">Identity</th>
          <th className="px-8 py-6">Detail</th>
          <th className="px-8 py-6">Message</th>
          <th className="px-10 py-6 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {data.map((item, idx) => (
          <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
            <td className="px-10 py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center font-black text-orange-600 text-xs shadow-inner uppercase">
                  {item.employee?.firstName?.[0]}{item.employee?.lastName?.[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{item.employee?.firstName} {item.employee?.lastName}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.employee?.email}</p>
                </div>
              </div>
            </td>
            <td className="px-8 py-6">
              <p className="text-[10px] font-black text-slate-800 uppercase">
                {activeTab === 'leaves' ? item.leaveType : 'Punch-Out Req'}
              </p>
              <p className="text-[10px] text-slate-400 font-bold">
                {item.fromDate || item.date} {item.toDate && `→ ${item.toDate}`}
              </p>
            </td>
            <td className="px-8 py-6 text-xs text-slate-500 italic max-w-[200px] truncate">
              "{item.leaveReason || 'System Request'}"
            </td>
            <td className="px-10 py-6 text-right">
              {item.status === "PENDING" ? (
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => onAction(item.approvalId, "APPROVED", activeTab === 'leaves' ? 'leave' : 'punch')} 
                    className="w-8 h-8 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                  >
                    <CheckCircle size={16}/>
                  </button>
                  <button 
                    onClick={() => onAction(item.approvalId, "REJECTED", activeTab === 'leaves' ? 'leave' : 'punch')} 
                    className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                  >
                    <XCircle size={16}/>
                  </button>
                </div>
              ) : (
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${
                  item.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {item.status}
                </span>
              )}
            </td>
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan="4" className="py-20 text-center text-slate-400 text-xs font-bold uppercase">
              No pending requests found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default RequestTable;