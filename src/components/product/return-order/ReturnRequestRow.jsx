import React from 'react';
import { CheckCircle } from 'lucide-react';
import { getStatusStyle } from './ReturnConstants';

const ReturnRequestRow = ({ group, onProcess }) => {
  return (
    <tr className="hover:bg-slate-50/50">
      <td className="px-8 py-6">
        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-3 inline-block">
          #{group.orderId?.split('-')[1] || 'N/A'}
        </span>
        <div className="space-y-3">
          {group.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <img src={item.image} className="w-9 h-9 rounded-lg border bg-white" alt="" />
              <p className="text-[11px] font-bold text-slate-800 uppercase">{item.productName}</p>
            </div>
          ))}
        </div>
      </td>
      <td className="px-8 py-6">
        <p className="text-xs text-slate-500 italic leading-relaxed">"{group.reason}"</p>
      </td>
      <td className="px-8 py-6 text-center">
        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(group.status)}`}>
          {group.status}
        </span>
      </td>
      <td className="px-8 py-6 text-center">
        {group.status === 'pending' ? (
          <button 
            onClick={() => onProcess(group)} 
            className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black hover:bg-[#E68736] transition-all uppercase tracking-widest shadow-lg shadow-slate-200"
          >
            Process
          </button>
        ) : (
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center justify-center gap-1">
            <CheckCircle size={12} /> Finalized
          </div>
        )}
      </td>
    </tr>
  );
};

export default ReturnRequestRow;