import React from 'react';

/**
 * Base animated skeleton building block with subtle brand shimmer.
 */
export function Skeleton({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse bg-stone-200/70 rounded-md ${className}`}
      {...props}
    />
  );
}

/**
 * Product card skeleton that exactly matches ProductCard.tsx layout
 * to completely eliminate Cumulative Layout Shift (CLS).
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-3 sm:p-3.5 flex flex-col justify-between shadow-xs transition-shadow">
      {/* 1. Top Badges Row */}
      <div className="flex items-center justify-between mb-2 sm:mb-2.5 h-7">
        <Skeleton className="h-5 w-20 rounded-full bg-stone-100" />
        <Skeleton className="h-7 w-7 rounded-full bg-stone-100" />
      </div>

      {/* 2. Image Container: Exactly h-[180px] sm:h-[200px] md:h-[210px] */}
      <div className="w-full h-[180px] sm:h-[200px] md:h-[210px] rounded-xl bg-stone-100 flex items-center justify-center p-3 mb-2 sm:mb-2.5">
        <Skeleton className="w-3/4 h-3/4 rounded-lg bg-stone-200/60" />
      </div>

      {/* 3. Product Info */}
      <div className="flex flex-col flex-1 justify-between space-y-2">
        <div className="space-y-1.5">
          {/* Title - 2 lines height matching line-clamp-2 h-[38px] sm:h-[42px] */}
          <div className="h-[38px] sm:h-[42px] space-y-1">
            <Skeleton className="h-3.5 w-full rounded" />
            <Skeleton className="h-3.5 w-3/4 rounded" />
          </div>

          {/* Subtitle / Malayalam Tag */}
          <Skeleton className="h-3 w-1/2 rounded bg-stone-100" />

          {/* Rating Stars */}
          <div className="flex items-center gap-1 pt-0.5">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="w-3 h-3 rounded-full bg-stone-200/60" />
              ))}
            </div>
            <Skeleton className="h-3 w-8 rounded ml-1 bg-stone-100" />
          </div>
        </div>

        {/* 4. Action Row: Price & Add to Cart */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-5 w-14 rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * Category circle skeleton matching CategoryCircles.tsx
 */
export function CategoryCircleSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0 animate-pulse">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-stone-200/70 shadow-xs border border-stone-200/50" />
      <div className="h-3 w-14 bg-stone-200 rounded" />
    </div>
  );
}

/**
 * Admin Dashboard Stat Card Skeleton
 */
export function AdminStatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E3E9E5] p-4 sm:p-5 shadow-xs animate-pulse space-y-3">
      <div className="w-9 h-9 rounded-xl bg-slate-100" />
      <div className="space-y-1.5">
        <div className="h-3 w-20 bg-slate-200/80 rounded" />
        <div className="h-7 w-28 bg-slate-200 rounded" />
      </div>
      <div className="h-3 w-24 bg-slate-100 rounded" />
    </div>
  );
}

/**
 * Admin Table Row Skeleton
 */
export function AdminTableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <div className="h-4 bg-slate-100 rounded w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Cart Line Item Skeleton matching CartDrawer.tsx & CartPageContent.tsx
 */
export function CartLineSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-200/70 animate-pulse">
      <div className="w-16 h-16 rounded-lg bg-stone-100 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-4 w-3/4 bg-stone-200 rounded" />
        <div className="h-3 w-1/3 bg-stone-100 rounded" />
        <div className="h-4 w-16 bg-stone-200 rounded" />
      </div>
      <div className="h-7 w-16 bg-stone-100 rounded" />
    </div>
  );
}
