'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Store, Heart, ShoppingBag, User } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

interface MobileBottomNavProps {
  wishlistCount?: number;
  onOpenWishlist?: () => void;
  cartCount?: number;
  onOpenCart?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
  wishlistCount: propsWishlistCount,
  onOpenWishlist: propsOnOpenWishlist,
  cartCount: propsCartCount,
  onOpenCart: propsOnOpenCart,
}) => {
  const pathname = usePathname();
  const wishlistContext = useWishlist();
  const cartContext = useCart();

  const wishlistCount = propsWishlistCount !== undefined ? propsWishlistCount : wishlistContext.wishlistCount;
  const onOpenWishlist = propsOnOpenWishlist || wishlistContext.openWishlist;

  const cartCount = propsCartCount !== undefined ? propsCartCount : cartContext.cartCount;
  const onOpenCart = propsOnOpenCart || cartContext.openCart;

  const isHome = pathname === '/';
  const isShop = pathname.startsWith('/products');
  const isAccount = pathname === '/account';

  return (
    <nav 
      aria-label="Mobile Bottom Navigation" 
      className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200 z-40 px-2 sm:px-4 py-2 shadow-xl"
    >
      <div className="flex items-center justify-around max-w-md mx-auto text-xs">
        {/* 1. Home */}
        <Link 
          href="/" 
          className={`flex flex-col items-center gap-0.5 p-1 focus:outline-none transition-colors ${
            isHome ? 'text-[#0F5638] font-bold' : 'text-stone-600 hover:text-[#0F5638]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] sm:text-[12px]">Home</span>
        </Link>

        {/* 2. Shop */}
        <Link 
          href="/products" 
          className={`flex flex-col items-center gap-0.5 p-1 focus:outline-none transition-colors ${
            isShop ? 'text-[#0F5638] font-bold' : 'text-stone-600 hover:text-[#0F5638]'
          }`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[11px] sm:text-[12px]">Shop</span>
        </Link>

        {/* 3. Favorites */}
        <button 
          onClick={onOpenWishlist} 
          type="button"
          className="relative flex flex-col items-center gap-0.5 text-stone-600 hover:text-red-500 p-1 focus:outline-none cursor-pointer group"
          aria-label={`Open favorites with ${wishlistCount} items`}
        >
          <div className="relative">
            <Heart 
              className={`w-5 h-5 transition-transform duration-200 ${
                wishlistCount > 0 ? 'fill-red-500 text-red-500 scale-105' : 'group-hover:text-red-500'
              }`} 
            />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-0.5 rounded-full bg-red-500 text-white font-bold text-[10px] flex items-center justify-center shadow-xs animate-in zoom-in-75">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[11px] sm:text-[12px] font-semibold">Favorites</span>
        </button>

        {/* 4. Cart */}
        <button 
          onClick={onOpenCart} 
          type="button"
          className="relative flex flex-col items-center gap-0.5 text-stone-600 hover:text-[#0F5638] p-1 focus:outline-none cursor-pointer group"
          aria-label={`Open cart with ${cartCount} items`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-0.5 rounded-full bg-[#0F5638] text-white font-bold text-[10px] flex items-center justify-center shadow-xs animate-in zoom-in-75">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[11px] sm:text-[12px] font-semibold">Cart</span>
        </button>

        {/* 5. Account */}
        <Link 
          href="/account" 
          className={`flex flex-col items-center gap-0.5 p-1 focus:outline-none transition-colors ${
            isAccount ? 'text-[#0F5638] font-bold' : 'text-stone-600 hover:text-[#0F5638]'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[11px] sm:text-[12px]">Account</span>
        </Link>
      </div>
    </nav>
  );
};
