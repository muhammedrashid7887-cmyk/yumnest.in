'use client';

import React from 'react';

interface WavyTickerRibbonProps {
  variant: 'green' | 'yellow' | 'black';
  direction?: 'rtl' | 'ltr';
  className?: string;
  speedSeconds?: number;
}

const GREEN_ITEMS = [
  'YUM NEST – ONE NEST, ENDLESS FLAVORS',
  'AUTHENTIC TASTE IN EVERY BITE',
  'QUALITY INGREDIENTS',
];

const YELLOW_ITEMS = [
  'CHICKEN TIKKA MASALA',
  'PURE SPICES, PERFECT FLAVOURS',
  'BROAST MASALA',
  'ALFAHAM MASALA',
  'SHAWAYA MASALA',
];

// Gentle, sweeping 3-cycle wave path across 1440x64
// Constant ribbon thickness: 44px in SVG coordinate space (fills ~70% of container)
const WAVE_PATH =
  'M 0,10 C 62.4,4.0 177.6,4.0 240.0,10.0 C 302.4,16.0 417.6,16.0 480.0,10.0 C 542.4,4.0 657.6,4.0 720.0,10.0 C 782.4,16.0 897.6,16.0 960.0,10.0 C 1022.4,4.0 1137.6,4.0 1200.0,10.0 C 1262.4,16.0 1377.6,16.0 1440.0,10.0 L 1440,54 C 1377.6,60.0 1262.4,60.0 1200.0,54.0 C 1137.6,48.0 1022.4,48.0 960.0,54.0 C 897.6,60.0 782.4,60.0 720.0,54.0 C 657.6,48.0 542.4,48.0 480.0,54.0 C 417.6,60.0 302.4,60.0 240.0,54.0 C 177.6,48.0 62.4,48.0 0.0,54.0 Z';

export const WavyTickerRibbon: React.FC<WavyTickerRibbonProps> = ({
  variant,
  direction = variant === 'green' ? 'rtl' : 'ltr',
  className = '',
  speedSeconds = 65,
}) => {
  const isGreen = variant === 'green';
  const items = isGreen ? GREEN_ITEMS : YELLOW_ITEMS;
  const fillColor = isGreen ? '#10583C' : 'transparent';
  const textColor = isGreen ? 'text-[#FAF7F2]' : 'text-white';
  const dotColor = 'text-[#E8AA42]'; // Dot remains unchanged

  const animClass =
    direction === 'rtl'
      ? 'animate-marquee-continuous-rtl'
      : 'animate-marquee-continuous-ltr';

  return (
    <div
      className={`relative w-full overflow-hidden select-none ${
        isGreen
          ? 'py-1 sm:py-2 my-0.5 sm:my-1'
          : 'py-1 sm:py-1.5 my-2.5 sm:my-4 bg-[#000000] shadow-xs'
      } ${className}`}
      role="region"
      aria-label={`${variant} promotional ticker`}
    >
      <div
        className={`relative w-full flex items-center ${
          isGreen ? 'h-[54px] sm:h-[62px] md:h-[68px]' : 'h-[28px] sm:h-[32px]'
        }`}
      >
        {/* Organic SVG Wavy Ribbon Silhouette - only for green ribbon */}
        {isGreen && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-xs"
            preserveAspectRatio="none"
            viewBox="0 0 1440 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d={WAVE_PATH} fill={fillColor} />
          </svg>
        )}

        {/* Scrolling Ticker Text Track */}
        <div className="relative z-10 w-full overflow-hidden flex items-center">
          <div
            className={`${animClass} flex items-center whitespace-nowrap`}
            style={{ animationDuration: `${speedSeconds}s` }}
          >
            {/* Track A */}
            <div className="flex shrink-0 items-center">
              {[...Array(4)].map((_, cycleIndex) => (
                <React.Fragment key={`cycle-a-${cycleIndex}`}>
                  {items.map((item, idx) => (
                    <span
                      key={`a-${cycleIndex}-${idx}`}
                      className="inline-flex items-center"
                    >
                      <span
                        className={`font-black tracking-widest text-[10px] sm:text-[11px] md:text-xs uppercase ${textColor}`}
                      >
                        {item}
                      </span>
                      <span
                        className={`mx-3 sm:mx-4 font-black text-xs sm:text-sm select-none ${dotColor}`}
                      >
                        •
                      </span>
                    </span>
                  ))}
                </React.Fragment>
              ))}
            </div>

            {/* Track B (Duplicate for seamless continuous loop) */}
            <div className="flex shrink-0 items-center" aria-hidden="true">
              {[...Array(4)].map((_, cycleIndex) => (
                <React.Fragment key={`cycle-b-${cycleIndex}`}>
                  {items.map((item, idx) => (
                    <span
                      key={`b-${cycleIndex}-${idx}`}
                      className="inline-flex items-center"
                    >
                      <span
                        className={`font-black tracking-widest text-[10px] sm:text-[11px] md:text-xs uppercase ${textColor}`}
                      >
                        {item}
                      </span>
                      <span
                        className={`mx-3 sm:mx-4 font-black text-xs sm:text-sm select-none ${dotColor}`}
                      >
                        •
                      </span>
                    </span>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WavyTickerRibbon;
