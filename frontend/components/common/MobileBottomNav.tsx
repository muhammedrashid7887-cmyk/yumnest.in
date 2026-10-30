'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Store, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface MobileBottomNavProps {
  cartCount?: number;
  onOpenCart?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
  cartCount: propsCartCount,
  onOpenCart: propsOnOpenCart 
}) => {
  const cartContext = useCart();
  const cartCount = propsCartCount !== undefined ? propsCartCount : cartContext.cartCount;
  const onOpenCart = propsOnOpenCart || cartContext.openCart;

  return (
    <nav 
      aria-label="Mobile Bottom Navigation" 
      className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200 z-40 px-4 py-2.5 shadow-xl"
    >
      <div className="flex items-center justify-around max-w-md mx-auto text-xs">
        {/* Home */}
        <Link 
          href="/" 
          className="flex flex-col items-center gap-1 text-[#12372A] p-1 focus:outline-none"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </Link>

        {/* Shop */}
        <Link 
          href="/products" 
          className="flex flex-col items-center gap-1 text-stone-600 hover:text-[#12372A] p-1 focus:outline-none"
        >
          <Store className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Shop</span>
        </Link>

        {/* Cart */}
        <button 
          onClick={onOpenCart} 
          type="button"
          className="relative flex flex-col items-center gap-1 text-stone-600 hover:text-[#12372A] p-1 focus:outline-none"
          aria-label={`Open cart with ${cartCount} items`}
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 right-1 w-4 h-4 rounded-full bg-[#12372A] text-white font-bold text-[9px] flex items-center justify-center">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] font-semibold">Cart</span>
        </button>

        {/* Account / Support */}
        <Link 
          href="/cart" 
          className="flex flex-col items-center gap-1 text-stone-600 hover:text-[#12372A] p-1 focus:outline-none"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Account</span>
        </Link>
      </div>
    </nav>
  );
};
