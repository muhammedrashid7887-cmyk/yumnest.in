import React from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { 
  Phone, 
  Mail, 
  MapPin,
  Clock
} from 'lucide-react';
import { SITE_SETTINGS } from '@/data/mockData';
import {
  WhatsAppIcon,
  InstagramIcon,
  FacebookIcon,
  LinkedInIcon,
  XIcon,
} from './BrandMediaIcons';

export const Footer: React.FC = () => {
  const whatsappCleanNumber = SITE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <footer id="footer" className="bg-[#FAF8F5] text-stone-700 pt-10 sm:pt-14 pb-24 lg:pb-12 border-t border-[#E8DFC8] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Main Footer Layout: Brand on Left, Columns on Right ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pb-8 sm:pb-10">
          
          {/* Brand Column (Spans 4 on Desktop, Full Width on Mobile) */}
          <div className="lg:col-span-4 space-y-3.5">
            <BrandLogo />
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed max-w-sm font-normal">
              Experience authentic restaurant-style broasted chicken and pure single-origin Kerala spices. Crafted with natural ingredients for the perfect crunch, rich aroma, and pure health.
            </p>

            {/* Social & Messaging Icons (Icon Only) */}
            <div className="pt-1 sm:pt-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent('🌿 Hello Yumnest! I would like to inquire about your pure spices and home delivery options. 🙏')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  title="WhatsApp"
                  className="w-9 h-9 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center shadow-xs transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-white" />
                </a>

                {/* Instagram */}
                <a
                  href={SITE_SETTINGS.instagramUrl || 'https://instagram.com/yumnest.in'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  title="Instagram"
                  className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white flex items-center justify-center shadow-xs transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <InstagramIcon className="w-4 h-4 stroke-white" />
                </a>

                {/* Facebook */}
                <a
                  href={SITE_SETTINGS.facebookUrl || 'https://facebook.com/yumnest'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  title="Facebook"
                  className="w-9 h-9 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center shadow-xs transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <FacebookIcon className="w-4 h-4 fill-white" />
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/company/yumnest"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  title="LinkedIn"
                  className="w-9 h-9 rounded-full bg-[#0A66C2] hover:bg-[#095196] text-white flex items-center justify-center shadow-xs transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <LinkedInIcon className="w-4 h-4 fill-white" />
                </a>

                {/* X */}
                <a
                  href="https://x.com/yumnest"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                  title="X"
                  className="w-9 h-9 rounded-full bg-black hover:bg-stone-800 text-white flex items-center justify-center shadow-xs transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <XIcon className="w-3.5 h-3.5 fill-white" />
                </a>
              </div>
            </div>
          </div>

          {/* 
            ── Links & Info Grid: 
            2 Columns on Mobile ("align 2 side in mob"), 3 Columns on Desktop (lg:col-span-8)
          ── */}
          <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-8 gap-x-6 gap-y-8 sm:gap-x-8 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E8DFC8]/70">
            
            {/* Column 1: Links (Col 1 on mobile, 2 cols on lg) */}
            <div className="col-span-1 lg:col-span-2 space-y-3">
              <h4 className="font-bold text-stone-900 text-xs sm:text-sm uppercase tracking-wider">
                Links
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-stone-600 font-normal">
                <li><Link href="/" className="hover:text-[#0F5638] transition-colors duration-200">Home</Link></li>
                <li><Link href="/products" className="hover:text-[#0F5638] transition-colors duration-200">Shop</Link></li>
                <li><Link href="/#about" className="hover:text-[#0F5638] transition-colors duration-200">About Us</Link></li>
                <li><Link href="/#awards" className="hover:text-[#0F5638] transition-colors duration-200">Awards</Link></li>
                <li><Link href="/#recipes" className="hover:text-[#0F5638] transition-colors duration-200">Recipes</Link></li>
                <li><Link href="/cart" className="hover:text-[#0F5638] transition-colors duration-200">Track Order</Link></li>
                <li><a href="#contact" className="hover:text-[#0F5638] transition-colors duration-200">Contact Us</a></li>
              </ul>
            </div>

            {/* Column 2: Company Policy (Col 2 on mobile, 3 cols on lg) */}
            <div className="col-span-1 lg:col-span-3 space-y-3">
              <h4 className="font-bold text-stone-900 text-xs sm:text-sm uppercase tracking-wider">
                Company Policy
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-stone-600 font-normal">
                <li><a href="#footer" className="hover:text-[#0F5638] transition-colors duration-200">Shipping &amp; Delivery</a></li>
                <li><a href="#footer" className="hover:text-[#0F5638] transition-colors duration-200">Disclaimer</a></li>
                <li><a href="#footer" className="hover:text-[#0F5638] transition-colors duration-200">Terms &amp; Conditions</a></li>
                <li><a href="#footer" className="hover:text-[#0F5638] transition-colors duration-200">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Column 3: Contact / Official Info (Col 1 & 2 on mobile, 3 cols on lg) */}
            <div className="col-span-2 lg:col-span-3 space-y-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E8DFC8]/50">
              <div className="text-stone-900 text-xs sm:text-sm font-bold uppercase tracking-wider">
                Yumnest Spices &amp; Foods
              </div>
              
              {/* On mobile, address and contact can be side-by-side or stacked cleanly */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 text-xs sm:text-[14px] text-stone-600 font-normal">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#0F5638] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-900 font-medium">Address:</span>
                    <p className="leading-snug">Thoppumpady, Kochi – 5</p>
                    <p className="leading-snug">Ernakulam, Kerala, India</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#0F5638] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-stone-900 font-medium">Phone: </span>
                      <a href="tel:+917012268934" className="hover:text-[#0F5638] font-semibold text-stone-800 transition-colors">
                        +91 70122 68934
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#0F5638] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-stone-900 font-medium">Email: </span>
                      <a href="mailto:yumnest2000@gmail.com" className="hover:text-[#0F5638] text-stone-800 transition-colors break-all">
                        yumnest2000@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-0.5 sm:col-span-2 lg:col-span-1">
                  <Clock className="w-3.5 h-3.5 text-[#E8AA42] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-900 font-medium">Business Hours:</span>
                    <p className="leading-snug text-[13px]">Mon – Sat | 9:00 AM – 7:00 PM IST</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-[#E8DFC8] text-center text-xs text-stone-500">
          <p>© 2026 Yumnest. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};
