import React from 'react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast.show) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] pointer-events-none transition-all duration-300">
      <div className="bg-[#31302d] text-[#f3f0eb] px-4 py-2.5 rounded-full shadow-2xl font-sans text-[12px] font-semibold flex items-center justify-center gap-2 border border-[#847374]/30 animate-in fade-in slide-in-from-top duration-200">
        <span
          className="material-symbols-outlined text-secondary-container text-[18px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {toast.icon || 'check_circle'}
        </span>
        <span className="truncate">{toast.message}</span>
      </div>
    </div>
  );
};
