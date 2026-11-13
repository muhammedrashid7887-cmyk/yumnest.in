import React from 'react';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1C1917] animate-pulse">
      {/* Top Navbar Skeleton Placeholder */}
      <div className="h-20 bg-white border-b border-stone-200/80 px-4 sm:px-8 flex items-center justify-between">
        <div className="h-7 w-32 bg-stone-200 rounded" />
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-stone-100" />
          <div className="w-8 h-8 rounded-full bg-stone-100" />
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-12">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 bg-stone-200/70 rounded w-48" />

        {/* Product Layout Grid: 5 cols gallery + 7 cols details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Gallery Skeleton */}
          <div className="lg:col-span-5 space-y-4">
            <div className="w-full aspect-square bg-stone-100 rounded-3xl border border-stone-200/60 flex items-center justify-center p-8">
              <div className="w-3/4 h-3/4 bg-stone-200/50 rounded-2xl" />
            </div>
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-20 h-20 bg-stone-100 rounded-2xl border border-stone-200/60" />
              ))}
            </div>
          </div>

          {/* Right: Product Specification Skeleton */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="h-5 w-28 bg-[#0F5638]/10 rounded-full" />
              <div className="h-9 w-3/4 bg-stone-200 rounded-lg" />
              <div className="h-4 w-48 bg-stone-100 rounded" />
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-2">
              <div className="h-8 w-32 bg-stone-200 rounded" />
              <div className="h-3 w-40 bg-stone-100 rounded" />
            </div>

            {/* Pack Size Selectors */}
            <div className="space-y-2">
              <div className="h-3.5 w-24 bg-stone-200 rounded" />
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 bg-stone-100 rounded-xl border border-stone-200/60" />
                ))}
              </div>
            </div>

            {/* Action Buttons: Add to Cart + WhatsApp Order */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <div className="h-12 flex-1 bg-stone-200 rounded-full" />
              <div className="h-12 flex-1 bg-[#25D366]/20 rounded-full" />
            </div>

            {/* Product description paragraph */}
            <div className="space-y-2 pt-4 border-t border-stone-100">
              <div className="h-3.5 w-full bg-stone-100 rounded" />
              <div className="h-3.5 w-5/6 bg-stone-100 rounded" />
              <div className="h-3.5 w-2/3 bg-stone-100 rounded" />
            </div>
          </div>
        </div>

        {/* Related Products Skeleton */}
        <div className="pt-12 border-t border-stone-200 space-y-6">
          <div className="h-6 w-44 bg-stone-200 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
