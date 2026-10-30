import React from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  HeartHandshake
} from 'lucide-react';
import { SITE_SETTINGS } from '@/data/mockData';

export const Footer: React.FC = () => {
  const whatsappCleanNumber = SITE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <footer id="footer" className="bg-[#0A2219] text-stone-300 pt-12 pb-20 lg:pb-12 border-t border-[#183E2F] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Value Trust Grid Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-8 mb-8 border-b border-stone-800/80">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-[#E8AA42]/10 flex items-center justify-center text-[#E8AA42] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs sm:text-sm">100% Pure & Preservative Free</h3>
              <p className="text-[11px] text-stone-400">Zero MSG, no synthetic colours or fillers</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-[#E8AA42]/10 flex items-center justify-center text-[#E8AA42] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs sm:text-sm">All India Safe Delivery</h3>
              <p className="text-[11px] text-stone-400">Nitrogen-sealed freshness packaging</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-[#E8AA42]/10 flex items-center justify-center text-[#E8AA42] shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs sm:text-sm">Kerala High-Range Sourcing</h3>
              <p className="text-[11px] text-stone-400">Single-estate Wayanad & Idukki spices</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links Columns (matching reference Screen 1) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-8">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-3.5">
            <BrandLogo isLight />
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed pr-4">
              Authentic Kerala flavours since 2017. Introducing high-purity single-estate spices, crispy broast powders, and heritage cold-pressed oils direct from Kerala to your home.
            </p>

            <div className="pt-1">
              <a
                href={`https://wa.me/${whatsappCleanNumber}?text=Hi%20Yumnest,%20I%20have%20an%20inquiry.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#18533E] hover:bg-[#124230] text-white text-xs font-bold uppercase tracking-wider shadow transition-colors border border-emerald-600/40"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Message on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <p className="font-serif font-bold text-white text-sm tracking-wide">Links</p>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-400">
              <li><Link href="/" className="hover:text-[#E8AA42] transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-[#E8AA42] transition-colors">Shop</Link></li>
              <li><Link href="/#about" className="hover:text-[#E8AA42] transition-colors">About Us</Link></li>
              <li><Link href="/#recipes" className="hover:text-[#E8AA42] transition-colors">Recipes</Link></li>
              <li><Link href="/cart" className="hover:text-[#E8AA42] transition-colors">Track Your Order</Link></li>
              <li><a href="#contact" className="hover:text-[#E8AA42] transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Company Policy */}
          <div className="lg:col-span-3 space-y-3">
            <p className="font-serif font-bold text-white text-sm tracking-wide">Company Policy</p>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-400">
              <li><a href="#footer" className="hover:text-[#E8AA42] transition-colors">Shipping & Delivery</a></li>
              <li><a href="#footer" className="hover:text-[#E8AA42] transition-colors">Disclaimer</a></li>
              <li><a href="#footer" className="hover:text-[#E8AA42] transition-colors">Terms And Conditions</a></li>
              <li><a href="#footer" className="hover:text-[#E8AA42] transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Official Info */}
          <div className="lg:col-span-3 space-y-3">
            <p className="font-serif font-bold text-white text-sm tracking-wide">Official Info</p>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#E8AA42] shrink-0 mt-0.5" />
                <span>{SITE_SETTINGS.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E8AA42] shrink-0" />
                <a href={`tel:${SITE_SETTINGS.supportPhone}`} className="hover:text-white transition-colors">
                  {SITE_SETTINGS.supportPhone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#E8AA42] shrink-0" />
                <a href={`mailto:${SITE_SETTINGS.supportEmail}`} className="hover:text-white transition-colors">
                  {SITE_SETTINGS.supportEmail}
                </a>
              </li>
              <li className="text-[11px] text-stone-500 pt-1">
                Mon - Sat: 9:00 AM - 7:00 PM IST
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-stone-800 text-center text-xs text-stone-500">
          <p>© 2026 Yumnest. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};
