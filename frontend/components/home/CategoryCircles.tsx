'use client';

import React, { useRef } from 'react';
import { CATEGORIES } from '@/data/mockData';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryCirclesProps {
  selectedCategory?: string;
  onSelectCategory?: (categoryName: string) => void;
}

export const CategoryCircles: React.FC<CategoryCirclesProps> = ({
  selectedCategory = 'All Products',
  onSelectCategory,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Exclude 'All Products' from the category row so specific food categories are displayed
  const circleCategories = CATEGORIES.filter((c) => c.id !== 'cat-all');

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-5 sm:py-12 bg-[#FBF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-5">
        
        {/* Section Header with Accent Bar & Navigation Arrows */}
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-stone-200/80">
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className="text-sm sm:text-lg md:text-xl font-bold tracking-wider text-stone-900 uppercase font-sans">
              Shop by Categories
            </h2>
            <span className="w-5 sm:w-8 h-[2px] bg-[#12372A] inline-block rounded-full" />
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Previous categories"
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-stone-300 hover:border-[#12372A] hover:bg-white flex items-center justify-center text-stone-600 hover:text-[#12372A] transition-all cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Next categories"
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-stone-300 hover:border-[#12372A] hover:bg-white flex items-center justify-center text-stone-600 hover:text-[#12372A] transition-all cursor-pointer shadow-2xs"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Clean Horizontal Category Cards Row */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2 sm:gap-3.5 overflow-x-auto scroll-smooth py-1 scrollbar-none [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {circleCategories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory?.(cat.name)}
                className={`group flex flex-col items-center justify-between shrink-0 w-24 sm:w-32 md:w-36 h-28 sm:h-36 p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-all duration-200 cursor-pointer focus:outline-none bg-white text-center ${
                  isSelected
                    ? 'border-[#12372A] ring-1 ring-[#12372A] shadow-xs'
                    : 'border-stone-200 hover:border-[#12372A]/70 hover:shadow-xs'
                }`}
              >
                {/* Small, Neat Category Image */}
                <div className="w-full flex-1 flex items-center justify-center p-0.5 sm:p-1 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Category Name */}
                <p
                  className={`text-xs sm:text-[13px] font-medium leading-tight text-center line-clamp-1 transition-colors w-full px-1 ${
                    isSelected
                      ? 'text-[#12372A] font-bold'
                      : 'text-stone-700 group-hover:text-[#12372A]'
                  }`}
                  title={cat.name}
                >
                  {cat.name}
                </p>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};

