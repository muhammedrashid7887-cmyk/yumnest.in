'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const CartToast: React.FC = () => {
  const { toastMessage, dismissToast, openCart } = useCart();

  if (!toastMessage) return null;

  return (
    <aside 
      aria-label="Shopping Cart Notification"
      className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-full bg-[#12372A] text-white p-4 rounded-2xl shadow-2xl border border-[#D4A373]/40 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="w-8 h-8 rounded-full bg-[#E8AA42]/20 text-[#E8AA42] flex items-center justify-center shrink-0 mt-0.5">
          <ShoppingBag className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[#E8AA42] uppercase tracking-wider">Cart Updated</p>
          <p className="text-xs text-stone-200 mt-0.5 line-clamp-2 leading-relaxed font-medium">
            {toastMessage}
          </p>

          <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-white/10 text-xs">
            <button
              onClick={() => {
                dismissToast();
                openCart();
              }}
              className="text-[#E8AA42] hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
            >
              <span>View Drawer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <span className="text-stone-500">•</span>

            <Link
              href="/cart"
              onClick={dismissToast}
              className="text-stone-300 hover:text-white font-medium transition-colors"
            >
              Go to Cart Page
            </Link>
          </div>
        </div>

        <button
          onClick={dismissToast}
          className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
