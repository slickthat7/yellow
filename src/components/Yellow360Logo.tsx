import React from 'react';

interface Yellow360LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'purple' | 'yellow' | 'white';
}

export const Yellow360Logo: React.FC<Yellow360LogoProps> = ({
  className = '',
  size = 'md',
  variant = 'purple',
}) => {
  const sizeClasses = {
    sm: 'text-lg leading-none',
    md: 'text-2xl leading-none',
    lg: 'text-4xl leading-none',
  };

  const badgeSizes = {
    sm: 'w-4 h-4 text-[9px]',
    md: 'w-6 h-6 text-xs',
    lg: 'w-8 h-8 text-sm',
  };

  return (
    <div className={`flex items-center space-x-1.5 font-black tracking-tighter select-none ${className}`}>
      <div className="flex flex-col items-start leading-none">
        <span
          className={`font-extrabold uppercase ${
            variant === 'yellow'
              ? 'text-[#FACC15]'
              : variant === 'white'
              ? 'text-white'
              : 'text-[#5B00FF]'
          } ${sizeClasses[size]}`}
          style={{ fontFamily: 'system-ui, sans-serif' }}
        >
          YELLOW
        </span>
        <div className="flex items-center space-x-1 -mt-0.5">
          <span
            className={`font-black text-[0.8em] tracking-tight ${
              variant === 'yellow'
                ? 'text-white'
                : variant === 'white'
                ? 'text-slate-200'
                : 'text-[#5B00FF]'
            }`}
          >
            360
          </span>
          {/* Yellow 360 Sunburst Accent Emblem */}
          <span className="inline-flex items-center justify-center px-1.5 py-0.2 bg-[#FACC15] text-[#5B00FF] font-black rounded-full text-[0.55em] tracking-widest uppercase border border-[#5B00FF]/20 shadow-2xs">
            REVIEWS
          </span>
        </div>
      </div>
    </div>
  );
};
