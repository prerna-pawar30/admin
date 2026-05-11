import React from 'react';

/**
 * @param {string} variant - 'full' (screen center), 'section' (container center), 'button' (small for buttons)
 * @param {string} color - Tailwind color class (default: 'orange-500')
 * @param {string} text - Optional loading text
 */
const Loader = ({ variant = 'section', color = 'orange-500', text }) => {
  // Size mapping based on variant
  const sizeClasses = {
    full: "h-16 w-16 border-[6px]",
    section: "h-12 w-12 border-[5px]",
    button: "h-4 w-4 border-2"
  };

  const containerClasses = {
    full: "fixed inset-0 z-[999] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center",
    section: "w-full py-20 flex flex-col items-center justify-center",
    button: "inline-block mr-2"
  };

  const loaderContent = (
    <>
      <div 
        className={`
          ${sizeClasses[variant]} 
          animate-spin 
          rounded-full 
          border-slate-100 
          border-t-${color} 
          transition-all
        `}
      />
      {text && variant !== 'button' && (
        <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
          {text}
        </p>
      )}
    </>
  );

  return (
    <div className={containerClasses[variant]}>
      {loaderContent}
    </div>
  );
};

export default Loader;