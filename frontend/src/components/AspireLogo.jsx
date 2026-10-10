import React from 'react';
import logoImg from '../assets/logo.png';

export const AspireLogo = ({ size = 'md', showTagline = true, className = '' }) => {
  const sizeMap = {
    sm: { img: 'w-7 h-7', text: 'text-lg', tag: 'text-[8px]' },
    md: { img: 'w-9 h-9', text: 'text-2xl', tag: 'text-[9px]' },
    lg: { img: 'w-11 h-11', text: 'text-3xl', tag: 'text-[11px]' },
    xl: { img: 'w-14 h-14', text: 'text-4xl', tag: 'text-xs' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon Image */}
      <img
        src={logoImg}
        alt="ASPIRE Logo"
        className={`${currentSize.img} object-contain rounded-xl shrink-0 transition-transform duration-200 hover:scale-105`}
      />

      {/* Brand Typography */}
      <div className="flex flex-col text-left justify-center">
        <span className={`${currentSize.text} font-chewy tracking-wider leading-none text-slate-900 dark:text-white transition-colors`}>
          ASPIRE
        </span>
        {showTagline && (
          <span className={`${currentSize.tag} font-medium text-slate-500 dark:text-slate-400 tracking-normal mt-0.5`}>
            Your Career, Our Intelligence
          </span>
        )}
      </div>
    </div>
  );
};

export default AspireLogo;
