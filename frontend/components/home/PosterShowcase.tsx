'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface PosterItem {
  image: string;
  title: string;
  subtitle?: string;
  alt?: string;
}

interface PosterShowcaseProps {
  items: PosterItem[];
}

export const PosterShowcase: React.FC<PosterShowcaseProps> = ({ items }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasCompletedOneRound, setHasCompletedOneRound] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState<PosterItem | null>(null);

  // Auto-scroll: scrolls through all images once, smoothly returns to the start, and stops.
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || hasCompletedOneRound) return;

    let animId: number;
    let isReturning = false;

    const step = () => {
      if (isPaused || hasCompletedOneRound || !el) {
        animId = requestAnimationFrame(step);
        return;
      }

      if (!isReturning) {
        el.scrollLeft += 1.2;
        const maxScroll = el.scrollWidth - el.clientWidth;

        // When all images have been scrolled through once:
        if (el.scrollLeft >= maxScroll - 4) {
          isReturning = true;
          // Pause briefly at the end, then smoothly scroll back to the start and stop
          setTimeout(() => {
            if (el) {
              el.scrollTo({ left: 0, behavior: 'smooth' });
              setTimeout(() => {
                setHasCompletedOneRound(true);
              }, 900);
            }
          }, 1200);
        }
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [hasCompletedOneRound, isPaused]);

  // Manual scroll with navigation arrows
  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = 320;
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section
      aria-label="Signature Visual Gallery"
      className="w-full py-8 sm:py-12 bg-[#FBF9F5] overflow-hidden select-none"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Navigation Arrows */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F5638]/10 text-[#0F5638] text-xs font-bold uppercase tracking-wider">
              <span>✦</span>
              <span>Signature Range</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Flavours of Authenticity
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E8DFC8] shadow-xs flex items-center justify-center text-stone-700 hover:text-white hover:bg-[#0F5638] hover:border-[#0F5638] transition-colors cursor-pointer"
              aria-label="Previous posters"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E8DFC8] shadow-xs flex items-center justify-center text-stone-700 hover:text-white hover:bg-[#0F5638] hover:border-[#0F5638] transition-colors cursor-pointer"
              aria-label="Next posters"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Standard Horizontal Poster Scroll Track without page overflow */}
        <div
          ref={scrollContainerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex items-start gap-5 sm:gap-6 overflow-x-auto no-scrollbar pb-4 pt-1 px-1 scroll-smooth"
        >
          {items.map((item, idx) => (
            <div
              key={`${item.image}-${idx}`}
              onClick={() => setSelectedPoster(item)}
              className="group shrink-0 w-[240px] sm:w-[270px] md:w-[290px] flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1"
            >
              {/* Clean Upright Poster Image Card */}
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-sm border border-[#E8DFC8]/70 group-hover:shadow-xl group-hover:border-[#0F5638]/40 transition-all duration-300">
                <img
                  src={item.image}
                  alt={item.alt || item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Standard Clean Single Text (No redundant bottom boxes) */}
              <div className="w-full text-center mt-3 px-1">
                <h4 className="text-sm sm:text-base font-bold text-[#0F5638] tracking-tight group-hover:text-[#187A4F] transition-colors">
                  {item.title}
                </h4>
                {item.subtitle && (
                  <p className="text-xs text-stone-500 font-normal mt-0.5 line-clamp-1">
                    {item.subtitle}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clean Single Image Lightbox (Standard, no duplicate bottom box) */}
      {selectedPoster && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedPoster(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPoster(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-full max-h-[70vh] rounded-xl overflow-hidden bg-stone-100">
              <img
                src={selectedPoster.image}
                alt={selectedPoster.alt || selectedPoster.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="mt-3 text-center">
              <h4 className="text-base sm:text-lg font-bold text-[#0F5638]">
                {selectedPoster.title}
              </h4>
              {selectedPoster.subtitle && (
                <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                  {selectedPoster.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PosterShowcase;
