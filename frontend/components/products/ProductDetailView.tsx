

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { PRODUCTS, SITE_SETTINGS } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ProductCard } from '@/components/products/ProductCard';
import {
  Star,
  ShoppingCart,
  Check,
  Plus,
  Minus,
  ArrowRight,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  Leaf,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface ProductDetailViewProps {
  product: Product;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [added, setAdded] = useState(false);
  const isWishlisted = isInWishlist(product.id);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const currentVariant =
    product.variants.find((v) => v.id === selectedVariantId) ||
    product.variants[0];

  const displayTitle = product.name.replace(/[()]/g, '');

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
  const productOrderMessage = `🌿 *YUMNEST FOODS & SPICES* 🌿\n_Direct Product Order_\n━━━━━━━━━━━━━━━━━━━━━\n✨ *I would like to order:*\n🌶️ *${product.name}*\n   ▸ Pack: ${currentVariant.weight}\n   ▸ Quantity: ${quantity}\n   ▸ Price: ₹${unitPrice * quantity}\n━━━━━━━━━━━━━━━━━━━━━\n📦 _Please confirm stock availability and share payment (UPI / GPay) & delivery details._ 🙏`;
  const whatsappUrl = `https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(productOrderMessage)}`;

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

      {/* ── Main Product Section (Matching Reference Screenshot 1) ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-8 lg:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ── LEFT: Product Gallery (Vertical Thumbnails on Desktop, Horizontal on Mobile) ── */}
          <div className="lg:col-span-6 w-full">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">

              {/* Thumbnail Strip: order-2 on mobile (under main image), order-1 on desktop (left of main image) */}
              {galleryImages.length > 0 && (
                <div className="order-2 sm:order-1 flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto w-full sm:w-20 lg:w-22 scrollbar-none py-1 sm:py-0 shrink-0">
                  {galleryImages.map((imgUrl, idx) => {
                    const isActive = activeImageIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-14 h-14 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-xl overflow-hidden border p-1 bg-white shrink-0 cursor-pointer transition-all ${isActive
                          ? 'border-2 border-[#0F5638] shadow-xs ring-1 ring-[#0F5638]/20'
                          : 'border-stone-200 hover:border-stone-400 opacity-75 hover:opacity-100'
                          }`}
                        aria-label={`View image ${idx + 1}`}
                      >
                        <img
                          src={imgUrl}
                          alt={`${product.name} angle ${idx + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Main Product Image Card: order-1 on mobile, order-2 on desktop */}
              <div className="order-1 sm:order-2 relative flex-1 w-full aspect-square rounded-2xl sm:rounded-3xl bg-white border border-stone-200/80 shadow-xs flex items-center justify-center p-4 sm:p-8 overflow-hidden group">

                {/* Best Seller Badge (Top-Left) */}
                {(product.badge || product.isBestSeller) && (
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                    <span className="inline-block px-3 py-1 rounded-md sm:rounded-lg bg-[#0F5638] text-white text-[11px] sm:text-xs font-semibold tracking-wide shadow-xs">
                      {product.badge || 'Best Seller'}
                    </span>
                  </div>
                )}

                {/* Main Image with Contain Aspect Ratio */}
                <img
                  src={galleryImages[activeImageIndex] || product.primaryImage}
                  alt={displayTitle}
                  className="w-full h-full object-contain max-h-[380px] sm:max-h-[440px] transition-transform duration-300 group-hover:scale-105"
                  style={{ objectFit: 'contain' }}
                />

                {/* Quick Prev/Next Arrow Buttons */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-sm border border-stone-200/80 flex items-center justify-center transition-opacity opacity-70 hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-sm border border-stone-200/80 flex items-center justify-center transition-opacity opacity-70 hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

              </div>

            </div>
          </div>

          {/* ── RIGHT: Product Information (Matching Reference Screenshot 1) ── */}
          <div className="lg:col-span-6 w-full space-y-3 sm:space-y-4 text-left">

            {/* Breadcrumbs at the Top */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-stone-400 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
              <Link href="/" className="hover:text-[#0F5638] transition-colors">
                Home
              </Link>
              <span className="text-stone-300">›</span>
              <Link href="/products" className="hover:text-[#0F5638] transition-colors">
                Products
              </Link>
              <span className="text-stone-300">›</span>
              <Link
                href={`/products?category=${encodeURIComponent(product.category)}`}
                className="hover:text-[#0F5638] transition-colors"
              >
                {product.category}
              </Link>
              <span className="text-stone-300">›</span>
              <span className="text-stone-700 font-medium truncate max-w-[200px]">
                {displayTitle}
              </span>
            </nav>

            {/* Product Title (Prominent serif display font) */}
            <h1 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-serif font-bold text-[#0F5638] leading-tight tracking-tight">
              {displayTitle}
            </h1>

            {/* Product Subtitle */}
            <p className="text-stone-500 text-xs sm:text-sm font-normal leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Star Rating & Review Count */}
            <div className="flex items-center gap-2 pt-0.5 text-xs sm:text-sm">
              <div className="flex items-center text-amber-500 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-semibold text-stone-800">
                {product.rating || 4.8}
              </span>
              <span className="text-stone-400 font-normal">
                ({product.reviewCount || 65} reviews)
              </span>
            </div>

            {/* Price Display */}
            <div className="flex items-baseline gap-2 pt-1 sm:pt-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#0F5638] tracking-tight">
                ₹ {unitPrice}
              </span>
              <span className="text-stone-400 text-xs sm:text-sm font-normal">
                ({currentVariant.weight})
              </span>
              {hasDiscount && (
                <span className="text-stone-400 text-xs sm:text-sm line-through ml-1">
                  ₹ {originalPrice}
                </span>
              )}
              {hasDiscount && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] sm:text-xs font-bold border border-emerald-200/60 ml-1">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* Product Description */}
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed pt-1 max-w-xl font-normal">
              {product.description || product.shortDescription}
            </p>

            {/* Weight / Pack-Size Selection Options */}
            <div className="pt-2 space-y-2">
              <div className="text-xs sm:text-sm font-semibold text-stone-800">
                Weight
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`py-2 px-3.5 sm:px-4 rounded-lg text-xs sm:text-sm font-medium border transition-all cursor-pointer ${isSelected
                        ? 'bg-[#0F5638] text-white border-[#0F5638] shadow-xs font-semibold'
                        : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
                        }`}
                    >
                      {v.weight}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Controls & Add to Cart Button Row */}
            <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-4">

              {/* Quantity Controls */}
              <div className="flex items-center rounded-lg border border-stone-200 bg-white h-11 px-3 gap-3 shadow-2xs shrink-0">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="text-stone-500 hover:text-stone-800 disabled:opacity-30 transition-colors p-1 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs sm:text-sm font-semibold text-stone-900 min-w-5 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  className="text-stone-500 hover:text-stone-800 transition-colors p-1 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 h-11 px-6 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${added
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#0F5638] hover:bg-[#187A4F] text-white active:scale-[0.99]'
                  }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

            </div>

            {/* Secondary Actions: Wishlist & WhatsApp Direct */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`inline-flex items-center gap-1.5 text-xs sm:text-sm transition-colors cursor-pointer py-1 ${
                  isWishlisted ? 'text-red-600 font-semibold' : 'text-stone-500 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{isWishlisted ? 'Added to Favorites' : 'Add to Favorites'}</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-950 transition-colors py-1"
              >
                <img src="/assets/whatsapp-icon.png" alt="WhatsApp" className="w-4 h-4 object-contain shrink-0" />
                <span>Order via WhatsApp</span>
              </a>
            </div>

            {/* Subtle Highlights: 100% Pure, No MSG, No Preservatives */}
            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-stone-200/60">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F4EFE6] text-[#0F5638] text-xs font-medium border border-[#E8DFC8]/60">
                <Leaf className="w-3 h-3 text-emerald-700" />
                <span>100% Pure & Natural</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F4EFE6] text-[#0F5638] text-xs font-medium border border-[#E8DFC8]/60">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>No Added MSG</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F4EFE6] text-[#0F5638] text-xs font-medium border border-[#E8DFC8]/60">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                <span>No Preservatives</span>
              </div>
            </div>

          </div>

        </div>


        {/* ── Related Products Section (4 in 1 row on desktop, 2 on mobile) ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 sm:mt-16 space-y-6 border-t border-stone-200 pt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F5638] tracking-tight leading-tight">
                Related Products
              </h2>

              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-600 hover:text-[#0F5638] transition-colors"
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

      {/* ── Fullscreen Zoom Lightbox Modal ── */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer z-10"
              aria-label="Close zoom preview"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Zoomed Image */}
            <div className="w-full flex items-center justify-center overflow-hidden max-h-[75vh]">
              <img
                src={galleryImages[activeImageIndex] || product.primaryImage}
                alt={product.name}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Navigation controls if multiple images */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="w-8 h-8 rounded-full border border-stone-200 hover:border-stone-400 bg-white flex items-center justify-center text-stone-700 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-stone-500 font-medium">
                  {activeImageIndex + 1} of {galleryImages.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="w-8 h-8 rounded-full border border-stone-200 hover:border-stone-400 bg-white flex items-center justify-center text-stone-700 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
