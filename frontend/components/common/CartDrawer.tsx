'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, MessageCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { SITE_SETTINGS } from '@/data/mockData';
import { useCart, CartLineItem } from '@/context/CartContext';

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

  const isOpen = props.isOpen !== undefined ? props.isOpen : cartContext.isCartOpen;
  const onClose = props.onClose || cartContext.closeCart;
  const items = props.items || cartContext.items;
  const onUpdateQuantity = props.onUpdateQuantity || cartContext.updateQuantity;
  const onRemoveItem = props.onRemoveItem || cartContext.removeItem;
  const onClearCart = props.onClearCart || cartContext.clearCart;

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant.salePrice || item.variant.price;
    return sum + price * item.quantity;
  }, 0);

  const shippingFee =
    subtotal >= SITE_SETTINGS.freeShippingThreshold || subtotal === 0
      ? 0
      : SITE_SETTINGS.standardShippingFee;
  const total = subtotal + shippingFee;

  const whatsappCleanNumber = SITE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '');

  const formatCartForWhatsApp = () => {
    const lines = items.map(
      (item, idx) =>
        `${idx + 1}. ${item.product.name} (${item.variant.weight}) x ${item.quantity} = ₹${
          (item.variant.salePrice || item.variant.price) * item.quantity
        }`
    );
    const text = `Hello Yumnest! I would like to place an order:%0A%0A${lines.join(
      '%0A'
    )}%0A%0ASubtotal: ₹${subtotal}%0AShipping: ${
      shippingFee === 0 ? 'FREE' : '₹' + shippingFee
    }%0ATotal Amount: ₹${total}%0A%0APlease confirm my order delivery details.`;
    return `https://wa.me/${whatsappCleanNumber}?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Shopping Cart Drawer">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FBF9F5] shadow-2xl flex flex-col justify-between border-l border-[#E8DFC8]">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E8DFC8] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#12372A]" />
              <h3 className="font-serif font-bold text-lg text-[#12372A]">Your Shopping Cart</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#12372A]/10 text-[#12372A]">
                {items.reduce((acc, it) => acc + it.quantity, 0)}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Prototype Disclosure Notice */}
          <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-600/15 flex items-start gap-2 text-[11px] text-amber-900 leading-tight">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Phase 2 Cart:</strong> Synced with local storage. Free shipping applied on orders above ₹{SITE_SETTINGS.freeShippingThreshold}.
            </span>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-serif font-bold text-stone-700 text-base">Your cart is empty</p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Add some authentic Kerala spices or our signature broast powder to get cooking!
                </p>
                <Link
                  href="/products"
                  onClick={onClose}
                  className="inline-block mt-2 px-5 py-2.5 rounded-full bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs font-bold uppercase tracking-wider shadow transition-colors"
                >
                  Explore Spices
                </Link>
              </div>
            ) : (
              items.map((line) => {
                const price = line.variant.salePrice || line.variant.price;
                return (
                  <div
                    key={line.id}
                    className="flex gap-3 p-3 rounded-2xl bg-white border border-[#E8DFC8] shadow-2xs items-center"
                  >
                    <Link
                      href={`/products/${line.product.id}`}
                      onClick={onClose}
                      className="shrink-0"
                    >
                      <img
                        src={line.product.primaryImage}
                        alt={line.product.name}
                        className="w-16 h-16 rounded-xl object-cover bg-stone-100 hover:opacity-90 transition-opacity"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${line.product.id}`}
                        onClick={onClose}
                        className="font-serif font-bold text-xs sm:text-sm text-[#1C1917] hover:text-[#D9381E] transition-colors truncate block"
                      >
                        {line.product.name}
                      </Link>
                      <p className="text-[11px] text-stone-500 font-semibold">
                        {line.variant.weight} • ₹{price} each
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(line.id, -1)}
                            className="p-1 hover:bg-stone-200 text-stone-600 transition-colors disabled:opacity-40"
                            aria-label="Decrease quantity"
                            disabled={line.quantity <= 1}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-stone-800">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(line.id, 1)}
                            className="p-1 hover:bg-stone-200 text-stone-600 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-xs font-black text-[#12372A] ml-auto">
                          ₹{price * line.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(line.id)}
                          className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & Checkout / WhatsApp Actions */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#E8DFC8] bg-white space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-stone-800">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-bold text-stone-800">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>
                {subtotal < SITE_SETTINGS.freeShippingThreshold && (
                  <p className="text-[10px] text-amber-700">
                    Add ₹{SITE_SETTINGS.freeShippingThreshold - subtotal} more for Free Shipping!
                  </p>
                )}
                <div className="flex justify-between text-sm sm:text-base font-black text-[#12372A] pt-1.5 border-t border-stone-100">
                  <span>Estimated Total:</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl bg-[#12372A] hover:bg-[#1A4D3B] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow transition-colors"
                >
                  <span>Go to Full Cart & Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={formatCartForWhatsApp()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Send Order via WhatsApp</span>
                </a>

                <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                  <button
                    onClick={onClearCart}
                    className="text-stone-400 hover:text-red-600 transition-colors"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={onClose}
                    className="font-bold text-[#12372A] hover:underline"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
