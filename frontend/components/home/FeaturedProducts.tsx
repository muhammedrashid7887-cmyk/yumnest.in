'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Heart,
  Star,
  ShoppingBag,
} from 'lucide-react';

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
  const { addToCart } = useCart();
  
  // Show 5 featured products matching the showcase layout
  const displayProducts = products.length >= 5 ? products.slice(0, 5) : products;

  // Active spotlight product (index 2 / center card by default)
  const [activeIdx, setActiveIdx] = useState<number>(() => {
    return displayProducts.length >= 3 ? 2 : 0;
  });

  const activeProduct = displayProducts[activeIdx] || displayProducts[0];
  const variants = activeProduct?.variants || [];

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    variants[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToBasket, setAddedToBasket] = useState(false);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  // Touch swipe support for mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Sync selected variant whenever active product changes
  useEffect(() => {
    if (activeProduct && activeProduct.variants && activeProduct.variants.length > 0) {
      setSelectedVariantId(activeProduct.variants[0].id);
    }
    setQuantity(1);
    setAddedToBasket(false);
  }, [activeIdx, activeProduct]);

  if (!activeProduct) return null;

  const currentVariant =
    variants.find((v) => v.id === selectedVariantId) ||
    variants[0] || {
      id: 'default',
      price: 140,
      salePrice: undefined,
      weight: '100g',
      stock: 10,
    };

  const unitPrice = currentVariant.salePrice || currentVariant.price;

  const handleActiveAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(activeProduct, currentVariant.id, quantity);
    } else {
      addToCart(activeProduct, currentVariant.id, quantity);
    }
    setAddedToBasket(true);
    setTimeout(() => setAddedToBasket(false), 1800);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + displayProducts.length) % displayProducts.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % displayProducts.length);
  };

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // Touch gesture handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      // Swiped left -> next
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> prev
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section id="products" className="py-8 sm:py-14 bg-[#FBF9F5] reveal-on-scroll relative overflow-hidden">
      {/* Background Subtle Heritage Accents */}
      <div
        className="pointer-events-none absolute -left-12 -top-12 w-48 h-48 sm:w-64 sm:h-64 opacity-20"
        style={{
          background: 'radial-gradient(circle at top left, #0F5638 0%, transparent 70%)',
          filter: 'blur(24px)',
        }}
      />
      <div
        className="pointer-events-none absolute -right-12 -bottom-12 w-48 h-48 sm:w-64 sm:h-64 opacity-20"
        style={{
          background: 'radial-gradient(circle at bottom right, #E8AA42 0%, transparent 70%)',
          filter: 'blur(24px)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-7 relative z-10">
        
        {/* Section Header with "Featured Products" and "View All ->" */}
        <div className="flex items-center justify-between border-b border-[#E8DFC8]/80 pb-3.5 sm:pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#E8AA42]">Handpicked</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0F5638] tracking-tight leading-tight">
              Featured Products
            </h2>
            <div className="w-12 h-1 bg-[#0F5638] rounded-full mt-1.5" />
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-[#F0F7F4] text-[#0F5638] border border-[#0F5638]/20 hover:bg-[#E2EFE9] transition-all hover-btn-smooth group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ========================================================
            DESKTOP 5-CARD SHOWCASE (>= lg)
            Deep Heritage Forest Green & Gold Spotlight Card in Center
           ======================================================== */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-3.5 xl:gap-4 items-center">
          {displayProducts.map((product, idx) => {
            const isActive = idx === activeIdx;

            if (isActive) {
              return (
                <div
                  key={product.id}
                  className="relative -my-3 sm:-my-4 z-20 rounded-3xl p-5 bg-gradient-to-b from-[#0F5638] via-[#0C472E] to-[#083321] text-white shadow-2xl shadow-[#0F5638]/30 border border-[#E8AA42]/35 flex flex-col justify-between transition-all duration-300 scale-[1.03]"
                  style={{ minHeight: '450px' }}
                >
                  {/* Badge & Top Navigation */}
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E8AA42]/20 border border-[#E8AA42]/40 text-[#E8AA42] text-[10px] font-extrabold uppercase tracking-wider">
                      {product.badge || 'SPOTLIGHT'}
                    </span>
                    <span className="text-[11px] text-white/60 font-medium">
                      {idx + 1} of {displayProducts.length}
                    </span>
                  </div>

                  {/* Top Image Row with Previous / Next Chevrons */}
                  <div className="relative flex items-center justify-between w-full my-1">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15 z-10"
                      aria-label="Previous product"
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    <Link
                      href={`/products/${product.id}`}
                      className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto flex items-center justify-center p-1 group"
                      title="View product details"
                    >
                      <img
                        src={product.primaryImage}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15 z-10"
                      aria-label="Next product"
                    >
                      <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Title & Category */}
                  <div className="text-center mb-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="text-base sm:text-lg font-black text-white hover:text-[#E8AA42] transition-colors line-clamp-1 tracking-tight"
                    >
                      {product.name}
                    </Link>
                    <p className="text-[11px] text-[#E8DFC8]/75 line-clamp-1 mt-0.5">
                      {product.malayalamName || product.category}
                    </p>
                  </div>

                  {/* Price Tag */}
                  <div className="text-center mb-2">
                    <span className="text-xl sm:text-2xl font-black text-[#E8AA42] tracking-tight">
                      ₹{unitPrice}
                    </span>
                    {currentVariant.salePrice && currentVariant.price > currentVariant.salePrice && (
                      <span className="text-xs text-white/50 line-through ml-2">
                        ₹{currentVariant.price}
                      </span>
                    )}
                  </div>

                  {/* Variant Selection Pills */}
                  <div className="space-y-2 mb-3 bg-black/20 rounded-2xl p-2.5 border border-white/10">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-[#E8DFC8] text-[10px] uppercase tracking-wider">
                        Pack Size:
                      </span>
                      <span className="text-[10px] text-white/70">
                        {currentVariant.weight}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {variants.map((v) => {
                        const isSel = v.id === currentVariant.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setSelectedVariantId(v.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isSel
                                ? 'bg-[#E8AA42] text-[#0A3D27] shadow-xs scale-105'
                                : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/15'
                            }`}
                          >
                            {v.weight || 'Standard'}
                          </button>
                        );
                      })}
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-xs">
                      <span className="font-bold text-[#E8DFC8] text-[10px] uppercase tracking-wider">
                        Quantity:
                      </span>
                      <div className="inline-flex items-center bg-white/10 rounded-full border border-white/15 p-0.5">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white hover:bg-white/20 active:scale-90 transition-all font-bold text-xs"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white hover:bg-white/20 active:scale-90 transition-all font-bold text-xs"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Golden Spice Action Button */}
                  <button
                    type="button"
                    onClick={handleActiveAddToCart}
                    className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#E8AA42] to-[#D99427] hover:from-[#F0B654] hover:to-[#E8AA42] text-[#0A3D27] font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {addedToBasket ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>ADDED TO BASKET!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>ADD TO BASKET • ₹{unitPrice * quantity}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            }

            // Normal White Product Card (No hover border)
            return (
              <div
                key={product.id}
                onClick={() => setActiveIdx(idx)}
                className="group relative flex flex-col justify-between h-full rounded-2xl p-3 sm:p-3.5 bg-white border border-[#E8DFC8] shadow-xs hover:shadow-md transition-all duration-300 ease-out cursor-pointer"
                style={{ minHeight: '400px' }}
              >
                {/* Top Badge & Heart */}
                <div className="flex items-center justify-between w-full mb-1 min-h-[22px]">
                  {product.badge ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#0F5638] text-white text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                      {product.badge}
                    </span>
                  ) : <span />}

                  <button
                    type="button"
                    onClick={(e) => toggleWishlist(product.id, e)}
                    aria-label="Wishlist"
                    className="p-1 rounded-full text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        wishlist[product.id] ? 'fill-red-500 text-red-500' : 'stroke-[1.75]'
                      }`}
                    />
                  </button>
                </div>

                {/* Centered Image */}
                <div className="w-full aspect-square rounded-xl bg-[#FAF7F2] flex items-center justify-center p-2 mb-2 overflow-hidden">
                  <img
                    src={product.primaryImage}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#0F5638] transition-colors line-clamp-1 mb-0.5">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-stone-500 line-clamp-1 mb-1.5">
                      {product.shortDescription || product.category}
                    </p>
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex items-center text-[#E8AA42] gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 fill-current stroke-none" />
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-400 font-medium">
                        ({product.reviewCount || 42})
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action Row: Add to Cart and Price */}
                  <div className="flex items-center justify-between gap-1 pt-2 mt-auto border-t border-[#E8DFC8]/60">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const vId = product.variants[0]?.id || '';
                        if (onAddToCart) {
                          onAddToCart(product, vId, 1);
                        } else {
                          addToCart(product, vId, 1);
                        }
                      }}
                      className="rounded-full border border-stone-300 text-stone-700 hover:bg-[#0F5638] hover:border-[#0F5638] hover:text-white px-2.5 py-1 text-xs font-semibold transition-all hover-btn-smooth cursor-pointer"
                    >
                      Add to Cart
                    </button>
                    <span className="text-xs sm:text-sm font-bold text-[#0F5638]">
                      ₹{product.variants?.[0]?.salePrice || product.variants?.[0]?.price || 140}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================================================
            MOBILE & TABLET RESPONSIVE VIEW (< lg)
            Touch-Swipeable Forest & Gold Card + Instant Tap Thumbnails
           ======================================================== */}
        <div className="lg:hidden space-y-4">
          {/* Swipeable Spotlight Card */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative rounded-3xl p-4 sm:p-5 bg-gradient-to-b from-[#0F5638] via-[#0C472E] to-[#083321] text-white shadow-xl shadow-[#0F5638]/25 border border-[#E8AA42]/35 flex flex-col justify-between max-w-sm sm:max-w-md mx-auto transition-all duration-300"
          >
            {/* Top Navigation Row */}
            <div className="flex items-center justify-between w-full mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E8AA42]/20 border border-[#E8AA42]/40 text-[#E8AA42] text-[10px] font-extrabold uppercase tracking-wider">
                {activeProduct.badge || 'FEATURED'}
              </span>

              {/* Prev / Next Small Arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePrev()}
                  className="w-7 h-7 rounded-full bg-white/10 active:bg-white/20 text-white flex items-center justify-center transition-all border border-white/15"
                  aria-label="Previous product"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] text-white/70 font-semibold px-1">
                  {activeIdx + 1}/{displayProducts.length}
                </span>
                <button
                  type="button"
                  onClick={() => handleNext()}
                  className="w-7 h-7 rounded-full bg-white/10 active:bg-white/20 text-white flex items-center justify-center transition-all border border-white/15"
                  aria-label="Next product"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Product Image Area */}
            <Link
              href={`/products/${activeProduct.id}`}
              className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto flex items-center justify-center p-1 my-1"
            >
              <img
                src={activeProduct.primaryImage}
                alt={activeProduct.name}
                className="max-h-full max-w-full object-contain filter drop-shadow-md"
              />
            </Link>

            {/* Product Title & Malayalam */}
            <div className="text-center mb-1">
              <Link
                href={`/products/${activeProduct.id}`}
                className="text-base sm:text-lg font-black text-white hover:text-[#E8AA42] transition-colors line-clamp-1 tracking-tight"
              >
                {activeProduct.name}
              </Link>
              <p className="text-[11px] text-[#E8DFC8]/80 line-clamp-1">
                {activeProduct.malayalamName || activeProduct.category}
              </p>
            </div>

            {/* Price Row */}
            <div className="text-center mb-2.5">
              <span className="text-xl font-black text-[#E8AA42] tracking-tight">
                ₹{unitPrice}
              </span>
              {currentVariant.salePrice && currentVariant.price > currentVariant.salePrice && (
                <span className="text-xs text-white/50 line-through ml-2">
                  ₹{currentVariant.price}
                </span>
              )}
            </div>

            {/* Tap-Friendly Weight Selection Pills */}
            <div className="space-y-2 mb-3 bg-black/20 rounded-2xl p-2.5 border border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#E8DFC8] text-[10px] uppercase tracking-wider">
                  Weight / Pack:
                </span>
                <span className="text-[10px] text-white/70">
                  {currentVariant.weight}
                </span>
              </div>

              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {variants.map((v) => {
                  const isSel = v.id === currentVariant.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        isSel
                          ? 'bg-[#E8AA42] text-[#0A3D27] shadow-xs scale-105'
                          : 'bg-white/10 text-white/80 active:bg-white/20 border border-white/15'
                      }`}
                    >
                      {v.weight || 'Standard'}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Quantity Stepper */}
              <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-xs">
                <span className="font-bold text-[#E8DFC8] text-[10px] uppercase tracking-wider">
                  Quantity:
                </span>
                <div className="inline-flex items-center bg-white/10 rounded-full border border-white/15 p-0.5">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white active:bg-white/20 font-bold text-xs"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white active:bg-white/20 font-bold text-xs"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Add to Basket Button */}
            <button
              type="button"
              onClick={handleActiveAddToCart}
              className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#E8AA42] to-[#D99427] active:from-[#D99427] active:to-[#C6831F] text-[#0A3D27] font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              {addedToBasket ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>ADDED TO BASKET!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>ADD TO BASKET • ₹{unitPrice * quantity}</span>
                </>
              )}
            </button>
          </div>

          {/* Navigation Dots Indicator for Mobile */}
          <div className="flex items-center justify-center gap-1.5 py-1">
            {displayProducts.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  i === activeIdx
                    ? 'w-6 h-1.5 bg-[#0F5638]'
                    : 'w-1.5 h-1.5 bg-stone-300 hover:bg-stone-400'
                }`}
                aria-label={`Go to product ${i + 1}`}
              />
            ))}
          </div>

          {/* Mobile Tap-to-Switch Product Thumbnails */}
          <div className="flex overflow-x-auto gap-2.5 pb-2 pt-1 scrollbar-none snap-x snap-mandatory">
            {displayProducts.map((product, idx) => {
              const isCurrent = idx === activeIdx;
              return (
                <div
                  key={product.id}
                  onClick={() => setActiveIdx(idx)}
                  className={`min-w-[130px] sm:min-w-[160px] snap-start rounded-2xl p-2.5 bg-white border transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-[#0F5638] shadow-sm ring-2 ring-[#0F5638]/20 bg-[#F4F9F5]'
                      : 'border-[#E8DFC8] shadow-xs'
                  }`}
                >
                  <div className="w-full aspect-square rounded-lg bg-stone-50 flex items-center justify-center p-1.5 mb-1.5">
                    <img
                      src={product.primaryImage}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <h4 className="text-[11px] sm:text-xs font-bold text-stone-900 truncate">
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] sm:text-xs font-bold text-[#0F5638]">
                      ₹{product.variants?.[0]?.salePrice || product.variants?.[0]?.price || 140}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">
                      ★ {product.rating || '4.9'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
