'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const BroastPromoBanner: React.FC = () => {
  return (
    <section id="broast-special" className="py-6 sm:py-16 lg:py-20 bg-[#F5F4EB] border-y border-stone-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading: Our Signature Product */}
        <div className="text-center mb-4 sm:mb-8 lg:mb-10">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#D9381E] block mb-1">
            Special Spotlight
          </span>
          <h2 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-[#12372A] tracking-tight">
            Our Signature Product
          </h2>
          <div className="w-10 sm:w-14 h-0.5 sm:h-1 bg-[#D9381E] mx-auto mt-1.5 sm:mt-2 rounded-full" />
        </div>

        {/* Two-Column Layout: Left = Image + Why Choose under it, Right = Heading, Story, Highlights & CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-12 items-start">
          
          {/* ── Left Column: Hero Image ── */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="w-full flex justify-center">
              <img
                src="/assets/Broast Masala Crunch.png"
                alt="YumNest Broast Masala Powder - Signature Crunch"
                loading="lazy"
                className="w-full max-w-[320px] xs:max-w-sm sm:max-w-md lg:max-w-lg h-auto object-contain rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.01]"
              />
            </div>
          </div>

          {/* ── Right Column: Clean Shortened Content ── */}
          <div className="lg:col-span-6 space-y-3.5 sm:space-y-5 text-left flex flex-col justify-center">
            
            {/* Title & Tagline */}
            <div className="space-y-1 sm:space-y-1.5">
              <h2 className="text-lg sm:text-3xl lg:text-4xl font-serif font-bold text-[#12372A] leading-tight">
                Welcome to Premium Broaster Masala
              </h2>
              <p className="text-xs sm:text-base font-semibold text-[#D9381E]">
                The Secret to Perfectly Crispy &amp; Flavorful Broasted Chicken!
              </p>
            </div>

            {/* Short Intro Paragraph */}
            <p className="text-stone-700 text-xs sm:text-sm md:text-[14px] leading-relaxed">
              At our core, we are passionate about bringing authentic, restaurant-quality taste directly to your kitchen. Crafted with carefully selected spices and premium natural ingredients, our Broast Masala Powder gives you the ideal crunch on the outside while keeping the chicken tender and juicy inside.
            </p>

            {/* Why Choose Our Broast Masala? Highlights */}
            <div className="space-y-2 sm:space-y-3 pt-0.5 sm:pt-1">
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#12372A] flex items-center gap-1.5 sm:gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D9381E]" />
                <span>Why Choose Our Broast Masala?</span>
              </h3>

              <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-stone-200/80 shadow-2xs flex items-start gap-2.5 sm:gap-3.5 hover:border-[#12372A]/30 transition-colors">
                <div className="text-xl sm:text-2xl shrink-0 mt-0.5">🌿</div>
                <div>
                  <h4 className="text-xs sm:text-[13px] font-bold text-stone-900 leading-snug">
                    100% Natural &amp; Pure
                  </h4>
                  <p className="text-[10px] sm:text-xs text-stone-600 mt-0.5 leading-relaxed">
                    Free from artificial colors, preservatives, and synthetic additives.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-stone-200/80 shadow-2xs flex items-start gap-2.5 sm:gap-3.5 hover:border-[#12372A]/30 transition-colors">
                <div className="text-xl sm:text-2xl shrink-0 mt-0.5">🍗</div>
                <div>
                  <h4 className="text-xs sm:text-[13px] font-bold text-stone-900 leading-snug">
                    Authentic Flavor
                  </h4>
                  <p className="text-[10px] sm:text-xs text-stone-600 mt-0.5 leading-relaxed">
                    A balanced blend of spices tailored for crispiness and superior taste.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-stone-200/80 shadow-2xs flex items-start gap-2.5 sm:gap-3.5 hover:border-[#12372A]/30 transition-colors">
                <div className="text-xl sm:text-2xl shrink-0 mt-0.5">⚡</div>
                <div>
                  <h4 className="text-xs sm:text-[13px] font-bold text-stone-900 leading-snug">
                    Easy &amp; Quick
                  </h4>
                  <p className="text-[10px] sm:text-xs text-stone-600 mt-0.5 leading-relaxed">
                    Perfect for home cooking as well as commercial culinary needs.
                  </p>
                </div>
              </div>
            </div>

            {/* SHOP NOW Button linking to broast powder */}
            <div className="pt-1 sm:pt-2">
              <Link
                href="/products/broast-masala-powder"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
