'use client';

import React from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/data/mockData';
import { CategoryItem } from '@/types';
import { ArrowRight } from 'lucide-react';

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

  return (
    <section
      aria-label="Category Navigation"
      className="py-5 sm:py-6 bg-[#0D0D0D] text-white border-y border-stone-800/80 overflow-hidden relative select-none"
    >
      {/* Category Section Heading */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 sm:mb-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2.5 sm:pb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 sm:h-5 bg-[#E8AA42] rounded-full inline-block" />
            <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-white tracking-tight">
              Categories
            </h2>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#E8AA42] hover:text-[#f5c16c] transition-colors group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Symmetrical Left and Right Edge Fade Masks */}
      <div className="pointer-events-none absolute left-0 inset-y-0 w-12 sm:w-24 bg-gradient-to-r from-[#0D0D0D] via-[#0D0D0D]/85 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 inset-y-0 w-12 sm:w-24 bg-gradient-to-l from-[#0D0D0D] via-[#0D0D0D]/85 to-transparent z-10" />

      {/* Infinite Right-to-Left Continuous Scrolling Loop */}
      <div
        className="flex items-center animate-marquee-continuous-rtl whitespace-nowrap"
        style={{ animationDuration: '32s' }}
      >
        {loopItems.map((catName, idx) => {
          const isSelected = selectedCategory === catName;
          const href =
            catName === 'All Products'
              ? '/products'
              : `/products?category=${encodeURIComponent(catName)}`;

          return (
            <div key={`${catName}-${idx}`} className="inline-flex items-center">
              {/* Click to go directly to that category */}
              <Link
                href={href}
                onClick={() => onSelectCategory?.(catName)}
                className={`inline-flex items-center px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F5638] text-white shadow-xs scale-105 border border-[#229A64]'
                    : 'bg-stone-900/90 text-stone-200 hover:text-white hover:bg-stone-800 border border-stone-800 hover:border-[#E8AA42]/60 shadow-2xs hover:scale-105 active:scale-95'
                }`}
              >
                <span>{catName}</span>
              </Link>

              {/* Normal dot separator between category names */}
              <span className="mx-2.5 sm:mx-3 text-[#E8AA42]/80 font-bold select-none text-sm sm:text-base leading-none">
                .
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryCircles;
