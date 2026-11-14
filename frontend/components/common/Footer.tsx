'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { SITE_SETTINGS } from '@/data/mockData';
import { getWhatsAppUrl, DEFAULT_WHATSAPP_SUPPORT_MESSAGE } from '@/lib/utils/whatsapp';
import {
  InstagramIcon,
  FacebookIcon,
  LinkedInIcon,
  XIcon,
  WhatsAppIcon,
} from './BrandMediaIcons';

export const Footer: React.FC = () => {
  const whatsappCleanNumber = SITE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <footer id="footer" className="bg-[#F3F0E8] text-stone-700 pt-8 sm:pt-10 pb-16 lg:pb-10 border-t border-stone-200 relative overflow-hidden">
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

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="block text-[11px] font-bold text-[#0F5638] uppercase tracking-wider mb-2">Connect With Us</span>
              <div className="flex items-center gap-2">
                {/* Instagram */}
                <a
                  href={SITE_SETTINGS.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                  title="Instagram"
                  className="w-8 h-8 rounded-full bg-white border border-stone-300/80 text-stone-700 hover:text-white hover:bg-gradient-to-tr hover:from-[#FD1D1D] hover:via-[#E1306C] hover:to-[#833AB4] hover:border-transparent flex items-center justify-center transition-all duration-200 shadow-2xs hover:shadow-sm hover:-translate-y-0.5 cursor-pointer"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>

                {/* Facebook */}
                <a
                  href={SITE_SETTINGS.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Connect on Facebook"
                  title="Facebook"
                  className="w-8 h-8 rounded-full bg-white border border-stone-300/80 text-stone-700 hover:text-white hover:bg-[#1877F2] hover:border-transparent flex items-center justify-center transition-all duration-200 shadow-2xs hover:shadow-sm hover:-translate-y-0.5 cursor-pointer"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>

                {/* LinkedIn */}
                <a
                  href={SITE_SETTINGS.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Connect on LinkedIn"
                  title="LinkedIn"
                  className="w-8 h-8 rounded-full bg-white border border-stone-300/80 text-stone-700 hover:text-white hover:bg-[#0A66C2] hover:border-transparent flex items-center justify-center transition-all duration-200 shadow-2xs hover:shadow-sm hover:-translate-y-0.5 cursor-pointer"
                >
                  <LinkedInIcon className="w-4 h-4" />
                </a>

                {/* X */}
                <a
                  href={SITE_SETTINGS.xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on X"
                  title="X"
                  className="w-8 h-8 rounded-full bg-white border border-stone-300/80 text-stone-700 hover:text-white hover:bg-black hover:border-transparent flex items-center justify-center transition-all duration-200 shadow-2xs hover:shadow-sm hover:-translate-y-0.5 cursor-pointer"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </a>

                {/* WhatsApp */}
                <a
                  href={getWhatsAppUrl(whatsappCleanNumber, DEFAULT_WHATSAPP_SUPPORT_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat on WhatsApp"
                  title="WhatsApp"
                  className="w-8 h-8 rounded-full bg-white border border-stone-300/80 text-stone-700 hover:text-white hover:bg-[#25D366] hover:border-transparent flex items-center justify-center transition-all duration-200 shadow-2xs hover:shadow-sm hover:-translate-y-0.5 cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Side-by-Side: Links (Left) and Company Policy (Right) on Mobile & Desktop */}
          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:col-span-5">
            {/* Quick Links */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-[#0F5638] text-xs sm:text-sm uppercase tracking-wider">Links</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-stone-600 font-normal">
                <li><Link href="/" className="hover:text-[#0F5638] transition-colors duration-200">Home</Link></li>
                <li><Link href="/products" className="hover:text-[#0F5638] transition-colors duration-200">Shop All Spices</Link></li>
                <li><Link href="/signature-collection" className="hover:text-[#0F5638] transition-colors duration-200">Signature Collection</Link></li>
                <li><Link href="/about" className="hover:text-[#0F5638] transition-colors duration-200">About Us</Link></li>
                <li><Link href="/recipes" className="hover:text-[#0F5638] transition-colors duration-200">Recipes &amp; Vlogs</Link></li>
                <li><Link href="/contact" className="hover:text-[#0F5638] transition-colors duration-200">Contact Us</Link></li>
                <li><Link href="/account" className="hover:text-[#0F5638] transition-colors duration-200">Track Your Order</Link></li>
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

        {/* Copyright & Website Development Credits */}
        <div className="pt-4 sm:pt-5 border-t border-stone-200/60 text-center text-xs text-stone-500 space-y-1">
          <p>&copy; 2026 Yum Nest. All rights reserved.</p>
          <p className="text-[11px] text-stone-400 font-medium">
            Designed &amp; Developed by Adhil EK and Muhammed Rashid PS
          </p>
        </div>

      </div>
    </footer>
  );
};
