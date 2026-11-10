'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Heart,
  Star,
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
  
  // Show 5 featured products matching the reference mockup
  const displayProducts = products.length >= 5 ? products.slice(0, 5) : products;

  // Active spotlight product (index 2 / center card by default, matching mockup)
  const [activeIdx, setActiveIdx] = useState<number>(() => {
    return displayProducts.length >= 3 ? 2 : 0;
  });

  const activeProduct = displayProducts[activeIdx] || displayProducts[0];
  const variants = activeProduct?.variants || [];

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    variants[0]?.id || ''
  );
  const [selectedPack, setSelectedPack] = useState<string>('Standard Pack');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToBasket, setAddedToBasket] = useState(false);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

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

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + displayProducts.length) % displayProducts.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % displayProducts.length);
  };

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  return (
    <section id="products" className="py-8 sm:py-14 bg-[#FBF9F5] reveal-on-scroll relative overflow-hidden">
      {/* Background Decorative Leaf Accents matching mockup */}
      <div
        className="pointer-events-none absolute -left-8 -top-8 w-32 h-32 sm:w-44 sm:h-44 opacity-25"
        style={{
          background: 'radial-gradient(circle at top left, #2E7D32 0%, transparent 70%)',
          filter: 'blur(16px)',
        }}
      />
      <div
        className="pointer-events-none absolute -right-8 -bottom-8 w-32 h-32 sm:w-44 sm:h-44 opacity-25"
        style={{
          background: 'radial-gradient(circle at bottom right, #2E7D32 0%, transparent 70%)',
          filter: 'blur(16px)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 relative z-10">
        
        {/* Section Header with "Featured Products" and "View All ->" */}
        <div className="flex items-center justify-between border-b border-[#E8DFC8]/80 pb-3.5 sm:pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0F5638] tracking-tight leading-tight">
              Featured Products
            </h2>
            <div className="w-12 h-1 bg-[#0F5638] rounded-full mt-1.5" />
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-[#F0F7F4] text-[#0F5638] border border-[#0F5638]/20 hover:bg-[#E2EFE9] transition-all hover-btn-smooth group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Desktop 5-Card Layout with Popped Up Center Orange Card */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-3.5 xl:gap-4 items-center">
          {displayProducts.map((product, idx) => {
            const isActive = idx === activeIdx;

            if (isActive) {
              return (
                <div
                  key={product.id}
                  className="relative -my-3 sm:-my-4 z-20 rounded-3xl p-5 bg-gradient-to-b from-[#FFA726] via-[#FF9800] to-[#F57C00] text-white shadow-2xl shadow-orange-500/35 border border-white/30 flex flex-col justify-between transition-all duration-300 scale-[1.03]"
                  style={{ minHeight: '440px' }}
                >
                  {/* Top Image Row with Previous / Next Chevrons */}
                  <div className="relative flex items-center justify-between w-full mb-1">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="p-1.5 rounded-full hover:bg-white/20 text-white transition-all hover:scale-110 active:scale-95 cursor-pointer z-10"
                      aria-label="Previous product"
                    >
                      <ChevronLeft className="w-6 h-6 stroke-[3]" />
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
                      className="p-1.5 rounded-full hover:bg-white/20 text-white transition-all hover:scale-110 active:scale-95 cursor-pointer z-10"
                      aria-label="Next product"
                    >
                      <ChevronRight className="w-6 h-6 stroke-[3]" />
                    </button>
                  </div>

                  {/* Title */}
                  <div className="text-center mb-2.5">
                    <Link
                      href={`/products/${product.id}`}
                      className="text-base sm:text-lg font-black text-white hover:underline line-clamp-1 tracking-tight"
                    >
                      {product.name}
                    </Link>
                  </div>

                  {/* Option Dropdown Rows */}
                  <div className="space-y-2 mb-3 bg-black/10 rounded-2xl p-2.5 border border-white/15">
                    {/* Size / Weight Option */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white text-[11px] uppercase tracking-wider">
                        Size
                      </span>
                      <div className="relative">
                        <select
                          value={currentVariant.id}
                          onChange={(e) => setSelectedVariantId(e.target.value)}
                          className="appearance-none bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-lg pl-2.5 pr-6 py-1 border border-white/25 cursor-pointer focus:outline-none"
                        >
                          {variants.map((v) => (
                            <option key={v.id} value={v.id} className="text-stone-900 bg-white">
                              {v.weight || 'Standard'}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-white absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Pack / Type Option */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white text-[11px] uppercase tracking-wider">
                        Pack
                      </span>
                      <div className="relative">
                        <select
                          value={selectedPack}
                          onChange={(e) => setSelectedPack(e.target.value)}
                          className="appearance-none bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-lg pl-2.5 pr-6 py-1 border border-white/25 cursor-pointer focus:outline-none"
                        >
                          <option value="Standard Pack" className="text-stone-900 bg-white">Standard Pack</option>
                          <option value="Eco Pouch" className="text-stone-900 bg-white">Eco Pouch</option>
                          <option value="Gift Box" className="text-stone-900 bg-white">Gift Box</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-white absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Quantity Option */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white text-[11px] uppercase tracking-wider">
                        Quantity
                      </span>
                      <div className="relative">
                        <select
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="appearance-none bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-lg pl-2.5 pr-6 py-1 border border-white/25 cursor-pointer focus:outline-none"
                        >
                          {[1, 2, 3, 4, 5, 8].map((n) => (
                            <option key={n} value={n} className="text-stone-900 bg-white">
                              {n}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-white absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Vibrant Action Button: "ADD TO BASKET" */}
                  <button
                    type="button"
                    onClick={handleActiveAddToCart}
                    className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#FF007A] to-[#E91E63] hover:from-[#E6006E] hover:to-[#D81B60] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-pink-600/35 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {addedToBasket ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>ADDED TO BASKET!</span>
                      </>
                    ) : (
                      <span>ADD TO BASKET • ₹{unitPrice * quantity}</span>
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
                style={{ minHeight: '390px' }}
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

        {/* Mobile & Tablet Layout (< lg): Prominent Orange Pop-Up Card + Horizontal Cards Row */}
        <div className="lg:hidden space-y-4">
          {/* Spotlight Orange Pop-Up Card */}
          <div className="relative rounded-3xl p-5 bg-gradient-to-b from-[#FFA726] via-[#FF9800] to-[#F57C00] text-white shadow-2xl shadow-orange-500/35 border border-white/30 flex flex-col justify-between max-w-md mx-auto">
            {/* Top Image Row with Previous / Next Chevrons */}
            <div className="relative flex items-center justify-between w-full mb-1">
              <button
                type="button"
                onClick={handlePrev}
                className="p-2 rounded-full hover:bg-white/20 text-white transition-all active:scale-90 cursor-pointer z-10"
                aria-label="Previous product"
              >
                <ChevronLeft className="w-6 h-6 stroke-[3]" />
              </button>

              <Link
                href={`/products/${activeProduct.id}`}
                className="relative w-28 h-28 mx-auto flex items-center justify-center p-1"
              >
                <img
                  src={activeProduct.primaryImage}
                  alt={activeProduct.name}
                  className="max-h-full max-w-full object-contain filter drop-shadow-md"
                />
              </Link>

              <button
                type="button"
                onClick={handleNext}
                className="p-2 rounded-full hover:bg-white/20 text-white transition-all active:scale-90 cursor-pointer z-10"
                aria-label="Next product"
              >
                <ChevronRight className="w-6 h-6 stroke-[3]" />
              </button>
            </div>

            {/* Title */}
            <div className="text-center mb-2.5">
              <Link
                href={`/products/${activeProduct.id}`}
                className="text-base sm:text-lg font-black text-white hover:underline line-clamp-1 tracking-tight"
              >
                {activeProduct.name}
              </Link>
            </div>

            {/* Option Dropdown Rows */}
            <div className="space-y-2 mb-3 bg-black/10 rounded-2xl p-2.5 border border-white/15">
              {/* Size Option */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white text-[11px] uppercase tracking-wider">
                  Size
                </span>
                <div className="relative">
                  <select
                    value={currentVariant.id}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="appearance-none bg-white/20 text-white font-semibold text-xs rounded-lg pl-2.5 pr-6 py-1 border border-white/25 focus:outline-none"
                  >
                    {variants.map((v) => (
                      <option key={v.id} value={v.id} className="text-stone-900 bg-white">
                        {v.weight || 'Standard'}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-white absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Pack Option */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white text-[11px] uppercase tracking-wider">
                  Pack
                </span>
                <div className="relative">
                  <select
                    value={selectedPack}
                    onChange={(e) => setSelectedPack(e.target.value)}
                    className="appearance-none bg-white/20 text-white font-semibold text-xs rounded-lg pl-2.5 pr-6 py-1 border border-white/25 focus:outline-none"
                  >
                    <option value="Standard Pack" className="text-stone-900 bg-white">Standard Pack</option>
                    <option value="Eco Pouch" className="text-stone-900 bg-white">Eco Pouch</option>
                    <option value="Gift Box" className="text-stone-900 bg-white">Gift Box</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-white absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Quantity Option */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white text-[11px] uppercase tracking-wider">
                  Quantity
                </span>
                <div className="relative">
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="appearance-none bg-white/20 text-white font-semibold text-xs rounded-lg pl-2.5 pr-6 py-1 border border-white/25 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 8].map((n) => (
                      <option key={n} value={n} className="text-stone-900 bg-white">
                        {n}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-white absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Vibrant Action Button: "ADD TO BASKET" */}
            <button
              type="button"
              onClick={handleActiveAddToCart}
              className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#FF007A] to-[#E91E63] hover:from-[#E6006E] hover:to-[#D81B60] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-pink-600/35 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              {addedToBasket ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>ADDED TO BASKET!</span>
                </>
              ) : (
                <span>ADD TO BASKET • ₹{unitPrice * quantity}</span>
              )}
            </button>
          </div>

          {/* Horizontal Scrollable Thumbnails of Products */}
          <div className="flex overflow-x-auto gap-3 pb-2 pt-1 scrollbar-none snap-x snap-mandatory">
            {displayProducts.map((product, idx) => {
              const isCurrent = idx === activeIdx;
              return (
                <div
                  key={product.id}
                  onClick={() => setActiveIdx(idx)}
                  className={`min-w-[150px] sm:min-w-[180px] snap-start rounded-2xl p-2.5 bg-white border transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-[#FFA726] shadow-md ring-2 ring-[#FFA726]/40'
                      : 'border-[#E8DFC8] shadow-xs'
                  }`}
                >
                  <div className="w-full aspect-square rounded-lg bg-[#FAF7F2] flex items-center justify-center p-1.5 mb-1.5">
                    <img
                      src={product.primaryImage}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 truncate">
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-bold text-[#0F5638]">
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
