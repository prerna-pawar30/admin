import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const RequestTable = ({ data, activeTab, onAction, loading }) => {
  if (loading) return <div className="py-40 text-center animate-pulse">SYNCHRONIZING...</div>;

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b">
          <th className="px-10 py-6">Identity</th>
          <th className="px-8 py-6">Detail</th>
          <th className="px-8 py-6">Message</th>
          <th className="px-10 py-6 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {data.map((item, idx) => (
          <tr key={idx} className="hover:bg-slate-50/30">
            <td className="px-10 py-6">
                <p className="font-bold text-sm text-slate-800">{item.employee?.firstName} {item.employee?.lastName}</p>
                <p className="text-[10px] text-slate-400 uppercase">{item.employee?.email}</p>
            </td>
            <td className="px-8 py-6">
              <p className="text-[10px] font-black text-slate-800 uppercase">{activeTab === 'leaves' ? item.leaveType : 'Punch-Out Req'}</p>
              <p className="text-[10px] text-slate-400 font-bold">{item.fromDate || item.date} {item.toDate && `→ ${item.toDate}`}</p>
            </td>
            <td className="px-8 py-6 text-xs text-slate-500 italic max-w-[200px] truncate">"{item.leaveReason || 'System Request'}"</td>
            <td className="px-10 py-6 text-right">
              {item.status === "PENDING" ? (
                <div className="flex justify-end gap-3">
                  <button onClick={() => onAction(item.approvalId, "APPROVED", activeTab === 'leaves' ? 'leave' : 'punch')} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle size={16}/></button>
                  <button onClick={() => onAction(item.approvalId, "REJECTED", activeTab === 'leaves' ? 'leave' : 'punch')} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-500 hover:text-white transition-all"><XCircle size={16}/></button>
                </div>
              ) : (
                <span className="text-[10px] font-black text-slate-300 uppercase">{item.status}</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RequestTable;