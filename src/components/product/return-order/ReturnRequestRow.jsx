import React from 'react';
import { CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import { getStatusStyle } from './ReturnConstants';

const ReturnRequestRow = ({ group, onProcess }) => {
  return (
    <tr className="group hover:bg-slate-50/60 transition-colors duration-150">
      {/* Order Info & Multi-Item Pack Column */}
      <td className="px-6 lg:px-8 py-5">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-black text-blue-600 bg-blue-50 border border-blue-100/50 px-2 py-0.5 rounded-md w-max mb-3 tracking-wide uppercase">
            ID: #{group.orderId?.split('-')[1] || group.orderId?.substring(0, 8) || 'N/A'}
          </span>
          <div className="space-y-2.5 max-w-xs md:max-w-sm">
            {group.items?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 group/item">
                <div className="w-9 h-9 rounded-lg border border-slate-200 bg-white overflow-hidden flex-shrink-0 shadow-sm">
                  {item.image ? (
                    <img src={item.image} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                      <ShoppingBag size={14} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate uppercase tracking-tight">
                    {item.productName}
                  </p>
                  {item.variantName && (
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                      {item.variantName} <span className="text-slate-300 mx-1">|</span> Qty: {item.quantity}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </td>

      {/* Customer Claim Reason Column */}
      <td className="px-6 lg:px-8 py-5">
        <div className="flex items-start gap-2 max-w-xs sm:max-w-md">
          <AlertCircle size={14} className="text-slate-300 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
            "{group.reason || 'No statement provided.'}"
          </p>
        </div>
      </td>

      {/* Audit Pipeline State Status Component */}
      <td className="px-6 lg:px-8 py-5 text-center">
        <span className={`inline-block px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyle(group.status)}`}>
          {group.status}
        </span>
      </td>

      {/* Control Actions Column */}
      <td className="px-6 lg:px-8 py-5 text-center">
        {group.status === 'pending' ? (
          <button 
            onClick={() => onProcess(group)} 
            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-orange-600 transition-all uppercase tracking-widest shadow-sm hover:shadow-md cursor-pointer"
          >
            Process
          </button>
        ) : (
          <div className="text-[10px] font-black text-slate-400 bg-slate-100 rounded-xl px-3 py-2 w-max mx-auto uppercase tracking-widest flex items-center gap-1.5 border border-slate-200/40">
            <CheckCircle size={12} className="text-emerald-500" /> Finalized
          </div>
        )}
      </td>
    </tr>
  );
};

export default ReturnRequestRow;