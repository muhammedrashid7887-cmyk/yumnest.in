'use client';

import React from 'react';
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

  // Extract category names (only names, as requested)
  const categoryNames = allCategories.map((c) => c.name);

  // Duplicate items 4 times to ensure seamless infinite right-to-left loop on all screen widths
  const loopItems = [
    ...categoryNames,
    ...categoryNames,
    ...categoryNames,
    ...categoryNames,
  ];

  const handleClick = (name: string) => {
    onSelectCategory?.(name);
    const target = document.getElementById('products');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      aria-label="Product Categories Ticker"
      className="py-3.5 sm:py-5 bg-[#FBF9F5] border-y border-[#E8DFC8]/60 overflow-hidden relative select-none"
    >
      {/* Symmetrical Left and Right Edge Fade Masks */}
      <div className="pointer-events-none absolute left-0 inset-y-0 w-14 sm:w-28 bg-gradient-to-r from-[#FBF9F5] via-[#FBF9F5]/85 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 inset-y-0 w-14 sm:w-28 bg-gradient-to-l from-[#FBF9F5] via-[#FBF9F5]/85 to-transparent z-10" />

      {/* Infinite Right-to-Left Continuous Scrolling Loop */}
      <div
        className="flex items-center animate-marquee-rtl whitespace-nowrap hover:[animation-play-state:paused]"
        style={{ animationDuration: '30s' }}
      >
        {loopItems.map((catName, idx) => {
          const isSelected = selectedCategory === catName;
          return (
            <div key={`${catName}-${idx}`} className="inline-flex items-center">
              <button
                type="button"
                onClick={() => handleClick(catName)}
                className={`inline-flex items-center px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F5638] text-[#E8AA42] shadow-sm scale-105 border border-[#0F5638]'
                    : 'bg-white text-stone-700 hover:text-[#0F5638] hover:bg-[#F0F7F4] border border-[#E8DFC8] shadow-2xs hover:scale-105 active:scale-95'
                }`}
              >
                <span>{catName}</span>
              </button>

              {/* Decorative separator between category names */}
              <span className="mx-3 sm:mx-4 text-[#E8AA42] text-xs font-black select-none">
                ✦
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryCircles;
