'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { SITE_SETTINGS } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { WholesaleDistributionModal } from '@/components/business/WholesaleDistributionModal';

interface NavbarProps {
  cartCount?: number;
  onOpenCart?: () => void;
  onSearchClick?: () => void;
  onOpenWishlist?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount: propsCartCount,
  onOpenCart: propsOnOpenCart,
  onSearchClick,
  onOpenWishlist: propsOnOpenWishlist
}) => {
  const cartContext = useCart();
  const wishlistContext = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [businessModalOpen, setBusinessModalOpen] = useState(false);

  const cartCount = propsCartCount !== undefined ? propsCartCount : cartContext.cartCount;
  const onOpenCart = propsOnOpenCart || cartContext.openCart;
  const wishlistCount = wishlistContext.wishlistCount;
  const onOpenWishlist = propsOnOpenWishlist || wishlistContext.openWishlist;

  const openBusinessModal = () => {
    setBusinessModalOpen(true);
  };

  const closeBusinessModal = () => {
    setBusinessModalOpen(false);
    try {
      sessionStorage.setItem('yn_wholesale_dismissed_session', 'true');
    } catch {}
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOpen = () => openBusinessModal();
    window.addEventListener('open-wholesale-modal', handleOpen);
    return () => window.removeEventListener('open-wholesale-modal', handleOpen);
  }, []);

  // Auto-open Wholesale & Distribution modal after 2 minutes on the website (once per visitor session)
  useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem('yn_wholesale_dismissed_session') === 'true';
      const isShown = sessionStorage.getItem('yn_wholesale_shown_session') === 'true';
      if (isDismissed || isShown) {
        return;
      }

      const now = Date.now();
      let sessionStart = parseInt(sessionStorage.getItem('yn_session_start_ms') || '0', 10);
      if (!sessionStart || isNaN(sessionStart) || sessionStart <= 0) {
        sessionStart = now;
        sessionStorage.setItem('yn_session_start_ms', String(now));
      }

      const elapsed = Math.max(0, now - sessionStart);
      const TWO_MINUTES_MS = 120000;
      const remainingMs = Math.max(0, TWO_MINUTES_MS - elapsed);

      const timer = setTimeout(() => {
        try {
          if (
            sessionStorage.getItem('yn_wholesale_dismissed_session') === 'true' ||
            sessionStorage.getItem('yn_wholesale_shown_session') === 'true'
          ) {
            return;
          }
          sessionStorage.setItem('yn_wholesale_shown_session', 'true');
        } catch {}
        openBusinessModal();
      }, remainingMs);

      return () => clearTimeout(timer);
    } catch {}
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'About Us', href: '/about' },
    { label: 'Awards', href: '/awards' },
    { label: 'Contact', href: '/contact' },
  ];

  const whatsappCleanNumber = SITE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <header className="sticky top-0 z-40 w-full transition-shadow duration-300">
      {/* Main Navigation Bar */}
      <div
        className={`w-full transition-all duration-300 ${isScrolled
            ? 'bg-[#FBF9F5]/95 backdrop-blur-md shadow-md py-3 border-b border-[#E8DFC8]'
            : 'bg-[#FBF9F5] py-4 border-b border-[#E8DFC8]/70'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">

          {/* Brand Logo */}
          <BrandLogo />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-stone-700 hover:text-[#0F5638] tracking-normal relative py-1.5 transition-colors duration-200 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0F5638] transition-all duration-300 ease-out group-hover:w-full rounded-full" />
              </Link>
            ))}
          </nav>

          {/* Action Buttons on Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wholesale & Distribution Trigger Button */}
            <button
              type="button"
              onClick={openBusinessModal}
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-stone-300 hover:border-[#0F5638] bg-white hover:bg-stone-50 text-stone-800 hover:text-[#0F5638] text-xs font-bold transition-all duration-200 shadow-2xs hover:shadow cursor-pointer tracking-normal group"
              title="Wholesale Pricing & Distributor Partnerships"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8AA42] group-hover:scale-125 transition-transform" />
              <span>Wholesale &amp; Distribution</span>
            </button>

            {/* Search Trigger */}
            <button
              onClick={onSearchClick}
              type="button"
              className="p-2 sm:p-2.5 rounded-full hover:bg-stone-200/60 text-stone-700 hover:text-[#0F5638] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5638] hover-btn-smooth cursor-pointer"
              aria-label="Search spices and products"
              title="Search spices"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Favorite / Wishlist Heart Icon with Count Badge */}
            <button
              onClick={onOpenWishlist}
              type="button"
              className="relative p-2 sm:p-2.5 rounded-full hover:bg-red-50 text-[#0F5638] hover:text-red-500 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 hover-btn-smooth cursor-pointer"
              aria-label={`Favorites with ${wishlistCount} items`}
              title="My Favorites"
            >
              <Heart
                className={`w-5 h-5 stroke-[1.8] transition-all duration-200 ${
                  wishlistCount > 0 ? 'fill-red-500 text-red-500 scale-105' : ''
                }`}
              />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white font-bold text-[11px] flex items-center justify-center shadow-xs transition-transform duration-200 animate-in zoom-in-75">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Bag Icon with Count Badge */}
            <button
              onClick={onOpenCart}
              type="button"
              className="relative p-2 sm:p-2.5 rounded-full hover:bg-emerald-50 text-[#0F5638] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5638] hover-btn-smooth cursor-pointer"
              aria-label={`Cart with ${cartCount} items`}
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8] transition-transform duration-200 hover:scale-105" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0F5638] text-white font-bold text-[11px] flex items-center justify-center shadow-xs transition-transform duration-200 animate-in zoom-in-75">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="lg:hidden p-2 rounded-xl hover:bg-stone-200/60 text-stone-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5638] cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 stroke-[1.8]" /> : <Menu className="w-6 h-6 stroke-[1.8]" />}
            </button>
          </div>

        </div>
      </div>

      {/* 3. Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bottom-0 bg-[#FBF9F5]/98 backdrop-blur-lg z-50 overflow-y-auto border-t border-[#E8DFC8] px-6 py-6 flex flex-col justify-between shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="space-y-1">
            <p className="text-[11px] uppercase font-bold tracking-wider text-stone-400 mb-2">Navigation</p>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-3 text-sm font-semibold text-[#1C1917] border-b border-stone-200/50 hover:text-[#0F5638] hover:pl-1 transition-all duration-200"
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
            ))}
          </div>

          <div className="pt-6 pb-12 space-y-3 border-t border-stone-200">
            {/* Mobile Wholesale & Distribution Button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openBusinessModal();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-white border border-stone-300 text-stone-800 hover:text-[#0F5638] hover:border-[#0F5638] font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs cursor-pointer hover:bg-stone-50 transition"
            >
              <span className="w-2 h-2 rounded-full bg-[#E8AA42]" />
              <span>Wholesale &amp; Distribution</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCart();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0F5638] text-white font-semibold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer hover:bg-[#126844]"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>View Shopping Cart ({cartCount})</span>
            </button>

            <div className="text-center text-xs text-stone-500 pt-2">
              <p>Support: {SITE_SETTINGS.supportPhone}</p>
              <p className="text-[14px] mt-1 text-stone-400">Yumnest Spices • Kochi, Kerala</p>
            </div>
          </div>
        </div>
      )}

      {/* Wholesale & Distribution Modal */}
      <WholesaleDistributionModal
        isOpen={businessModalOpen}
        onClose={closeBusinessModal}
      />
    </header>
  );
};
