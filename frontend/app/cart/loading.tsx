import React from 'react';
import { CartLineSkeleton } from '@/components/ui/Skeleton';

export default function CartLoading() {
  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#1C1917] flex flex-col animate-pulse">
      {/* Top Navbar Skeleton */}
      <div className="h-20 bg-white border-b border-stone-200/80 px-4 sm:px-8 flex items-center justify-between">
        <div className="h-7 w-32 bg-stone-200 rounded" />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-44 bg-stone-200 rounded-lg" />
          <div className="h-4 w-60 bg-stone-100 rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Line Items */}
          <div className="lg:col-span-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <CartLineSkeleton key={i} />
            ))}
          </div>

          {/* Order Summary Box */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
              <div className="h-6 w-36 bg-stone-200 rounded" />
              <div className="space-y-2.5 pt-2 border-t border-stone-100">
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-stone-100 rounded" />
                  <div className="h-4 w-16 bg-stone-100 rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-stone-100 rounded" />
                  <div className="h-4 w-14 bg-stone-100 rounded" />
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-100">
                  <div className="h-5 w-24 bg-stone-200 rounded" />
                  <div className="h-5 w-20 bg-stone-200 rounded" />
                </div>
              </div>
              <div className="h-12 w-full bg-stone-200 rounded-full mt-4" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
