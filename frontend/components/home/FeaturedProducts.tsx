'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { PRODUCTS } from '@/data/mockData';
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
  selectedCategory = 'All Products',
  onAddToCart,
  onViewProduct,
}) => {
  const activeProducts = products && products.length > 0 ? products : PRODUCTS;

  return (
    <section id="products" className="py-7 sm:py-10 lg:py-12 bg-[#EAE0E0] border-y border-[#D5C9C9] reveal-on-scroll relative">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-8 space-y-4 sm:space-y-6">
        
        {/* Section Header: Title & View All */}
        <div className="flex items-center justify-between border-b border-[#D5C9C9] pb-3 sm:pb-4 px-1">
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

          {/* View All Button */}
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-white text-[#0F5638] border border-[#0F5638]/20 hover:bg-[#0F5638] hover:text-white transition-all hover-btn-smooth shadow-2xs group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 2 Products in 1 row on mobile (maximum width, reduced gap, no overflow) & 4 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
          {activeProducts.map((product) => (
            <div key={product.id} className="w-full h-full flex flex-col">
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
