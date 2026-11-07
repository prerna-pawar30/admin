import React from 'react';
import { CheckCircle } from 'lucide-react';

export const getStatusStyle = (status) => {
  const styles = {
    pending: 'bg-orange-50 text-orange-600 border-orange-100',
    approved: 'bg-green-50 text-green-600 border-green-100',
    rejected: 'bg-red-50 text-red-600 border-red-100',
  };
  return styles[status] || 'bg-slate-50 text-slate-600 border-slate-100';
};