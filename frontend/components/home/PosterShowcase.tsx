'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';

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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Update arrow states based on scroll position
  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  // One-round smooth auto-scroll:
  // Scrolls through all poster images once to the end, then stops.
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || hasCompletedOneRound) return;

    let animId: number;
    let isStopped = false;

    // Observe when the section is in view before starting auto-scroll
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) {
          setIsPaused(true);
        } else if (!hasCompletedOneRound) {
          setIsPaused(false);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);

    const step = () => {
      if (isStopped || hasCompletedOneRound || !el) return;

      if (!isPaused) {
        el.scrollLeft += 1.2;
        updateScrollState();

        const maxScroll = el.scrollWidth - el.clientWidth;
        // When scrolled completely to the end, stop permanently
        if (el.scrollLeft >= maxScroll - 3) {
          isStopped = true;
          setHasCompletedOneRound(true);
          updateScrollState();
          return;
        }
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animId);
    };
  }, [hasCompletedOneRound, isPaused, updateScrollState]);

  // Manual scroll with arrow controls
  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsPaused(true);
    setHasCompletedOneRound(true); // User manual interaction takes over
    const scrollAmount = direction === 'left' ? -320 : 320;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(updateScrollState, 350);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPoster(null);
    };
    if (selectedPoster) {
      window.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = 'unset';
    };
  }, [selectedPoster]);

  return (
    <section
      aria-label="Signature Visual Gallery"
      className="w-full py-6 sm:py-10 bg-[#FBF9F5] border-t border-[#E8DFC8]/60 overflow-hidden select-none"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Navigation Controls */}
        <div className="flex items-end justify-between mb-5 sm:mb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0F5638]/10 text-[#0F5638] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#C87A14]" />
              <span>Signature Range</span>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0F5638] tracking-tight">
              Flavours of Authenticity
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 font-normal">
              Pure Kerala spices, cold-pressed oils, and artisanal masala blends.
            </p>
          </div>

          {/* Left/Right Smooth Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E8DFC8] shadow-xs flex items-center justify-center text-stone-700 hover:text-white hover:bg-[#0F5638] hover:border-[#0F5638] disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
              aria-label="Previous posters"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E8DFC8] shadow-xs flex items-center justify-center text-stone-700 hover:text-white hover:bg-[#0F5638] hover:border-[#0F5638] disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
              aria-label="Next posters"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clean Standard Poster Horizontal Track - Zero Page Overflow */}
        <div
          ref={scrollContainerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            if (!hasCompletedOneRound) setIsPaused(false);
          }}
          onTouchStart={() => {
            setIsPaused(true);
            setHasCompletedOneRound(true);
          }}
          onScroll={updateScrollState}
          className="flex items-start gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-3 pt-1 px-1 scroll-smooth"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {items.map((item, idx) => (
            <div
              key={`${item.image}-${idx}`}
              onClick={() => setSelectedPoster(item)}
              className="group shrink-0 w-[220px] sm:w-[260px] md:w-[280px] flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1"
            >
              {/* Upright Clean Poster Image Card (No tilt, no 3D distortion) */}
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-sm border border-[#E8DFC8]/80 group-hover:shadow-xl group-hover:border-[#0F5638]/40 transition-all duration-300">
                <img
                  src={item.image}
                  alt={item.alt || item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Standard Clean Single Text Label (No duplicate bottom box) */}
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

      {/* Clean Single Image Lightbox (Standard, Simple, No redundant bottom boxes) */}
      {selectedPoster && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedPoster(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPoster(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-100 hover:bg-[#0F5638] hover:text-white text-stone-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-full max-h-[70vh] rounded-xl overflow-hidden bg-stone-50">
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
                <p className="text-xs sm:text-sm text-stone-600 mt-0.5 font-normal">
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
