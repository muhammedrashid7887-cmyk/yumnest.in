import React from 'react';

export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
      {/* Category header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-stone-200 rounded-lg" />
        <div className="h-4 w-72 bg-stone-200/70 rounded" />
      </div>

      {/* Grid of product cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-200/80 p-3 space-y-3">
            <div className="w-full aspect-square bg-stone-100 rounded-xl" />
            <div className="space-y-1.5">
              <div className="h-4 w-3/4 bg-stone-200 rounded" />
              <div className="h-3 w-1/2 bg-stone-100 rounded" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <div className="h-7 w-20 bg-stone-200 rounded-lg" />
              <div className="h-5 w-12 bg-stone-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
