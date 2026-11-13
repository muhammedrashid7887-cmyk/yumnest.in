'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface FeaturedProductsProps {
  products: Product[];
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
  onAddToCart?: (product: Product, variantId: string, quantity: number) => void;
  onViewProduct?: (product: Product) => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  selectedCategory = 'All Products',
  onAddToCart,
  onViewProduct,
}) => {
  const activeProducts = React.useMemo(() => {
    if (!products || products.length === 0) return [];
    if (selectedCategory && selectedCategory !== 'All Products' && selectedCategory !== 'cat-all') {
      const filtered = products.filter((p) => {
        const catName = typeof p.category === 'object' && p.category !== null ? (p.category as { name?: string }).name || '' : String(p.category || '');
        return catName.toLowerCase() === selectedCategory.toLowerCase();
      });
      return filtered.length > 0 ? filtered : products;
    }
    return products;
  }, [products, selectedCategory]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!activeProducts || activeProducts.length === 0) {
    return (
      <section id="products" className="py-7 sm:py-10 lg:py-12 bg-[#E6CECE] border-y border-[#D8BEBE] reveal-on-scroll relative">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-8 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between border-b border-[#D8BEBE] pb-3 sm:pb-4 px-1">
            <div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#9E1B1B]">
                {selectedCategory !== 'All Products' ? selectedCategory : 'Our Signature Range'}
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0F5638] tracking-tight leading-tight">
                Featured Products
              </h2>
              <div className="w-12 h-1 bg-[#0F5638] rounded-full mt-1.5" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-7 sm:py-10 lg:py-12 bg-[#E6CECE] border-y border-[#D8BEBE] reveal-on-scroll relative" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-8 space-y-4 sm:space-y-6">
        
        {/* Section Header: Title, Scroll Controls & View All */}
        <div className="flex items-center justify-between border-b border-[#D8BEBE] pb-3 sm:pb-4 px-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#9E1B1B]">
                {selectedCategory !== 'All Products' ? selectedCategory : 'Our Signature Range'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0F5638] tracking-tight leading-tight">
              Featured Products
            </h2>
            <div className="w-12 h-1 bg-[#0F5638] rounded-full mt-1.5" />
          </div>

          {/* Action Group: Manual Scroll Buttons & View All */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-[#D8BEBE] hover:border-[#0F5638] text-stone-700 hover:text-[#0F5638] flex items-center justify-center shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Scroll products left"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-[#D8BEBE] hover:border-[#0F5638] text-stone-700 hover:text-[#0F5638] flex items-center justify-center shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Scroll products right"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-white text-[#0F5638] border border-[#0F5638]/20 hover:bg-[#0F5638] hover:text-white transition-all hover-btn-smooth shadow-2xs group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Strictly 1 Row Horizontal Scroll (manual scrolling + touch swipe) */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-2.5 sm:gap-3.5 md:gap-4 pb-3 pt-1 -mx-2.5 px-2.5 sm:-mx-4 sm:px-4 lg:-mx-8 lg:px-8 touch-pan-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {activeProducts.map((product) => (
            <div
              key={product.id}
              className="shrink-0 snap-start w-[calc(48%-6px)] min-w-[160px] max-w-[210px] sm:max-w-none sm:w-[220px] md:w-[250px] lg:w-[275px] flex flex-col"
            >
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                onViewProduct={onViewProduct}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturedProducts;
