import React from 'react';

interface MastQrLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  variant?: 'full' | 'mark' | 'horizontal';
}

export const MastQrLogo: React.FC<MastQrLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  variant = 'full',
}) => {
  const sizeStyles = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-16',
    xl: 'h-24',
  };

  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img
          src="/mast-qr-logo.svg"
          alt="MAST QR"
          className={`${sizeStyles[size]} w-auto object-contain`}
        />
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <img
          src="/mast-qr-logo.svg"
          alt="MAST QR"
          className={`${sizeStyles[size]} w-auto object-contain`}
        />
        <div className="flex flex-col text-left">
          <div className="flex items-center tracking-tight font-black leading-none text-xl sm:text-2xl">
            <span className="text-[#3B0764] dark:text-purple-300">MAST</span>
            <span className="text-[#F59E0B] ml-1">QR</span>
          </div>
          {showSubtitle && (
            <span className="text-[9px] font-bold tracking-widest text-[#581C87] dark:text-purple-300 mt-0.5">
              SCAN • RATE • GROW
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <img
        src="/mast-qr-logo.svg"
        alt="MAST QR - Scan Rate Improve Grow"
        className={`${sizeStyles[size]} w-auto object-contain drop-shadow-sm`}
      />
    </div>
  );
};
