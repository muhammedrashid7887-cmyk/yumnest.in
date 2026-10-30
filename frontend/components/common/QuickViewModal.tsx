'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { X, Star, ShoppingBag, MessageCircle, Check, Plus, Minus, ArrowRight } from 'lucide-react';
import { SITE_SETTINGS } from '@/data/mockData';
import { useCart } from '@/context/CartContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart?: (product: Product, variantId: string, quantity: number) => void;
}

const QuickViewModalContent: React.FC<{
  product: Product;
  onClose: () => void;
  onAddToCart?: (product: Product, variantId: string, quantity: number) => void;
}> = ({ product, onClose, onAddToCart }) => {
  const { addToCart } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string>(product.primaryImage);
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

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(product, currentVariant.id, quantity);
    } else {
      addToCart(product, currentVariant.id, quantity);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const whatsappCleanNumber = SITE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(
    `Hello Yumnest! I would like to order: ${product.name} (${currentVariant.weight}) x ${quantity} = ₹${unitPrice * quantity}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" 
      />

      <div className="min-h-full flex items-center justify-center p-4 text-center sm:p-6">
        <div className="relative w-full max-w-3xl bg-[#FBF9F5] rounded-3xl overflow-hidden shadow-2xl text-left border border-[#E8DFC8] my-8 animate-in zoom-in-95 duration-200">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-stone-700 shadow transition-colors"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
            
            {/* Left: Images */}
            <div className="md:col-span-5 space-y-3">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-[#E8DFC8] shadow-sm">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#12372A] text-[#E8AA42] text-[11px] font-black uppercase tracking-wider shadow">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Thumbnails if multiple images exist */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === img ? 'border-[#12372A] shadow-sm' : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Nutrition & Specs Quick Box */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFC8] text-xs space-y-1.5">
                <p className="font-bold text-stone-800">Nutrition Highlights (per 100g):</p>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-stone-600">
                  <span>Energy: {product.nutrition.calories}</span>
                  <span>Protein: {product.nutrition.protein}</span>
                  <span>Fat: {product.nutrition.fat}</span>
                  <span>Carbs: {product.nutrition.carbs}</span>
                </div>
              </div>
            </div>

            {/* Right: Details & Order Controls */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#8C6D46]">
                    {product.category}
                  </span>
                  {product.malayalamName && (
                    <span className="text-stone-400 font-medium">
                      • {product.malayalamName}
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-extrabold text-xl sm:text-2xl text-[#12372A] leading-tight">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="font-bold text-stone-800">{product.rating}</span>
                  <span className="text-stone-500">({product.reviewCount} customer reviews)</span>
                </div>

                {/* Pricing */}
                <div className="flex items-baseline gap-2.5 pt-1">
                  <span className="text-2xl font-black text-[#12372A]">
                    ₹{unitPrice}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-sm text-stone-400 line-through">
                        ₹{originalPrice}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#D9381E]/10 text-[#D9381E] text-xs font-bold">
                        Save {discountPercent}%
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-1">
                  {product.description}
                </p>

                {/* Ingredients Chip List */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-stone-700 block mb-1">
                    Pure Ingredients:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.ingredients.map((ing, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-md bg-stone-200/70 text-stone-700 text-[10px] font-medium"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {/* How to use */}
                {product.howToUse && (
                  <div className="pt-1 text-xs text-stone-600 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                    <strong className="text-emerald-950 font-bold block mb-0.5">Chef&apos;s Method:</strong>
                    <p className="text-[11px] leading-relaxed text-stone-700">{product.howToUse}</p>
                  </div>
                )}
              </div>

              {/* Variant Picker & Action Bar */}
              <div className="space-y-3 pt-3 border-t border-stone-200">
                <div>
                  <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                    Select Weight / Size:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const isSel = v.id === selectedVariantId;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-tight transition-all ${
                            isSel
                              ? 'bg-[#12372A] text-white shadow-sm ring-2 ring-[#12372A]'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                          }`}
                        >
                          {v.weight} — ₹{v.salePrice || v.price}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity and Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="flex items-center rounded-xl border border-stone-300 bg-white shadow-xs overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2.5 hover:bg-stone-100 text-stone-700 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 font-bold text-stone-900 text-sm">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2.5 hover:bg-stone-100 text-stone-700 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleAdd}
                    type="button"
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow transition-all ${
                      added
                        ? 'bg-emerald-700 text-white'
                        : 'bg-[#D9381E] hover:bg-[#B82912] text-white active:scale-95'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add ({quantity}) to Cart • ₹{unitPrice * quantity}</span>
                      </>
                    )}
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow flex items-center justify-center transition-colors"
                    title="Order on WhatsApp"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                  </a>
                </div>

                <div className="pt-2 text-center">
                  <Link
                    href={`/products/${product.id}`}
                    onClick={onClose}
                    className="text-xs font-bold text-[#12372A] hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Complete Product Details, Recipes & Nutrition</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;
  return (
    <QuickViewModalContent
      key={product.id}
      product={product}
      onClose={onClose}
      onAddToCart={onAddToCart}
    />
  );
};
