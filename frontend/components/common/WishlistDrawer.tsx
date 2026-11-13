'use client';

import React from 'react';
import Link from 'next/link';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';

export const WishlistDrawer: React.FC = () => {
  const { items, wishlistCount, isWishlistOpen, closeWishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!isWishlistOpen) return null;

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultVariant = product.variants?.[0];
    addToCart(product, defaultVariant?.id, 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Your Favorite Items"
    >
      {/* Backdrop */}
      <div
        onClick={closeWishlist}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
        <div className="w-screen max-w-md bg-[#FAF7F0] shadow-2xl flex flex-col justify-between rounded-l-3xl sm:rounded-l-[32px] overflow-hidden pointer-events-auto border-l border-[#E8DFC8] animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#E8DFC8] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <Heart className="w-4 h-4 fill-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-stone-900 tracking-tight leading-tight">
                  My Favorites
                </h3>
                <p className="text-[11px] text-stone-500 font-medium">
                  {wishlistCount} {wishlistCount === 1 ? 'item saved' : 'items saved'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {wishlistCount > 0 && (
                <button
                  type="button"
                  onClick={clearWishlist}
                  className="text-[11px] font-semibold text-stone-400 hover:text-red-500 transition-colors px-2 py-1"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={closeWishlist}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors"
                aria-label="Close favorites"
              >
                <X className="w-5 h-5 stroke-[1.8]" />
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-red-50 text-red-400 flex items-center justify-center mx-auto shadow-inner">
                  <Heart className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h4 className="font-bold text-stone-800 text-base">Your favorites list is empty</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                  Tap the heart button on any spice or broast blend to save it here for quick access!
                </p>
                <Link
                  href="/products"
                  onClick={closeWishlist}
                  className="inline-flex items-center gap-2 mt-3 px-6 py-2.5 rounded-full bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all hover-btn-smooth"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map((product) => {
                  const variant = product.variants?.[0];
                  const price = variant?.salePrice || variant?.price || 250;
                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl p-3 border border-[#E8DFC8] flex items-center gap-3 shadow-2xs hover:shadow-xs transition-shadow"
                    >
                      {/* Thumbnail */}
                      <Link
                        href={`/products/${product.id}`}
                        onClick={closeWishlist}
                        className="w-16 h-16 rounded-xl bg-[#FAF7F2] p-1.5 shrink-0 flex items-center justify-center border border-stone-100 overflow-hidden"
                      >
                        <img
                          src={product.primaryImage}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${product.id}`}
                          onClick={closeWishlist}
                          className="block text-xs sm:text-sm font-bold text-stone-900 hover:text-[#0F5638] truncate transition-colors"
                          title={product.name}
                        >
                          {product.name}
                        </Link>
                        <p className="text-[11px] text-stone-500 truncate">
                          {product.subtitle || product.category}
                        </p>
                        <p className="text-xs sm:text-sm font-extrabold text-[#0F5638] mt-0.5">
                          ₹{price}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(product, e)}
                          className="px-3 py-1.5 rounded-lg bg-[#0F5638] hover:bg-[#187A4F] text-white text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer hover-btn-smooth"
                          title="Add to Cart"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Add</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => removeFromWishlist(product.id)}
                          className="p-1 rounded-md text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          aria-label={`Remove ${product.name} from favorites`}
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-[#E8DFC8] space-y-2.5">
              <Link
                href="/products"
                onClick={closeWishlist}
                className="w-full py-3 rounded-xl bg-[#0F5638] hover:bg-[#187A4F] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
