'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Store, Heart, User } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';

interface MobileBottomNavProps {
  wishlistCount?: number;
  onOpenWishlist?: () => void;
  cartCount?: number;
  onOpenCart?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
  wishlistCount: propsWishlistCount,
  onOpenWishlist: propsOnOpenWishlist,
}) => {
  const pathname = usePathname();
  const wishlistContext = useWishlist();
  const wishlistCount = propsWishlistCount !== undefined ? propsWishlistCount : wishlistContext.wishlistCount;
  const onOpenWishlist = propsOnOpenWishlist || wishlistContext.openWishlist;

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

        {/* Favorites / Wishlist */}
        <button 
          onClick={onOpenWishlist} 
          type="button"
          className="relative flex flex-col items-center gap-1 text-stone-600 hover:text-red-500 p-1 focus:outline-none cursor-pointer group"
          aria-label={`Open favorites with ${wishlistCount} items`}
        >
          <Heart 
            className={`w-5 h-5 transition-transform duration-200 ${
              wishlistCount > 0 ? 'fill-red-500 text-red-500 scale-105' : 'group-hover:text-red-500'
            }`} 
          />
          {wishlistCount > 0 && (
            <span className="absolute -top-0.5 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white font-bold text-[11px] flex items-center justify-center shadow-xs animate-in zoom-in-75">
              {wishlistCount}
            </span>
          )}
          <span className="text-[13px] font-semibold">Favorites</span>
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
