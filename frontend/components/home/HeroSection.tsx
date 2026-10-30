'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const slides = [
  { id: 1, image: '/assets/banner1.jpeg', alt: 'Yumnest Premium Spice Products' },
  { id: 2, image: '/assets/banner2.jpeg', alt: 'Yumnest Masala & Coconut Oil Collection' },
];

export const HeroSection: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback((index: number) => {
    if (index === current) return;
    setFading(true);
    setTimeout(() => {
      setCurrent(index);
      setFading(false);
    }, 300);
  }, [current]);

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [current, goTo]);

  return (
    <section className="w-full overflow-hidden bg-[#1a1008] select-none">
      <div className="relative w-full">

        {/* Banner image — natural aspect ratio, no clipping */}
        <div className={`transition-opacity duration-400 ${fading ? 'opacity-0' : 'opacity-100'}`}>
          <img
            src={slides[current].image}
            alt={slides[current].alt}
            className="w-full block object-contain max-h-[50vw] sm:max-h-[60vw] md:max-h-[50vw] lg:max-h-[540px]"
            style={{ display: 'block' }}
          />
        </div>

        {/* Bottom bar — SHOP NOW + dots */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-1.5 sm:gap-2 py-1.5 sm:py-4 bg-gradient-to-t from-black/60 to-transparent">
          <Link
            href="/products"
            className="px-6 sm:px-12 py-1 sm:py-2.5 rounded-full bg-white hover:bg-stone-100 text-[#12372A] text-[10px] sm:text-sm font-bold uppercase tracking-widest shadow-lg transition-transform active:scale-95"
          >
            Shop Now
          </Link>

          {/* Dot indicators */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-5 h-1.5 bg-[#E8AA42]'
                    : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Prev arrow */}
        <button
          onClick={() => goTo((current - 1 + slides.length) % slides.length)}
          aria-label="Previous slide"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 hover:bg-black/55 text-white flex items-center justify-center transition-colors z-10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Next arrow */}
        <button
          onClick={() => goTo((current + 1) % slides.length)}
          aria-label="Next slide"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 hover:bg-black/55 text-white flex items-center justify-center transition-colors z-10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

      </div>
    </section>
  );
};
