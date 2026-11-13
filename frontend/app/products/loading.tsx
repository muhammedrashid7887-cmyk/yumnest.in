import React from 'react';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Header skeleton */}
      <div className="bg-white border-b border-stone-200/90 py-6 px-4">
        <div className="max-w-7xl xl:max-w-[1440px] mx-auto animate-pulse space-y-3">
          <div className="h-4 bg-stone-100 rounded w-28" />
          <div className="h-8 bg-stone-200 rounded-lg w-52" />
          <div className="h-4 bg-stone-100 rounded max-w-sm" />
        </div>
      </div>

      {/* Product grid skeleton matching exact ProductCard dimensions */}
      <div className="bg-[#FAF7F0] py-8 px-4">
        <div className="max-w-7xl xl:max-w-[1440px] mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
