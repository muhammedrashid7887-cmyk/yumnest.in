import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AccountLoading() {
  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#1C1917] flex flex-col animate-pulse">
      <div className="h-20 bg-white border-b border-stone-200/80 px-4 sm:px-8 flex items-center justify-between">
        <div className="h-7 w-32 bg-stone-200 rounded" />
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded bg-stone-100" />
        </div>

        {/* Search bar skeleton */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>

        {/* Order cards skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4 rounded bg-stone-100" />
                <Skeleton className="h-4 w-1/2 rounded bg-stone-100" />
              </div>
              <div className="flex justify-between pt-3 border-t border-stone-100">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-5 w-24 rounded" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
