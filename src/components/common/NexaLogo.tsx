import React from 'react';

interface NexaLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  textColor?: string;
}

export const NexaLogo: React.FC<NexaLogoProps> = ({
  className = '',
  size = 32,
  showText = false,
  textColor = 'text-slate-900',
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* NEXA Brand Icon Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 rounded-xl shadow-xs overflow-hidden"
      >
        <defs>
          <linearGradient id="nexa-grad" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0B0814" />
            <stop offset="50%" stopColor="#1E1035" />
            <stop offset="100%" stopColor="#5324D6" />
          </linearGradient>
        </defs>

        {/* Outer Dark Gradient Rounded Box */}
        <rect width="100" height="100" rx="22" fill="url(#nexa-grad)" />

        {/* Lower Left White Rounded Square */}
        <rect x="24" y="49" width="19" height="19" rx="4.5" fill="#FFFFFF" />

        {/* Main Faceted Monogram Block */}
        <path
          d="M 43 49
             V 36
             C 43 33 45 31 48 31
             H 58
             C 60 31 62 32 63.5 33.5
             L 74.5 44.5
             C 75.5 45.5 76 47 76 48.5
             V 63
             C 76 66 74 68 71 68
             H 62
             C 60 68 58.5 67 57.5 66
             L 44.5 53
             C 43.5 52 43 50.5 43 49
             Z"
          fill="#FFFFFF"
        />
      </svg>

      {showText && (
        <span className={`font-extrabold tracking-wider text-base ${textColor}`}>
          NEXA
        </span>
      )}
    </div>
  );
};
