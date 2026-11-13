import React from 'react';
import { CategoryCircleSkeleton, ProductCardSkeleton } from '@/components/ui/Skeleton';

export default function CategoriesLoading() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1917] flex flex-col animate-pulse">
      {/* Top Navbar Skeleton */}
      <div className="h-20 bg-white border-b border-stone-200/80 px-4 sm:px-8 flex items-center justify-between">
        <div className="h-7 w-32 bg-stone-200 rounded" />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="space-y-2 text-center max-w-xl mx-auto">
          <div className="h-8 w-56 bg-stone-200 rounded-lg mx-auto" />
          <div className="h-4 w-72 bg-stone-100 rounded mx-auto" />
        </div>

        {/* Categories circles row */}
        <div className="flex justify-center gap-4 sm:gap-8 py-4 overflow-x-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CategoryCircleSkeleton key={i} />
          ))}
        </div>

        {/* Product preview cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-6">
          {[1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
