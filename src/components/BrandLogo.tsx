import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  customHeight?: number;
  showText?: boolean;
  layout?: 'horizontal' | 'vertical';
  iconOnly?: boolean;
  theme?: 'light' | 'dark';
}

export default function BrandLogo({
  className = '',
  size = 'md',
  customHeight,
  showText = true,
  layout = 'horizontal',
  iconOnly = false,
  theme = 'light',
}: BrandLogoProps) {
  // Setup dimensions based on preset sizes
  let height = 48;
  if (size === 'sm') height = 32;
  else if (size === 'md') height = 48;
  else if (size === 'lg') height = 72;
  else if (size === 'xl') height = 110;
  
  if (customHeight) {
    height = customHeight;
  }

  // Sizing relationships
  const isVertical = layout === 'vertical';

  return (
    <div className={`inline-flex items-center ${isVertical ? 'flex-col text-center' : 'flex-row'} gap-3 ${className}`}>
      
      {/* 1. Precise High-Fidelity SVG Brand Icon representing the heart people and central plus */}
      <svg
        style={{ height: `${height}px`, width: `${height * (isVertical ? 1.1 : 1.15)}px` }}
        viewBox="0 0 320 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
        aria-label="장애인 평생학습 강사 협회 로고 마크"
      >
        <defs>
          {/* Blue-Teal Gradient for Left Person */}
          <linearGradient id="leftPersonGrad" x1="160" y1="50" x2="60" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00bae6" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>

          {/* Green-Yellow-Orange Gradient for Right Person */}
          <linearGradient id="rightPersonGrad" x1="160" y1="50" x2="260" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8cc63f" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>

          {/* Glowing Shadow filter for active premium look */}
          <filter id="logoGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0284c7" floodOpacity="0.08" />
          </filter>
        </defs>

        <g filter="url(#logoGlow)">
          {/* Left Head Circle (Sky Blue) */}
          <circle cx="120" cy="62" r="19" fill="#00a3e0" />

          {/* Right Head Circle (Warm Light Green) */}
          <circle cx="200" cy="62" r="19" fill="#8bc53f" />

          {/* Left Person Swoosh (Forms left side of Heart) */}
          <path
            d="M 154,101 
               C 134,88 118,87 98,99 
               C 70,116 57,152 61,189 
               C 65,226 112,254 148,256 
               C 152,256 153,253 151,248 
               C 134,220 90,183 98,145 
               C 102,126 118,114 136,116 
               C 148,117 155,123 158,131 Z"
            fill="url(#leftPersonGrad)"
          />

          {/* Right Person Swoosh (Forms right side of Heart) */}
          <path
            d="M 166,101 
               C 186,88 202,87 222,99 
               C 250,116 263,152 259,189 
               C 255,226 208,254 172,256 
               C 168,256 167,253 169,248 
               C 186,220 230,183 222,145 
               C 218,126 202,114 184,116 
               C 172,117 165,123 162,131 Z"
            fill="url(#rightPersonGrad)"
          />

          {/* Centered Orange Bold Plus Sign with Rounded Caps */}
          <g transform="translate(160, 162)">
            {/* Horizontal Bar */}
            <rect x="-24" y="-7.5" width="48" height="15" rx="7.5" fill="#f7931e" />
            {/* Vertical Bar */}
            <rect x="-7.5" y="-24" width="15" height="48" rx="7.5" fill="#f7931e" />
          </g>
        </g>
      </svg>

      {/* 2. Text Brand Typography underneath or beside */}
      {showText && !iconOnly && (
        <div className={`flex flex-col ${isVertical ? 'items-center mt-1' : 'items-start'} leading-normal font-sans`}>
          
          {/* Slogans */}
          <div className={`flex flex-col ${isVertical ? 'items-center' : 'items-start'} gap-0.5 mb-1`}>
            <span className={`text-[10px] md:text-xs font-semibold tracking-wider ${theme === 'dark' ? 'text-sky-400' : 'text-sky-600'}`}>
              다름을 잇는 <span className={`font-black ${theme === 'dark' ? 'text-white' : 'text-orange-500'}`}>공감플러스+</span>
            </span>
            <span className={`text-[8px] md:text-[10px] font-medium tracking-wide ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} hidden sm:inline-block`}>
              Accessible Learning, Inclusive Future (모두가 배우고, 함께 성장하는 미래)
            </span>
          </div>

          {/* Dedicated full branding name of the association */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-sm md:text-base lg:text-lg font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              장애인 평생학습 강사 협회
            </span>
            <span 
              className="inline-flex items-center bg-gradient-to-r from-sky-500 to-sky-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-3xs" 
              title="Korea Accessible Learning Association"
            >
              KALA
            </span>
          </div>
          
          <span className={`text-[8px] md:text-[9px] font-semibold tracking-wider uppercase font-mono ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} mt-0.5 hidden md:inline-block`}>
            Korea Accessible Learning Association
          </span>

        </div>
      )}

    </div>
  );
}
