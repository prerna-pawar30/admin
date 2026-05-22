import React from "react";
import { Tag, Users, Power, Settings2, Trash2 } from "lucide-react";

export default function CouponCard({ coupon, onDelete, onToggle, onEdit }) {
  return (
    <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 relative overflow-hidden group hover:border-[#E68736]/30 transition-all shadow-sm">
      <div className={`absolute left-0 top-0 bottom-0 w-2 transition-all ${coupon.isActive ? 'bg-[#E68736]' : 'bg-slate-300'}`} />
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-4 flex-1">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">{coupon.code}</h3>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-all ${coupon.isActive ? 'bg-orange-100 text-[#E68736]' : 'bg-slate-100 text-slate-400'}`}>
                {coupon.isActive ? 'LIVE' : 'DRAFT'}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{coupon.title}</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Tag size={14} className="text-[#E68736]" />
              <span className="text-[10px] font-black uppercase">{coupon.couponType?.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Users size={14} />
              <span className="text-[10px] font-black">{coupon.usedCount || 0} Uses</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 relative z-10">
          <button
            onClick={onToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all font-black text-[9px] ${
              coupon.isActive
                ? 'border-orange-100 text-[#E68736] hover:bg-orange-50'
                : 'border-slate-100 text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Power size={12} fill={coupon.isActive ? "currentColor" : "none"} />
            {coupon.isActive ? "ACTIVE" : "DRAFT"}
          </button>

          <div className="flex gap-2">
            <button onClick={onEdit} className="p-3 bg-slate-50 text-slate-400 hover:text-[#E68736] rounded-xl transition-all">
              <Settings2 size={20} />
            </button>
            <button onClick={onDelete} className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-all">
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}