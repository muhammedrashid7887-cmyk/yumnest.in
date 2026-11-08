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
    <footer id="footer" className="bg-[#FBF9F5] text-stone-700 pt-12 pb-20 lg:pb-12 border-t border-[#E8DFC8] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Main Footer Layout: Brand on Left, Columns on Right ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pb-8 sm:pb-10">
          
          {/* Brand Column (Spans 4 on Desktop, Full Width on Mobile) */}
          <div className="lg:col-span-4 space-y-3.5">
            <BrandLogo />
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed pr-4">
              Experience authentic restaurant-style broasted chicken with our Premium Broast Masala.
              <br />
              Made with carefully selected natural spices for the perfect crunch and rich flavour.
              <br />
              Enjoy crispy golden chicken outside and tender, juicy goodness inside.
              <br />
              100% pure, easy to use, and perfect for every home and professional kitchen.
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
                  className="w-9 h-9 rounded-full bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center shadow transition-all duration-300 hover:scale-110 active:scale-95 border border-stone-300 cursor-pointer"
                >
                  <XIcon className="w-3.5 h-3.5 fill-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-[#0F5638] text-xs sm:text-sm uppercase tracking-wider">Links</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600 font-normal">
              <li><Link href="/" className="hover:text-[#0F5638] transition-colors duration-200">Home</Link></li>
              <li><Link href="/products" className="hover:text-[#0F5638] transition-colors duration-200">Shop</Link></li>
              <li><Link href="/#about" className="hover:text-[#0F5638] transition-colors duration-200">About Us</Link></li>
              <li><Link href="/#awards" className="hover:text-[#0F5638] transition-colors duration-200">Awards</Link></li>
              <li><Link href="/#recipes" className="hover:text-[#0F5638] transition-colors duration-200">Recipes</Link></li>
              <li><Link href="/cart" className="hover:text-[#0F5638] transition-colors duration-200">Track Your Order</Link></li>
              <li><a href="#contact" className="hover:text-[#0F5638] transition-colors duration-200">Contact Us</a></li>
            </ul>
          </div>

          {/* Company Policy */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-bold text-[#0F5638] text-xs sm:text-sm uppercase tracking-wider">Company Policy</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600 font-normal">
              <li><a href="#footer" className="hover:text-[#0F5638] transition-colors duration-200">Shipping &amp; Delivery</a></li>
              <li><a href="#footer" className="hover:text-[#0F5638] transition-colors duration-200">Disclaimer</a></li>
              <li><a href="#footer" className="hover:text-[#0F5638] transition-colors duration-200">Terms And Conditions</a></li>
              <li><a href="#footer" className="hover:text-[#0F5638] transition-colors duration-200">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Official Info */}
          <div className="lg:col-span-3 space-y-3">

            <div className="text-[#0F5638] text-xs sm:text-sm font-bold tracking-wide">
              YUMNEST SPICES & FOODS
            </div>
            <ul className="space-y-2.5 text-xs sm:text-[15px] text-stone-600 font-normal">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C87A14] shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-900 font-semibold">Address:</span>
                  <p className="leading-snug">Thoppumpady, Kochi – 5</p>
                  <p className="leading-snug">Ernakulam, Kerala, India</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C87A14] shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-900 font-semibold">Phone: </span>
                  <a href="tel:+917012268934" className="text-stone-700 hover:text-[#0F5638] transition-colors font-medium">
                    +91 70122 68934
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C87A14] shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-900 font-semibold">Email: </span>
                  <a href="mailto:yumnest2000@gmail.com" className="text-stone-700 hover:text-[#0F5638] transition-colors font-medium">
                    yumnest2000@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2 pt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#C87A14] shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-900 font-semibold">Business Hours:</span>
                  <p className="leading-snug">Monday – Saturday | 9:00 AM – 7:00 PM IST</p>
                </div>
              </li>
            </ul>

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
