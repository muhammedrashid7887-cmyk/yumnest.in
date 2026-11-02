'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { Check, X } from 'lucide-react';

export const CartToast: React.FC = () => {
  const { toastMessage, lastAddedItem, dismissToast, openCart } = useCart();

  if (!toastMessage) return null;

  return (
    <aside
      aria-label="Shopping Cart Notification"
      role="status"
      className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100%-2rem)] sm:w-auto bg-white text-stone-900 px-3.5 py-3 rounded-2xl shadow-xl border border-stone-200/90 animate-in slide-in-from-bottom-4 fade-in duration-200"
    >
      <div className="flex items-center gap-3">
        {/* Product image thumbnail with check badge or clean checkmark */}
        {lastAddedItem?.product?.primaryImage ? (
          <div className="relative w-11 h-11 rounded-xl bg-[#FBF9F5] border border-stone-200/80 p-1 flex items-center justify-center shrink-0">
            <img
              src={lastAddedItem.product.primaryImage}
              alt={lastAddedItem.product.name}
              className="w-full h-full object-contain"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </span>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 stroke-[2.5]" />
          </div>
        )}

        {/* Text Details */}
        <div className="min-w-0 flex-1 pr-1">
          <p className="text-xs sm:text-[14px] font-bold text-stone-900 leading-tight">
            Added to cart
          </p>
          <p className="text-xs text-stone-600 truncate mt-0.5 font-normal max-w-[170px] sm:max-w-[210px]">
            {lastAddedItem
              ? `${lastAddedItem.product.name} (${lastAddedItem.weight})`
              : toastMessage}
          </p>
        </div>

        {/* Standard View Cart Action */}
        <button
          type="button"
          onClick={() => {
            dismissToast();
            openCart();
          }}
          className="px-3.5 py-1.5 rounded-lg bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs font-bold whitespace-nowrap shadow-2xs transition-all active:scale-95 cursor-pointer"
        >
          View Cart
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={dismissToast}
          className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors shrink-0 cursor-pointer"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

