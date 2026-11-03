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

export const Footer: React.FC = () => {
  const whatsappCleanNumber = SITE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <footer id="footer" className="bg-[#0A3A25] text-stone-300 pt-12 pb-20 lg:pb-12 border-t border-[#134B33] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Main Footer Links Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-8">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-3.5">
            <BrandLogo isLight />
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed pr-4">
              Experience authentic restaurant-style broasted chicken with our Premium Broast Masala.
              <br />
              Made with carefully selected natural spices for the perfect crunch and rich flavour.
              <br />
              Enjoy crispy golden chicken outside and tender, juicy goodness inside.
              <br />
              100% pure, easy to use, and perfect for every home and professional kitchen.
            </p>

            <div className="pt-1">
              <a
                href={`https://wa.me/${whatsappCleanNumber}?text=Hi%20Yumnest,%20I%20have%20an%20inquiry.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#18533E] hover:bg-[#124230] text-white text-xs font-bold uppercase tracking-wider shadow transition-colors border border-emerald-600/40"
              >
                <img src="/assets/whatsapp-icon.png" alt="WhatsApp" className="w-4 h-4 object-contain shrink-0" />
                <span>Message on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">Links</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-400 font-normal">
              <li><Link href="/" className="hover:text-[#E8AA42] transition-colors duration-200">Home</Link></li>
              <li><Link href="/products" className="hover:text-[#E8AA42] transition-colors duration-200">Shop</Link></li>
              <li><Link href="/#about" className="hover:text-[#E8AA42] transition-colors duration-200">About Us</Link></li>
              <li><Link href="/#awards" className="hover:text-[#E8AA42] transition-colors duration-200">Awards</Link></li>
              <li><Link href="/#recipes" className="hover:text-[#E8AA42] transition-colors duration-200">Recipes</Link></li>
              <li><Link href="/cart" className="hover:text-[#E8AA42] transition-colors duration-200">Track Your Order</Link></li>
              <li><a href="#contact" className="hover:text-[#E8AA42] transition-colors duration-200">Contact Us</a></li>
            </ul>
          </div>

          {/* Company Policy */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">Company Policy</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-400 font-normal">
              <li><a href="#footer" className="hover:text-[#E8AA42] transition-colors duration-200">Shipping &amp; Delivery</a></li>
              <li><a href="#footer" className="hover:text-[#E8AA42] transition-colors duration-200">Disclaimer</a></li>
              <li><a href="#footer" className="hover:text-[#E8AA42] transition-colors duration-200">Terms And Conditions</a></li>
              <li><a href="#footer" className="hover:text-[#E8AA42] transition-colors duration-200">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Official Info */}
          <div className="lg:col-span-3 space-y-3">

            <div className="text-white text-xs sm:text-sm font-semibold tracking-wide">
              YUMNEST SPICES & FOODS
            </div>
            <ul className="space-y-2.5 text-xs sm:text-[15px] text-stone-400 font-normal">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#E8AA42] shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-300 font-medium">Address:</span>
                  <p className="leading-snug">Thoppumpady, Kochi – 5</p>
                  <p className="leading-snug">Ernakulam, Kerala, India</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E8AA42] shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-300 font-medium">Phone: </span>
                  <a href="tel:+917012268934" className="hover:text-white transition-colors">
                    +91 70122 68934
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-[#E8AA42] shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-300 font-medium">Email: </span>
                  <a href="mailto:yumnest2000@gmail.com" className="hover:text-white transition-colors">
                    yumnest2000@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2 pt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#E8AA42] shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-300 font-medium">Business Hours:</span>
                  <p className="leading-snug">Monday – Saturday | 9:00 AM – 7:00 PM IST</p>
                </div>
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
