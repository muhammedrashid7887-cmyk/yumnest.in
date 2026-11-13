import React from 'react';
import { ProductCardSkeleton, CategoryCircleSkeleton } from '@/components/ui/Skeleton';

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1917] flex flex-col animate-pulse">
      {/* Top Navbar Skeleton */}
      <div className="h-20 bg-white/80 border-b border-stone-200/80 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-200" />
          <div className="h-6 w-32 bg-stone-200 rounded" />
        </div>
        <div className="hidden md:flex gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 w-16 bg-stone-200 rounded" />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-stone-200" />
          <div className="w-9 h-9 rounded-full bg-stone-200" />
        </div>
      </div>

      {/* Hero Video Banner Skeleton */}
      <div className="w-full aspect-[16/7] sm:aspect-[16/6] bg-stone-200/80 relative flex items-center justify-center">
        <div className="text-center space-y-3 px-4">
          <div className="h-8 sm:h-12 w-64 sm:w-96 bg-stone-300/60 rounded-xl mx-auto" />
          <div className="h-4 w-48 sm:w-72 bg-stone-300/40 rounded mx-auto" />
        </div>
      </div>

      {/* Category Circles Skeleton */}
      <div className="py-8 px-4 max-w-7xl mx-auto w-full space-y-4">
        <div className="h-5 w-36 bg-stone-200 rounded mx-auto" />
        <div className="flex justify-center gap-4 sm:gap-8 overflow-x-hidden py-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CategoryCircleSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Featured Products Grid Skeleton */}
      <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="space-y-2">
            <div className="h-3 w-28 bg-[#9E1B1B]/20 rounded" />
            <div className="h-7 w-48 bg-stone-200 rounded-lg" />
          </div>
          <div className="h-8 w-24 bg-stone-200 rounded-full" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
