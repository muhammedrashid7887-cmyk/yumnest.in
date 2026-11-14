'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { Star, Heart, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { getConsistentProductImageUrl } from '@/lib/utils/product-image';

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
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);

  const isWishlisted = isInWishlist(product.id);

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
    toggleWishlist(product);
  };

  return (
    <SpotlightCard
      theme="dark"
      spotlightColor="#3a3636"
      intensity={0.12}
      spotlightSize={260}
      softness={0.7}
      shape="circle"
      borderGlow={0.5}
      proximity={80}
      smoothing={0.3}
      grain={0}
      ambient={false}
      flare
      className="group product-card-premium flex flex-col justify-between h-full rounded-2xl p-2 sm:p-2.5 md:p-3 bg-white border border-[#E8DFC8]/90 shadow-xs hover:shadow-md transition-all duration-300 ease-out cursor-pointer w-full"
      style={{
        '--spotlight-card-surface': '#ffffff',
        '--spotlight-card-border': '#E8DFC8',
      } as React.CSSProperties}
    >
      
      {/* 1. Top Bar: Optional Badge on left & Wishlist Heart on top-right */}
      <div className="flex items-center justify-between w-full mb-1.5 min-h-[22px]">
        <div>
          {product.badge && product.badge.trim() && (
            <span className="px-2 py-0.5 rounded-full bg-[#0F5638] text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-2xs">
              {product.badge}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={isWishlisted ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
          title={isWishlisted ? 'Remove from favorites' : 'Add to favorites'}
          className={`ml-auto w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover-btn-smooth ${
            isWishlisted
              ? 'bg-red-50 text-red-500 hover:bg-red-100 shadow-2xs'
              : 'bg-stone-100/80 hover:bg-red-50 text-stone-400 hover:text-red-500'
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 active:scale-125 ${
              isWishlisted ? 'fill-red-500 text-red-500 scale-105' : 'stroke-[1.8]'
            }`}
          />
        </button>
      </div>

      {/* 2. Centered Product Image inside Fixed-Size Container */}
      <Link
        href={`/products/${product.id}`}
        className="w-full h-[180px] sm:h-[200px] md:h-[210px] rounded-xl bg-white flex items-center justify-center p-1 sm:p-1.5 mb-2 sm:mb-2.5 overflow-hidden transition-transform duration-300 relative group/img"
      >
        <img
          src={getConsistentProductImageUrl(product.primaryImage)}
          alt={product.name}
          loading="lazy"
          decoding="async"
          width={300}
          height={300}
          className="w-full h-full max-h-full max-w-full object-contain mx-auto transition-transform duration-300 ease-out group-hover:scale-105"
          style={{ objectFit: 'contain' }}
        />
      </Link>

      {/* 3. Product Info */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          {/* Product Name - 2 lines allowed with uniform height */}
          <Link
            href={`/products/${product.id}`}
            className="block text-[13.5px] sm:text-[15px] font-bold text-stone-900 group-hover:text-[#0F5638] transition-colors line-clamp-2 h-[38px] sm:h-[42px] mb-1 leading-snug tracking-normal"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Product Subtitle - uniform 1-line height */}
          <p 
            className="text-[11px] sm:text-xs text-stone-500 font-normal line-clamp-1 leading-tight h-[16px] mb-1.5"
            title={subtitle || ''}
          >
            {subtitle || '\u00A0'}
          </p>

          {/* Star Rating & Review Count */}
          <div className="flex items-center gap-1 mb-2.5 sm:mb-3 h-[18px]">
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
        <div className="flex items-center justify-between gap-1 pt-2 mt-auto border-t border-[#E8DFC8]/70">
          {!product.inStock ? (
            <span className="rounded-lg border border-stone-200 bg-stone-100 text-stone-500 text-[11px] sm:text-xs font-semibold px-2.5 py-1.5 cursor-not-allowed whitespace-nowrap">
              Out of Stock
            </span>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className={`rounded-lg border text-[11px] sm:text-xs md:text-[13px] font-semibold tracking-wide px-2 sm:px-2.5 md:px-3 py-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1 hover-btn-smooth ${
                added
                  ? 'bg-[#0F5638] border-[#0F5638] text-white shadow-xs'
                  : 'border-stone-300 text-stone-700 bg-white group-hover:bg-[#0F5638] group-hover:border-[#0F5638] group-hover:text-white group-hover:shadow-sm hover:!bg-[#187A4F] hover:!border-[#187A4F] hover:scale-[1.03]'
              }`}
              aria-label={`Add ${product.name} to cart`}
            >
              {added ? (
                <>
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                  <span>Added</span>
                </>
              ) : (
                'Add to Cart'
              )}
            </button>
          )}

          <span className="text-xs sm:text-sm md:text-base font-bold text-[#0F5638] whitespace-nowrap tracking-tight transition-transform duration-300 group-hover:scale-105">
            ₹{unitPrice}
          </span>
        </div>
      </div>

    </SpotlightCard>
  );
};

