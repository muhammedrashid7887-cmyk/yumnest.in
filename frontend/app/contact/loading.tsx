import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ContactLoading() {
  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#1C1917] flex flex-col animate-pulse">
      <div className="h-20 bg-white border-b border-stone-200/80 px-4 sm:px-8 flex items-center justify-between">
        <div className="h-7 w-32 bg-stone-200 rounded" />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <Skeleton className="h-4 w-32 rounded mx-auto" />
          <Skeleton className="h-9 w-64 rounded-lg mx-auto" />
          <Skeleton className="h-4 w-80 rounded mx-auto bg-stone-100" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Contact Details Card */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6">
            <Skeleton className="h-6 w-48 rounded" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-24 rounded bg-stone-100" />
                    <Skeleton className="h-4 w-48 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Image / Form */}
          <div className="aspect-[4/3] rounded-3xl bg-stone-200/60" />
        </div>
      </main>
    </div>
  );
}
