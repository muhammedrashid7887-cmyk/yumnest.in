'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { Star, Heart, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import SpotlightCard from '@/components/ui/SpotlightCard';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, variantId: string, quantity: number) => void;
  onViewProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewProduct,
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
  const subtitle = product.subtitle || product.shortDescription;

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
    <SpotlightCard
      theme="dark"
      spotlightColor="#3a3636"
      intensity={0.15}
      spotlightSize={240}
      softness={0.7}
      shape="circle"
      borderGlow={0.6}
      proximity={80}
      smoothing={0.3}
      grain={0}
      ambient={false}
      flare
      className="group product-card-premium flex flex-col justify-between h-full rounded-xl sm:rounded-2xl p-3 sm:p-3.5 bg-white border border-[#E8DFC8] transition-all duration-300 ease-out cursor-pointer"
      style={{
        '--spotlight-card-surface': '#ffffff',
        '--spotlight-card-border': '#E8DFC8',
      } as React.CSSProperties}
    >
      
      {/* 1. Top Bar: Optional Badge on left & Wishlist Heart on top-right */}
      <div className="flex items-center justify-between w-full mb-1.5 min-h-[22px]">
        <div>
          {product.badge && product.badge.toLowerCase() !== 'curated gift box' && (
            <span className="px-2 py-0.5 rounded-full bg-[#0F5638] text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-2xs">
              {product.badge}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="ml-auto p-1 rounded-full hover:bg-stone-100 text-stone-400 hover:text-red-500 transition-colors cursor-pointer hover-btn-smooth"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'stroke-[1.75]'
            }`}
          />
        </button>
      </div>

      {/* 2. Centered Product Image */}
      <Link
        href={`/products/${product.id}`}
        className="w-full aspect-square rounded-lg bg-[#FAF7F2] flex items-center justify-center p-2 mb-2.5 overflow-hidden block transition-colors duration-300 group-hover:bg-[#F5F0E6]"
      >
        <img
          src={product.primaryImage}
          alt={product.name}
          loading="lazy"
          className="max-h-full max-w-full object-contain mx-auto transition-transform duration-500 ease-out group-hover:scale-110"
        />
      </Link>

      {/* 3. Product Info */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          {/* Product Name */}
          <Link
            href={`/products/${product.id}`}
            className="block text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-[#0F5638] transition-colors truncate mb-0.5 leading-snug tracking-normal"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Product Subtitle */}
          {subtitle && (
            <p 
              className="text-[11px] sm:text-xs text-stone-500 font-normal line-clamp-1 leading-tight mb-1 sm:mb-1.5"
              title={subtitle}
            >
              {subtitle}
            </p>
          )}

          {/* Star Rating & Review Count */}
          <div className="flex items-center gap-1 mb-2.5 sm:mb-3">
            <div className="flex items-center text-[#E8AA42] gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current stroke-none"
                />
              ))}
            </div>
            <span className="text-[11px] sm:text-xs text-stone-400 font-medium">
              ({product.reviewCount || 20})
            </span>
          </div>
        </div>

        {/* 4. Bottom Action Row: Add to Cart (Left) and Price (Right) */}
        <div className="flex items-center justify-between gap-1.5 pt-2 mt-auto border-t border-[#E8DFC8]/60">
          <button
            type="button"
            onClick={handleAdd}
            className={`rounded-lg border text-xs font-semibold tracking-wide px-2.5 sm:px-3 py-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1 hover-btn-smooth ${
              added
                ? 'bg-[#0F5638] border-[#0F5638] text-white shadow-xs'
                : 'border-stone-300 text-stone-700 bg-white group-hover:bg-[#0F5638] group-hover:border-[#0F5638] group-hover:text-white group-hover:shadow-sm hover:!bg-[#187A4F] hover:!border-[#187A4F] hover:scale-[1.03]'
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

          <span className="text-sm sm:text-base font-bold text-[#0F5638] whitespace-nowrap tracking-tight transition-transform duration-300 group-hover:scale-105">
            ₹{unitPrice}
          </span>
        </div>
      </div>

    </SpotlightCard>
  );
};

