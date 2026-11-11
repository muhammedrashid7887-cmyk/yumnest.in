'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const BroastPromoBanner: React.FC = () => {
  return (
    <section
      id="broast-special"
      className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-[#FBF9F5] via-white to-[#FBF9F5] border-y border-[#E8DFC8]/70 overflow-hidden reveal-on-scroll relative"
    >
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E8AA42]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Top Header & Title ── */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D9381E] block mb-1.5">
            Special Spotlight
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F5638] tracking-tight leading-tight">
            Our Signature Product
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-stone-500 mt-1 uppercase tracking-wider">
            Our Signature Broast Masala Powder
          </p>
          <div className="w-12 h-1 bg-[#D9381E] mx-auto mt-2.5 rounded-full" />
        </div>

        {/* ── Two-Column Parallel Layout: Left = Product Image, Right = Subheadings & Features ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">

          {/* ── 1. Left Column: Product Image (Prominent & High Impact) ── */}
          <div className="lg:col-span-5 flex justify-center items-center order-1">
            <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[440px] mx-auto group">
              {/* Warm Halo Glow behind Product */}
              <div className="absolute inset-0 rounded-full bg-[#E8AA42]/20 blur-2xl transform group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

              <img
                src="/assets/Broast Masala Crunch.png"
                alt="Yumnest Broast Masala Powder - Signature Crispy Crunch"
                loading="lazy"
                className="relative z-10 w-full h-auto object-contain rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 ease-out group-hover:scale-[1.02]"
              />
            </div>
          </div>

          {/* ── 2. Right Column: All 6 Subheadings & Features moved to the right side ── */}
          <div className="lg:col-span-7 order-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
              
              {/* Feature 1: Crispy Coating */}
              <div className="bg-white/95 rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-1.5 text-left group hover:border-[#0F5638]/40 transition-all duration-200">
                <h3 className="text-sm sm:text-base font-extrabold text-stone-900 group-hover:text-[#0F5638] transition-colors tracking-tight">
                  Crispy Coating
                </h3>
                <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed font-normal">
                  Specially blended for that perfect golden crunch and craggy restaurant-style crispiness with every fry.
                </p>
              </div>

              {/* Feature 2: 100% Pure Spices */}
              <div className="bg-white/95 rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-1.5 text-left group hover:border-[#0F5638]/40 transition-all duration-200">
                <h3 className="text-sm sm:text-base font-extrabold text-stone-900 group-hover:text-[#0F5638] transition-colors tracking-tight">
                  100% Pure Spices &amp; No Fillers
                </h3>
                <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed font-normal">
                  Zero artificial flavors, synthetic preservatives, or fillers—only high-quality, naturally processed pure Kerala spices.
                </p>
              </div>

              {/* Feature 3: Balanced Spices */}
              <div className="bg-white/95 rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-1.5 text-left group hover:border-[#0F5638]/40 transition-all duration-200">
                <h3 className="text-sm sm:text-base font-extrabold text-stone-900 group-hover:text-[#0F5638] transition-colors tracking-tight">
                  Balanced Spices
                </h3>
                <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed font-normal">
                  A harmonious blend of Kashmiri chili heat and stone-ground spices—just the right kick without overpowering.
                </p>
              </div>

              {/* Feature 4: Restaurant-Style Results */}
              <div className="bg-white/95 rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-1.5 text-left group hover:border-[#0F5638]/40 transition-all duration-200">
                <h3 className="text-sm sm:text-base font-extrabold text-stone-900 group-hover:text-[#0F5638] transition-colors tracking-tight">
                  Restaurant-Style Results
                </h3>
                <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed font-normal">
                  Designed to deliver the exact same mouthwatering taste, crunchy texture, and golden color every single time you cook.
                </p>
              </div>

              {/* Feature 5: Easy to Prepare */}
              <div className="bg-white/95 rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-1.5 text-left group hover:border-[#0F5638]/40 transition-all duration-200">
                <h3 className="text-sm sm:text-base font-extrabold text-stone-900 group-hover:text-[#0F5638] transition-colors tracking-tight">
                  Easy to Prepare
                </h3>
                <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed font-normal">
                  Restaurant-quality broasted chicken at home in minutes—simply marinate, dredge in seasoned flour, and fry.
                </p>
              </div>

              {/* Feature 6: Locks in Juiciness */}
              <div className="bg-white/95 rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-1.5 text-left group hover:border-[#0F5638]/40 transition-all duration-200">
                <h3 className="text-sm sm:text-base font-extrabold text-stone-900 group-hover:text-[#0F5638] transition-colors tracking-tight">
                  Locks in Tender Juiciness
                </h3>
                <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed font-normal">
                  Natural seasoning seals in succulent juices, keeping chicken tender and moist inside while ultra-crispy outside.
                </p>
              </div>

            </div>

            {/* Shop Now CTA Button on the right column */}
            <div className="pt-2 text-left">
              <Link
                href="/products/broast-masala-powder"
                className="inline-flex items-center gap-2.5 px-8 sm:px-10 py-3 sm:py-3.5 rounded-full bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-xl hover-btn-smooth cursor-pointer group"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default BroastPromoBanner;
