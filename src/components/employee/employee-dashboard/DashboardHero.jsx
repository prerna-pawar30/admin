/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { User, LayoutDashboard, ChevronRight } from 'lucide-react';

const DashboardHero = ({ user, onPunchClick }) => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem]  border border-orange-200"
  >
    <div className="flex items-center gap-6">
      <div className="h-20 w-20 rounded-[2rem] bg-orange-500 flex items-center justify-center text-white  ring-8 ring-orange-50">
        <User size={32} />
      </div>
      <div>
        <p className="text-orange-600 font-bold text-xs uppercase tracking-widest">Personal Workspace</p>
        <h1 className="text-3xl font-black uppercase">{user.firstName} {user.lastName}</h1>
        <div className="flex items-center gap-2 mt-1 text-slate-400 font-medium text-sm">
          <LayoutDashboard size={14} /> <span>{user.role}</span>
        </div>
      </div>
    </div>
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onPunchClick}
      className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg hover:bg-orange-600 transition-colors"
    >
      SYSTEM PUNCH IN <ChevronRight size={18} />
    </motion.button>
  </motion.div>
);

export default DashboardHero;