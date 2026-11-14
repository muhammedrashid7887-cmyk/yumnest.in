'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, MoreVertical } from 'lucide-react';
import { SITE_SETTINGS } from '@/data/mockData';
import { useCart, CartLineItem } from '@/context/CartContext';
import { getConsistentProductImageUrl } from '@/lib/utils/product-image';

export type { CartLineItem };

interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  items?: CartLineItem[];
  onUpdateQuantity?: (lineId: string, delta: number) => void;
  onRemoveItem?: (lineId: string) => void;
  onClearCart?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = (props) => {
  const cartContext = useCart();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const isOpen = props.isOpen !== undefined ? props.isOpen : cartContext.isCartOpen;
  const onClose = props.onClose || cartContext.closeCart;
  const items = props.items || cartContext.items;
  const onUpdateQuantity = props.onUpdateQuantity || cartContext.updateQuantity;
  const onRemoveItem = props.onRemoveItem || cartContext.removeItem;

  if (!isOpen) return null;

  const totalItemsCount = items.reduce((acc, it) => acc + it.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant.salePrice || item.variant.price;
    return sum + price * item.quantity;
  }, 0);

  const shippingFee =
    subtotal >= SITE_SETTINGS.freeShippingThreshold || subtotal === 0
      ? 0
      : SITE_SETTINGS.standardShippingFee;
  const total = subtotal + shippingFee;

  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Your Shopping Cart"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
        <div className="w-screen max-w-md bg-[#F8F7F5] shadow-2xl flex flex-col justify-between rounded-l-[32px] overflow-hidden pointer-events-auto border-l border-stone-200/40 animate-in slide-in-from-right duration-300">
          
          {/* 1. Header */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-stone-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-stone-900 stroke-[1.8]" />
              <h3 className="font-bold text-base sm:text-lg text-stone-900 tracking-tight">
                Your Shopping Cart
              </h3>
              <span className="text-xs text-stone-500 font-medium px-2 py-0.5 rounded-full bg-stone-100">
                ({totalItemsCount})
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5 stroke-[1.8]" />
            </button>
          </div>

          {/* 2. Items List */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <p className="font-bold text-stone-800 text-base">Your cart is empty</p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Add some authentic Kerala spices or our signature broast powder to get cooking!
                </p>
                <Link
                  href="/products"
                  onClick={onClose}
                  className="inline-block mt-2 px-6 py-2.5 rounded-full bg-black hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider shadow transition-colors"
                >
                  Explore Spices
                </Link>
              </div>
            ) : (
              items.map((line) => {
                const price = line.variant.salePrice || line.variant.price;
                const lineTotal = price * line.quantity;
                const isMenuOpen = activeMenuId === line.id;

                return (
                  <div
                    key={line.id}
                    className="relative p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/40 shadow-xs flex items-center gap-3.5 transition-shadow hover:shadow-sm"
                  >
                    {/* Product Image */}
                    <Link
                      href={`/products/${line.product.id}`}
                      onClick={onClose}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-stone-50 border border-stone-100/60 p-1 flex items-center justify-center overflow-hidden shrink-0"
                    >
                      <img
                        src={getConsistentProductImageUrl(line.product.primaryImage)}
                        alt={line.product.name}
                        className="w-full h-full max-h-full max-w-full object-contain"
                        style={{ objectFit: 'contain' }}
                      />
                    </Link>

                    {/* Middle Info */}
                    <div className="flex-1 min-w-0 pr-1">
                      <Link
                        href={`/products/${line.product.id}`}
                        onClick={onClose}
                        className="font-semibold text-xs sm:text-sm text-stone-900 hover:text-stone-700 transition-colors truncate block leading-tight"
                      >
                        {line.product.name}
                      </Link>
                      <p className="text-xs text-stone-500 font-normal mt-0.5">
                        {line.variant.weight} • ₹{price} each
                      </p>

                      {/* Quantity Selector */}
                      <div className="inline-flex items-center gap-2.5 mt-2.5 bg-[#F4F4F6] rounded-full px-2.5 py-1">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(line.id, -1)}
                          className="text-stone-600 hover:text-stone-900 transition-colors disabled:opacity-30 p-0.5"
                          aria-label="Decrease quantity"
                          disabled={line.quantity <= 1}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-semibold text-stone-900 min-w-[14px] text-center select-none">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(line.id, 1)}
                          className="text-stone-600 hover:text-stone-900 transition-colors p-0.5"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Right Side: 3-dots Menu & Line Total Price */}
                    <div className="flex flex-col items-end justify-between self-stretch shrink-0 py-0.5">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(isMenuOpen ? null : line.id)}
                          className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                          aria-label="Options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Options Dropdown */}
                        {isMenuOpen && (
                          <div className="absolute right-0 top-6 z-20 w-32 bg-white rounded-xl shadow-lg border border-stone-100 py-1 text-xs animate-in fade-in zoom-in-95 duration-150">
                            <button
                              type="button"
                              onClick={() => {
                                onRemoveItem(line.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-1.5 font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <span className="font-bold text-sm sm:text-base text-stone-900 tracking-tight">
                        {formatCurrency(lineTotal)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 4. Order Summary & Checkout Action */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-stone-100 space-y-4">
              {/* Order Summary Card */}
              <div className="rounded-2xl bg-white border border-stone-200/40 p-4 shadow-xs space-y-2.5 text-xs sm:text-sm">
                <h4 className="font-bold text-stone-900 text-sm sm:text-base tracking-tight">
                  Order Summary
                </h4>
                
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-stone-500">
                  <span>Shipping</span>
                  <span className="font-medium text-stone-900">
                    {shippingFee === 0 ? '₹0.00' : formatCurrency(shippingFee)}
                  </span>
                </div>

                <div className="border-t border-stone-100 pt-2 flex justify-between items-center text-sm sm:text-base font-bold text-stone-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/cart"
                onClick={onClose}
                className="w-full block py-3.5 sm:py-4 px-6 rounded-full bg-black hover:bg-stone-900 text-white font-medium text-center text-sm sm:text-base transition-all duration-200 shadow-md active:scale-[0.99]"
              >
                Checkout
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
