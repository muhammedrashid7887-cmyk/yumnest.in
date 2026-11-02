'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const BroastPromoBanner: React.FC = () => {
  return (
    <section id="broast-special" className="py-10 sm:py-16 lg:py-20 bg-[#F5F0E6] border-y border-[#E8DFC8] overflow-hidden reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading: Our Signature Product */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D9381E] block mb-1.5">
            Special Spotlight
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#12372A] tracking-tight leading-tight">
            Our Signature Product
          </h2>
          <div className="w-12 h-0.5 sm:h-1 bg-[#D9381E] mx-auto mt-2 rounded-full" />
        </div>

        {/* Two-Column Parallel Layout: Left = Image, Right = Text Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          
          {/* ── Left Column: Product Image ── */}
          <div className="flex justify-center items-center">
            <img
              src="/assets/Broast Masala Crunch.png"
              alt="YumNest Broast Masala Powder - Signature Crunch"
              loading="lazy"
              className="w-full max-w-[320px] sm:max-w-[420px] md:max-w-[460px] lg:max-w-[500px] h-auto object-contain rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]"
            />
          </div>

          {/* ── Right Column: Text Content ── */}
          <div className="space-y-4 sm:space-y-5 text-left flex flex-col justify-center">
            
            {/* Title & Tagline */}
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#12372A] leading-tight tracking-tight">
                Welcome to Premium Broaster Masala
              </h3>
              <p className="text-xs sm:text-sm md:text-base font-semibold text-[#D9381E] leading-normal tracking-normal">
                The Secret to Perfectly Crispy &amp; Flavorful Broasted Chicken!
              </p>
            </div>

            {/* Short Intro Paragraph */}
            <p className="text-stone-700 text-xs sm:text-sm md:text-[15px] leading-relaxed font-normal">
              At our core, we are passionate about bringing authentic, restaurant-quality taste directly to your kitchen. Crafted with carefully selected spices and premium natural ingredients, our Broast Masala Powder gives you the ideal crunch on the outside while keeping the chicken tender and juicy inside.
            </p>

            {/* Why Choose Our Broast Masala? - Simple & Clean */}
            <div className="pt-2 sm:pt-3 space-y-3">
              <h4 className="font-bold text-sm sm:text-base text-[#12372A] flex items-center gap-2 tracking-normal">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#D9381E] shrink-0" />
                <span>Why Choose Our Broast Masala?</span>
              </h4>

              <ul className="space-y-2.5 sm:space-y-3 text-stone-700 text-xs sm:text-sm leading-relaxed font-normal">
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#D9381E] mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-stone-900 font-semibold">100% Natural &amp; Pure:</strong> Free from artificial colors, preservatives, and synthetic additives.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#D9381E] mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-stone-900 font-semibold">Authentic Flavor:</strong> A balanced blend of spices tailored for crispiness and superior taste.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#D9381E] mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-stone-900 font-semibold">Easy &amp; Quick:</strong> Perfect for home cooking as well as commercial culinary needs.
                  </span>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* ── Shop Now Button: Bottom Middle ── */}
        <div className="mt-8 sm:mt-12 text-center">
          <Link
            href="/products/broast-masala-powder"
            className="inline-flex items-center gap-2.5 px-8 sm:px-10 py-3 sm:py-3.5 rounded-full bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-xl hover-btn-smooth cursor-pointer group"
          >
            <span>Shop Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
};
