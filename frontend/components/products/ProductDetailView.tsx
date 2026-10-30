'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { PRODUCTS, SITE_SETTINGS } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/products/ProductCard';
import { 
  Star, 
  ShoppingBag, 
  MessageCircle, 
  Check, 
  Plus, 
  Minus, 
  ArrowRight,
  ShieldCheck,
  Leaf,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Truck,
  PackageCheck
} from 'lucide-react';

interface ProductDetailViewProps {
  product: Product;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [added, setAdded] = useState(false);

  const currentVariant =
    product.variants.find((v) => v.id === selectedVariantId) ||
    product.variants[0];

  const unitPrice = currentVariant.salePrice || currentVariant.price;
  const originalPrice = currentVariant.price;
  const hasDiscount = originalPrice > unitPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - unitPrice) / originalPrice) * 100)
    : product.discountPercentage || 0;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    addToCart(product, currentVariant.id, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const whatsappCleanNumber = SITE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(
    `Hello Yumnest! I would like to order: ${product.name} (${currentVariant.weight}) x ${quantity} = ₹${unitPrice * quantity}. Please share delivery and payment details.`
  )}`;

  // Gallery thumbnails (fallback to array of primary image if none)
  const galleryImages = (product.images && product.images.length > 0)
    ? product.images
    : [product.primaryImage];

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  // Related products (4 items per row on desktop, 2 on mobile)
  const relatedProducts = PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.isFeatured)
  ).slice(0, 4);

  return (
    <div className="bg-[#FBF9F5] text-[#1C1917] min-h-screen pb-20">
      
      {/* 1. Breadcrumbs Strip */}
      <div className="border-b border-stone-200/80 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-stone-500 overflow-x-auto whitespace-nowrap scrollbar-none">
            <Link href="/" className="hover:text-[#12372A] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link 
              href={`/products?category=${encodeURIComponent(product.category)}`}
              className="hover:text-[#12372A] transition-colors"
            >
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-stone-900 font-semibold truncate max-w-xs">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* 2. Main Product Showcase Section (Compact & Fits on Screen) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* ── LEFT: Product Image & Thumbnails (Compact) ── */}
          <div className="lg:col-span-5 flex flex-col items-center">
            
            {/* Main Product Image */}
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-square rounded-xl bg-white p-4 sm:p-6 flex items-center justify-center overflow-hidden border border-stone-200 shadow-2xs">
              {product.badge && (
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#12372A] text-[#E8AA42] text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  {product.badge}
                </span>
              )}

              <img
                src={galleryImages[activeImageIndex] || product.primaryImage}
                alt={product.name}
                className="max-h-[280px] sm:max-h-[320px] w-auto max-w-full object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Small Thumbnail Images Below with Navigation Arrows */}
            {galleryImages.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-2">
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="w-7 h-7 rounded-full border border-stone-200 hover:border-stone-400 bg-white flex items-center justify-center text-stone-600 transition-colors shrink-0 shadow-2xs cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border transition-all p-0.5 bg-white shrink-0 cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-[#12372A] ring-1 ring-[#12372A]/30 shadow-2xs'
                          : 'border-stone-200 opacity-70 hover:opacity-100 hover:border-stone-400'
                      }`}
                      aria-label={`View photo ${idx + 1}`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} angle ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNextImage}
                  className="w-7 h-7 rounded-full border border-stone-200 hover:border-stone-400 bg-white flex items-center justify-center text-stone-600 transition-colors shrink-0 shadow-2xs cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>

          {/* ── RIGHT: Details, Pricing, Features & Actions ── */}
          <div className="lg:col-span-7 space-y-2.5 sm:space-y-3 text-left">
            
            {/* Title & Reviews */}
            <div>
              <h1 className="font-serif text-xl sm:text-2xl lg:text-[1.7rem] font-bold text-stone-900 leading-tight">
                {product.name}
              </h1>

              {/* Star Rating & Review Count */}
              <div className="flex items-center gap-2 text-xs pt-1">
                <div className="flex items-center text-amber-500 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-stone-800">
                  ({product.rating || 4.8})
                </span>
                <span className="text-stone-500">
                  {product.reviewCount || 28}+ reviews
                </span>
              </div>
            </div>

            {/* Short Description */}
            <p className="text-xs text-stone-600 leading-relaxed font-normal line-clamp-2">
              {product.shortDescription}
            </p>

            {/* Product Benefit Highlights Row */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F4EFE6] text-[#12372A] text-[11px] font-semibold border border-[#E8DFC8]/60">
                <Leaf className="w-3 h-3 text-emerald-700" />
                <span>100% Pure & Natural</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F4EFE6] text-[#12372A] text-[11px] font-semibold border border-[#E8DFC8]/60">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>No Added MSG</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F4EFE6] text-[#12372A] text-[11px] font-semibold border border-[#E8DFC8]/60">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                <span>No Preservatives</span>
              </div>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-2.5 pt-1 border-t border-stone-200/60">
              <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#12372A]">
                ₹{unitPrice}.00
              </span>
              {hasDiscount && (
                <span className="text-stone-400 text-sm sm:text-base line-through">
                  ₹{originalPrice}.00
                </span>
              )}
              {hasDiscount && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* Selectable Pack Sizes with Prices */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                  Pack Size:
                </span>
                <span className="text-xs font-semibold text-[#12372A]">
                  {currentVariant.weight}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  const vPrice = v.salePrice || v.price;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#12372A] text-white border-[#12372A] shadow-2xs'
                          : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200'
                      }`}
                    >
                      {v.weight} &bull; ₹{vPrice}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-2.5 pt-0.5">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                Qty:
              </span>
              <div className="flex items-center rounded-md border border-stone-300 bg-white shadow-2xs h-8">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="px-2.5 h-full hover:bg-stone-100 text-stone-700 disabled:opacity-30 transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-2.5 text-xs font-bold text-stone-900 min-w-6 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  className="px-2.5 h-full hover:bg-stone-100 text-stone-700 transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Order on WhatsApp */}
            <div className="space-y-2 pt-1.5">
              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full py-2.5 sm:py-3 px-5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer ${
                  added
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#12372A] hover:bg-[#1A4D3B] text-white active:scale-[0.99]'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              {/* Order on WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 sm:py-2.5 px-5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.99]"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Order on WhatsApp</span>
              </a>
            </div>

          </div>

        </div>

        {/* ── 3. Additional Details Below Main Section ── */}
        <div className="mt-14 sm:mt-18 pt-10 border-t border-stone-200 space-y-8 text-left">
          
          {/* Detailed Description */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-3 shadow-2xs">
            <h2 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
              Product Description
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              {product.description || product.shortDescription}
            </p>
          </div>

          {/* Ingredients & How to Use Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3 shadow-2xs">
                <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                  Ingredients
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {product.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-[#FBF9F5] text-stone-700 text-xs font-medium border border-stone-200/70"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* How to Use */}
            {product.howToUse && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3 shadow-2xs">
                <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                  How to Use
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  {product.howToUse}
                </p>
              </div>
            )}

          </div>

        </div>

        {/* ── 4. Related Products Section (4 in 1 row on desktop, 2 on mobile) ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-14 sm:mt-20 space-y-6 border-t border-stone-200 pt-10">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#12372A]">
                Related Products
              </h2>

              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-600 hover:text-[#12372A] transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 4 Cards in one row on desktop, 2 on mobile */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
