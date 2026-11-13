'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/data/mockData';
import { CategoryItem } from '@/types';

interface CategoryCirclesProps {
  categories?: CategoryItem[];
  selectedCategory?: string;
  onSelectCategory?: (categoryName: string) => void;
}

export const CategoryCircles: React.FC<CategoryCirclesProps> = ({
  categories,
  selectedCategory = 'All Products',
  onSelectCategory,
}) => {
  const allCategories = categories && categories.length > 0 ? categories : CATEGORIES;
  const scrollRef = useRef<HTMLDivElement>(null);

  // 3 duplicate sets of categories for seamless manual loop
  const loopItems = [
    ...allCategories,
    ...allCategories,
    ...allCategories,
  ];

  // Initialize scroll position to the middle set on mount
  useEffect(() => {
    if (scrollRef.current) {
      const singleSetWidth = scrollRef.current.scrollWidth / 3;
      scrollRef.current.scrollLeft = singleSetWidth;
    }
  }, []);

  // Infinite manual scroll handler (invisible reset to loop indefinitely)
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth } = scrollRef.current;
    const singleSetWidth = scrollWidth / 3;

    if (scrollLeft >= singleSetWidth * 2) {
      scrollRef.current.scrollLeft = scrollLeft - singleSetWidth;
    } else if (scrollLeft <= 5) {
      scrollRef.current.scrollLeft = scrollLeft + singleSetWidth;
    }
  };

  return (
    <section
      aria-label="Category Navigation"
      className="py-4 sm:py-5 bg-[#FAF7F0] border-y border-[#E8DFC8]/60 relative select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Category Header ("head category") ── */}
        <div className="flex items-center gap-2 border-b border-[#E8DFC8]/60 pb-2.5 sm:pb-3 mb-3 sm:mb-4">
          <span className="w-1.5 h-4 sm:h-5 bg-[#0F5638] rounded-full inline-block" />
          <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-[#0F5638] tracking-tight">
            Categories
          </h2>
        </div>

      </div>

      {/* ── Manual Scroll Loop Track ── */}
      <div className="relative">
        {/* Edge Fade Masks for visual polish */}
        <div className="pointer-events-none absolute left-0 inset-y-0 w-8 sm:w-16 bg-gradient-to-r from-[#FAF7F0] via-[#FAF7F0]/85 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 inset-y-0 w-8 sm:w-16 bg-gradient-to-l from-[#FAF7F0] via-[#FAF7F0]/85 to-transparent z-10" />

        {/* Manual Scrolling Track: Single Line, Loop, No Icons, No Border Box */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none flex-nowrap whitespace-nowrap px-6 sm:px-10 py-1 cursor-grab active:cursor-grabbing"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {loopItems.map((cat, idx) => {
            const isSelected = selectedCategory === cat.name;
            const href =
              cat.name === 'All Products'
                ? '/products'
                : `/products?category=${encodeURIComponent(cat.name)}`;

            return (
              <div key={`${cat.name}-${idx}`} className="inline-flex items-center gap-6 sm:gap-8 shrink-0">
                <Link
                  href={href}
                  onClick={(e) => {
                    if (onSelectCategory) {
                      e.preventDefault();
                      onSelectCategory(cat.name);
                    }
                  }}
                  className={`py-1 text-xs sm:text-sm md:text-[15px] tracking-wide transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'text-[#0F5638] font-extrabold border-b-2 border-[#0F5638]'
                      : 'text-stone-600 hover:text-[#0F5638] font-semibold border-b-2 border-transparent hover:border-stone-300'
                  }`}
                >
                  <span>{cat.name}</span>
                </Link>

                {/* Subtle dot separator */}
                <span className="text-stone-300 font-normal text-xs select-none" aria-hidden="true">
                  •
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryCircles;
