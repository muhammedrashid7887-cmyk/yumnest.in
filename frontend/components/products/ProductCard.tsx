'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { Star, Heart, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, variantId: string, quantity: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
}) => {
  const cartContext = useCart();
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const defaultVariant = product.variants?.[0] || {
    id: 'default',
    weight: '250g',
    price: 250,
    salePrice: undefined,
    stock: 10,
  };
  const unitPrice = defaultVariant.salePrice || defaultVariant.price;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product, defaultVariant.id, 1);
    } else {
      cartContext.addToCart(product, defaultVariant.id, 1);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="group relative flex flex-col justify-between h-full bg-white rounded-lg sm:rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-xs transition-all duration-200 p-2.5 sm:p-3.5">
      
      {/* 1. Top Bar: Optional Badge on left & Wishlist Heart on top-right */}
      <div className="flex items-center justify-between w-full mb-1">
        <div>
          {product.badge && (
            <span className="px-1.5 py-0.5 rounded bg-[#12372A]/10 text-[#12372A] text-[9px] font-semibold">
              {product.badge}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="ml-auto p-1 text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'stroke-[1.75]'
            }`}
          />
        </button>
      </div>

      {/* 2. Centered Product Image (Consistent Aspect Ratio) */}
      <Link
        href={`/products/${product.id}`}
        className="w-full aspect-square flex items-center justify-center p-1 sm:p-2 mb-2 overflow-hidden block"
      >
        <img
          src={product.primaryImage}
          alt={product.name}
          loading="lazy"
          className="max-h-full max-w-full object-contain mx-auto group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* 3. Product Info */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          {/* Product Name */}
          <Link
            href={`/products/${product.id}`}
            className="block text-xs sm:text-[13px] font-semibold text-stone-900 hover:text-[#12372A] transition-colors truncate mb-1 leading-snug"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Star Rating & Review Count */}
          <div className="flex items-center gap-1 mb-2.5 sm:mb-3">
            <div className="flex items-center text-red-500 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current stroke-none"
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-[11px] text-stone-400 font-medium">
              ({product.reviewCount || 20})
            </span>
          </div>
        </div>

        {/* 4. Bottom Action Row: Add to Cart (Left) and Price (Right) */}
        <div className="flex items-center justify-between gap-1.5 pt-1 mt-auto border-t border-stone-100">
          <button
            type="button"
            onClick={handleAdd}
            className={`rounded-md border text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              added
                ? 'bg-[#12372A] border-[#12372A] text-white'
                : 'border-stone-300 hover:border-[#12372A] text-stone-700 hover:text-[#12372A] hover:bg-stone-50'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? (
              <>
                <Check className="w-3 h-3 stroke-[2.5]" />
                <span>Added</span>
              </>
            ) : (
              'Add to Cart'
            )}
          </button>

          <span className="text-xs sm:text-sm font-bold text-[#12372A] whitespace-nowrap">
            ₹{unitPrice}
          </span>
        </div>
      </div>

    </div>
  );
};

