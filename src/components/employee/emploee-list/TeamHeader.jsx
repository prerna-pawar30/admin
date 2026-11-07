import React from "react";
import { HiUserGroup } from "react-icons/hi";

const TeamHeader = ({ totalEmployees, showingStart, showingEnd, filteredCount }) => (
  <div className=" flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
    <div className="space-y-1">
      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center gap-2 text-[#E68736]">
          <HiUserGroup size={28} />
          <span className="font-bold tracking-wider text-sm uppercase">Administration</span>
        </div>
        <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight">
          Total: {totalEmployees}
        </div>
      </div>
      <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
        Employee <span className="text-[#E68736]">Roster</span>
      </h1>
      <p className="text-slate-500 font-medium text-sm">
        Showing {filteredCount > 0 ? showingStart : 0}-{showingEnd} of {filteredCount} members
      </p>
    </div>
  </div>
);

export default TeamHeader;