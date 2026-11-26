import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable RealCred Logo Component
 * Exactly matches the design reference:
 * - Icon: Dark charcoal/black (#18181B) rounded square with subtle shadow
 * - "R" in bold white
 * - "C" in bold brand red (#D71938)
 * - Wordmark: "RealCred" with "Real" in dark text (or white on dark backgrounds) and "Cred" in brand red
 */
export default function Logo({
  variant = 'light', // 'light' for light backgrounds, 'dark' for dark navy (#0F172A) backgrounds
  size = 'md',       // 'sm' | 'md' | 'lg'
  withLink = true,
  to = '/',
  subtitle = null,
  className = '',
}) {
  const iconSizeClasses = {
    sm: 'w-7 h-7 rounded-lg text-xs',
    md: 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-base sm:text-lg',
    lg: 'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl text-xl sm:text-2xl',
  }[size] || 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-base sm:text-lg';

  const textSizeClasses = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  }[size] || 'text-xl sm:text-2xl';

  const realColorClass = variant === 'dark' ? 'text-white' : 'text-[#18181B]';

  const content = (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 group shrink-0 ${className}`}>
      {/* Dark charcoal rounded-square icon with white R and red C */}
      <div
        className={`${iconSizeClasses} bg-[#18181B] flex items-center justify-center font-extrabold shadow-sm transition-transform duration-200 group-hover:scale-105 shrink-0 select-none ${
          variant === 'dark' ? 'border border-slate-700/60 shadow-black/40' : 'border border-black/5 shadow-black/10'
        }`}
      >
        <span className="text-white font-black leading-none">R</span>
        <span className="text-brand-red font-black leading-none">C</span>
      </div>

      {/* Wordmark: "RealCred" + Optional Subtitle */}
      <div className="shrink-0 flex flex-col justify-center select-none">
        <div className={`${textSizeClasses} font-black tracking-tight leading-none flex items-center`}>
          <span className={`${realColorClass} transition-colors`}>Real</span>
          <span className="text-brand-red">Cred</span>
        </div>
        {subtitle && (
          <div className="text-[9px] font-bold tracking-wider text-brand-red uppercase leading-none mt-1">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );

  if (withLink) {
    return (
      <Link to={to} className="inline-block shrink-0 focus:outline-none" aria-label="RealCred Home">
        {content}
      </Link>
    );
  }

  return content;
}
