'use client';

import React from 'react';

interface WavyTickerRibbonProps {
  variant: 'green' | 'yellow';
  direction?: 'rtl' | 'ltr';
  className?: string;
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

export const WavyTickerRibbon: React.FC<WavyTickerRibbonProps> = ({
  variant,
  direction = variant === 'green' ? 'rtl' : 'ltr',
  className = '',
}) => {
  const isGreen = variant === 'green';
  const items = isGreen ? GREEN_ITEMS : YELLOW_ITEMS;
  const fillColor = isGreen ? '#10583C' : '#EEAE3D';
  const textColor = isGreen ? 'text-[#FAF7F2]' : 'text-[#0F5638]';
  const dotColor = isGreen ? 'text-[#E8AA42]' : 'text-[#0F5638]/70';

  const animClass =
    direction === 'rtl'
      ? 'animate-marquee-continuous-rtl'
      : 'animate-marquee-continuous-ltr';

  // Continuous organic wave path across 1440x70 with 5 symmetric cycles
  // Constant ribbon thickness: 40px in SVG coordinates
  const wavePath =
    'M 0,15 C 37.4,8.0 106.6,8.0 144.0,15.0 C 181.4,22.0 250.6,22.0 288.0,15.0 C 325.4,8.0 394.6,8.0 432.0,15.0 C 469.4,22.0 538.6,22.0 576.0,15.0 C 613.4,8.0 682.6,8.0 720.0,15.0 C 757.4,22.0 826.6,22.0 864.0,15.0 C 901.4,8.0 970.6,8.0 1008.0,15.0 C 1045.4,22.0 1114.6,22.0 1152.0,15.0 C 1189.4,8.0 1258.6,8.0 1296.0,15.0 C 1333.4,22.0 1402.6,22.0 1440.0,15.0 L 1440,55 C 1402.6,62.0 1333.4,62.0 1296.0,55.0 C 1258.6,48.0 1189.4,48.0 1152.0,55.0 C 1114.6,62.0 1045.4,62.0 1008.0,55.0 C 970.6,48.0 901.4,48.0 864.0,55.0 C 826.6,62.0 757.4,62.0 720.0,55.0 C 682.6,48.0 613.4,48.0 576.0,55.0 C 538.6,62.0 469.4,62.0 432.0,55.0 C 394.6,48.0 325.4,48.0 288.0,55.0 C 250.6,62.0 181.4,62.0 144.0,55.0 C 106.6,48.0 37.4,48.0 0.0,55.0 Z';

  return (
    <div
      className={`relative w-full overflow-hidden select-none py-1.5 sm:py-2.5 my-1 sm:my-2 ${className}`}
      role="region"
      aria-label={`${variant} promotional ribbon ticker`}
    >
      <div className="relative w-full h-[54px] sm:h-[62px] md:h-[66px] flex items-center">
        {/* Organic SVG Wavy Ribbon Background Silhouette */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-xs"
          preserveAspectRatio="none"
          viewBox="0 0 1440 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={wavePath} fill={fillColor} />
        </svg>

        {/* Scrolling Ticker Text Track */}
        <div className="relative z-10 w-full overflow-hidden flex items-center">
          <div className={`${animClass} flex items-center whitespace-nowrap`}>
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
                        className={`font-black tracking-widest text-[11px] sm:text-xs md:text-[13px] uppercase ${textColor}`}
                      >
                        {item}
                      </span>
                      <span
                        className={`mx-3 sm:mx-5 font-black text-xs sm:text-sm md:text-base select-none ${dotColor}`}
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
                        className={`font-black tracking-widest text-[11px] sm:text-xs md:text-[13px] uppercase ${textColor}`}
                      >
                        {item}
                      </span>
                      <span
                        className={`mx-3 sm:mx-5 font-black text-xs sm:text-sm md:text-base select-none ${dotColor}`}
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
