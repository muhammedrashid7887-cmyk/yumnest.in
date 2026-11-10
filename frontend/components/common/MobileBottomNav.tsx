'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const cartContext = useCart();
  const cartCount = propsCartCount !== undefined ? propsCartCount : cartContext.cartCount;
  const onOpenCart = propsOnOpenCart || cartContext.openCart;

  const isHome = pathname === '/';
  const isShop = pathname.startsWith('/products');
  const isAccount = pathname === '/account';

  return (
    <nav 
      aria-label="Mobile Bottom Navigation" 
      className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200 z-40 px-4 py-2.5 shadow-xl"
    >
      <div className="flex items-center justify-around max-w-md mx-auto text-xs">
        {/* Home */}
        <Link 
          href="/" 
          className={`flex flex-col items-center gap-1 p-1 focus:outline-none transition-colors ${
            isHome ? 'text-[#0F5638] font-bold' : 'text-stone-600 hover:text-[#0F5638]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[13px]">Home</span>
        </Link>

        {/* Shop */}
        <Link 
          href="/products" 
          className={`flex flex-col items-center gap-1 p-1 focus:outline-none transition-colors ${
            isShop ? 'text-[#0F5638] font-bold' : 'text-stone-600 hover:text-[#0F5638]'
          }`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[13px]">Shop</span>
        </Link>

        {/* Cart */}
        <button 
          onClick={onOpenCart} 
          type="button"
          className="relative flex flex-col items-center gap-1 text-stone-600 hover:text-[#0F5638] p-1 focus:outline-none cursor-pointer"
          aria-label={`Open cart with ${cartCount} items`}
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 right-1 min-w-4.5 h-4.5 px-0.5 rounded-full bg-[#0F5638] text-white font-bold text-[12px] flex items-center justify-center">
              {cartCount}
            </span>
          )}
          <span className="text-[13px] font-semibold">Cart</span>
        </button>

        {/* Account / Order Status */}
        <Link 
          href="/account" 
          className={`flex flex-col items-center gap-1 p-1 focus:outline-none transition-colors ${
            isAccount ? 'text-[#0F5638] font-bold' : 'text-stone-600 hover:text-[#0F5638]'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[13px]">Account</span>
        </Link>
      </div>
    </nav>
  );
};
