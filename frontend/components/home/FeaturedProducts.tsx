'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { PRODUCTS } from '@/data/mockData';
import { ProductCard } from '@/components/products/ProductCard';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Always show all products in one complete horizontal line
  const activeProducts = products && products.length > 0 ? products : PRODUCTS;

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [activeProducts]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section id="products" className="pt-6 pb-4 sm:pt-9 sm:pb-5 bg-[#FBF9F5] reveal-on-scroll relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        
        {/* Section Header: Title + Navigation Controls + View All */}
        <div className="flex items-center justify-between border-b border-[#E8DFC8]/80 pb-3.5 sm:pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#E8AA42]">
                {selectedCategory !== 'All Products' ? selectedCategory : 'Our Signature Range'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0F5638] tracking-tight leading-tight">
              Featured Products
            </h2>
            <div className="w-12 h-1 bg-[#0F5638] rounded-full mt-1.5" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Carousel Previous / Next Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                aria-label="Previous products"
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-700 transition-all cursor-pointer shadow-2xs hover-btn-smooth ${
                  canScrollLeft
                    ? 'hover:border-[#0F5638] hover:text-[#0F5638] active:scale-95'
                    : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                aria-label="Next products"
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-700 transition-all cursor-pointer shadow-2xs hover-btn-smooth ${
                  canScrollRight
                    ? 'hover:border-[#0F5638] hover:text-[#0F5638] active:scale-95'
                    : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            {/* View All Button */}
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#F0F7F4] text-[#0F5638] border border-[#0F5638]/20 hover:bg-[#E2EFE9] transition-all hover-btn-smooth group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 1 Single Line Layout: All products in one clean, horizontal scrolling row */}
        <div className="relative">
          {/* Subtle Fade Edge Gradients */}
          {canScrollLeft && (
            <div className="pointer-events-none absolute left-0 inset-y-0 w-8 sm:w-12 bg-gradient-to-r from-[#FBF9F5] to-transparent z-10" />
          )}
          {canScrollRight && (
            <div className="pointer-events-none absolute right-0 inset-y-0 w-8 sm:w-12 bg-gradient-to-l from-[#FBF9F5] to-transparent z-10" />
          )}

          <div
            ref={scrollRef}
            className="flex items-stretch overflow-x-auto gap-3.5 sm:gap-4 md:gap-5 pb-3 pt-1 scroll-smooth scrollbar-none snap-x snap-mandatory"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {activeProducts.map((product) => (
              <div
                key={product.id}
                className="w-[190px] sm:w-[230px] md:w-[250px] lg:w-[265px] shrink-0 snap-start flex flex-col"
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

      </div>
    </section>
  );
};

export default FeaturedProducts;
