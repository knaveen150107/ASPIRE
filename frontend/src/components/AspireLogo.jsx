import React from 'react';

export const AspireLogo = ({ size = 'md', showTagline = true, variant = 'blue', className = '' }) => {
  const sizeMap = {
    sm: { icon: 'w-6 h-6', text: 'text-base', tag: 'text-[8px]', iconSize: 16 },
    md: { icon: 'w-8 h-8', text: 'text-xl', tag: 'text-[9px]', iconSize: 20 },
    lg: { icon: 'w-10 h-10', text: 'text-2xl', tag: 'text-[11px]', iconSize: 26 },
    xl: { icon: 'w-12 h-12', text: 'text-3xl', tag: 'text-xs', iconSize: 32 }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Geometric 'A' Ascent Icon */}
      <div className={`${currentSize.icon} rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0 transform transition-transform hover:scale-105`}>
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-3/5 h-3/5 text-white"
        >
          {/* Stylized geometric upward arrow / peak */}
          <path d="M12 3L3 19h5l4-7 4 7h5L12 3z" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="2" />
          <path d="M9 14h6" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-left">
        <span className={`${currentSize.text} font-black tracking-tight leading-none text-slate-900`}>
          ASPIRE
        </span>
        {showTagline && (
          <span className={`${currentSize.tag} font-medium text-slate-400 tracking-normal mt-0.5`}>
            Your Career, Our Intelligence
          </span>
        )}
      </div>
    </div>
  );
};

export default AspireLogo;
