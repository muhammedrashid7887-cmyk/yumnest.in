'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { 
  Search, 
  ShoppingBag, 
  Menu, 
  X, 
  MessageCircle, 
  ChevronRight
} from 'lucide-react';
import { SITE_SETTINGS } from '@/data/mockData';
import { useCart } from '@/context/CartContext';

interface NavbarProps {
  cartCount?: number;
  onOpenCart?: () => void;
  onSearchClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  cartCount: propsCartCount, 
  onOpenCart: propsOnOpenCart,
  onSearchClick 
}) => {
  const cartContext = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = propsCartCount !== undefined ? propsCartCount : cartContext.cartCount;
  const onOpenCart = propsOnOpenCart || cartContext.openCart;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Signature Broast', href: '/#broast-special' },
    { label: 'About Us', href: '/#about' },
    { label: 'Recipes & Vlogs', href: '/#recipes' },
    { label: 'Awards', href: '/#awards' },
    { label: 'Contact', href: '/#contact' },
  ];

  const whatsappCleanNumber = SITE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <header className="sticky top-0 z-40 w-full transition-shadow duration-300">
      {/* Main Navigation Bar */}
      <div 
        className={`w-full transition-all duration-300 ${
          isScrolled 
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
                className="text-sm font-semibold text-[#1C1917]/85 hover:text-[#12372A] tracking-wide relative py-1 transition-colors group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D9381E] transition-all duration-200 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Action Buttons on Right */}
          <div className="flex items-center gap-3">
            {/* Search Trigger */}
            <button
              onClick={onSearchClick}
              type="button"
              className="p-2.5 rounded-full hover:bg-stone-200/70 text-stone-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#12372A]"
              aria-label="Search spices and products"
              title="Search spices"
            >
              <Search className="w-5 h-5" />
            </button>



            {/* Cart Bag Icon with Count Badge */}
            <button
              onClick={onOpenCart}
              type="button"
              className="relative p-2.5 rounded-full hover:bg-stone-200/70 text-[#12372A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#12372A]"
              aria-label={`Cart with ${cartCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#D9381E] text-white font-bold text-[11px] flex items-center justify-center shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="lg:hidden p-2.5 rounded-xl hover:bg-stone-200/70 text-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#12372A]"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* 3. Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[100px] bottom-0 bg-[#FBF9F5] z-50 overflow-y-auto border-t border-[#E8DFC8] px-6 py-6 flex flex-col justify-between shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-3">
            <p className="text-xs uppercase font-bold tracking-wider text-stone-400 mb-2">Navigation</p>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-3 text-base font-bold text-[#1C1917] border-b border-stone-200/60 hover:text-[#D9381E] transition-colors"
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
            ))}
          </div>

          <div className="pt-6 pb-12 space-y-3 border-t border-stone-200">
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 px-4 rounded-xl bg-[#12372A] text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>View Shopping Cart ({cartCount})</span>
            </Link>

            <a
              href={`https://wa.me/${whatsappCleanNumber}?text=Hi%20Yumnest,%20I%20would%20like%20to%20order%20pure%20spices.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>WhatsApp Direct Order</span>
            </a>

            <div className="text-center text-xs text-stone-500 pt-2">
              <p>Support: {SITE_SETTINGS.supportPhone}</p>
              <p className="text-[11px] mt-1 text-stone-400">Yumnest Spices • Aluva, Kerala</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
