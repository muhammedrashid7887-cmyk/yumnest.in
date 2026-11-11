'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer id="footer" className="bg-[#F8F6F0] text-stone-700 pt-8 sm:pt-10 pb-16 lg:pb-10 border-t border-stone-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Main Footer Layout: Brand on Left, Columns on Right ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pb-6 sm:pb-8">
          
          {/* Brand Column (Spans 4 on Desktop, Full Width on Mobile) */}
          <div className="lg:col-span-4 space-y-2.5">
            <BrandLogo />
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed max-w-sm">
              Experience authentic restaurant-style broasted chicken with our Premium Broast Masala.
              Made with carefully selected natural spices for the perfect crunch, tenderness, and rich flavour.
            </p>
          </div>

          {/* Side-by-Side: Links (Left) and Company Policy (Right) on Mobile & Desktop */}
          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:col-span-5">
            {/* Quick Links */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-[#0F5638] text-xs sm:text-sm uppercase tracking-wider">Links</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-stone-600 font-normal">
                <li><Link href="/" className="hover:text-[#0F5638] transition-colors duration-200">Home</Link></li>
                <li><Link href="/products" className="hover:text-[#0F5638] transition-colors duration-200">Shop</Link></li>
                <li><Link href="/#about" className="hover:text-[#0F5638] transition-colors duration-200">About Us</Link></li>
                <li><Link href="/#awards" className="hover:text-[#0F5638] transition-colors duration-200">Awards</Link></li>
                <li><Link href="/#recipes" className="hover:text-[#0F5638] transition-colors duration-200">Recipes</Link></li>
                <li><Link href="/account" className="hover:text-[#0F5638] transition-colors duration-200">Track Your Order</Link></li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('open-wholesale-modal'));
                      }
                    }}
                    className="hover:text-[#0F5638] transition-colors duration-200 cursor-pointer text-left"
                  >
                    Wholesale &amp; Distribution
                  </button>
                </li>
                <li><a href="#footer" className="hover:text-[#0F5638] transition-colors duration-200">Contact Us</a></li>
              </ul>
            </div>

            {/* Company Policy - Moved to the right */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-[#0F5638] text-xs sm:text-sm uppercase tracking-wider">Company Policy</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-stone-600 font-normal">
                <li><a href="#footer" className="hover:text-[#0F5638] transition-colors duration-200">Shipping &amp; Delivery</a></li>
                <li><a href="#footer" className="hover:text-[#0F5638] transition-colors duration-200">Disclaimer</a></li>
                <li><a href="#footer" className="hover:text-[#0F5638] transition-colors duration-200">Terms And Conditions</a></li>
                <li><a href="#footer" className="hover:text-[#0F5638] transition-colors duration-200">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Official Info (Contact Info without bulky icons) */}
          <div className="lg:col-span-3 space-y-2.5">
            <div className="text-[#0F5638] text-xs sm:text-sm font-bold tracking-wide">
              YUMNEST SPICES &amp; FOODS
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-600 font-normal">
              <li>
                <span className="text-stone-900 font-semibold">Address: </span>
                <span className="leading-snug">Thoppumpady, Kochi – 5, Ernakulam, Kerala, India</span>
              </li>
              <li>
                <span className="text-stone-900 font-semibold">Phone: </span>
                <a href="tel:+917012268934" className="text-stone-700 hover:text-[#0F5638] transition-colors font-medium">
                  +91 70122 68934
                </a>
              </li>
              <li>
                <span className="text-stone-900 font-semibold">Email: </span>
                <a href="mailto:yumnest2000@gmail.com" className="text-stone-700 hover:text-[#0F5638] transition-colors font-medium">
                  yumnest2000@gmail.com
                </a>
              </li>
              <li>
                <span className="text-stone-900 font-semibold">Hours: </span>
                <span className="leading-snug">Mon – Sat | 9:00 AM – 7:00 PM IST</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-4 sm:pt-5 border-t border-stone-100 text-center text-xs text-stone-500">
          <p>&copy; 2026 Yumnest. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};
