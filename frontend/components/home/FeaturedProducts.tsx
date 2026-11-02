'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';
import { ArrowRight } from 'lucide-react';

interface FeaturedProductsProps {
  products: Product[];
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
  onAddToCart?: (product: Product, variantId: string, quantity: number) => void;
  onViewProduct?: (product: Product) => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  onAddToCart,
}) => {
  // Show 8 products (4 per row on desktop, 2 per row on mobile)
  const displayProducts = products.slice(0, 8);

  return (
    <section id="products" className="py-8 sm:py-16 bg-[#FBF9F5] reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-7">
        
        {/* Section Header with "Featured Products" and "View All ->" */}
        <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-3.5 sm:pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0F5638] tracking-tight leading-tight">
              Featured Products
            </h2>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0F5638] hover:text-[#187A4F] transition-all duration-200 tracking-normal hover-btn-smooth group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4 Cards per row on desktop, 2 on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
