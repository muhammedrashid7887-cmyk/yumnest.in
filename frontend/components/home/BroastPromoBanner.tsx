'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface BroastPromoBannerProps {
  buttonText?: string;
  buttonHref?: string;
}

export const BroastPromoBanner: React.FC<BroastPromoBannerProps> = ({
  buttonText = 'Explore Signature Collection',
  buttonHref = '/signature-collection',
}) => {
  return (
    <section
      id="broast-special"
      className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-[#FAF7F0] via-white to-[#FAF7F0] border-y border-[#E8DFC8]/70 overflow-hidden reveal-on-scroll relative"
      suppressHydrationWarning
    >
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E8AA42]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Top Header & Title ── */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F5638] tracking-tight leading-tight">
            Our Signature Product
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-stone-500 mt-1 uppercase tracking-wider">
            Our Signature Broast Masala Powder
          </p>
          <div className="w-12 h-1 bg-[#D9381E] mx-auto mt-2.5 rounded-full" />
        </div>

        {/* ── Responsive Flow: (3 Features, Image, 3 Features) on Mobile & Desktop ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-8 items-center">

          {/* ── 1. First 3 Features (Order 1 on Mobile, Left Column on Desktop) ── */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6 lg:space-y-10 order-1">
            
            {/* Feature 1: Crispy Coating */}
            <div className="bg-white/90 lg:bg-transparent rounded-2xl p-4 sm:p-5 lg:p-0 border border-[#E8DFC8]/60 lg:border-none shadow-2xs lg:shadow-none space-y-1.5 lg:text-right group transition-all duration-200">
              <h3 className="text-sm sm:text-base font-extrabold text-stone-900 group-hover:text-[#0F5638] transition-colors tracking-tight">
                Crispy Coating
              </h3>
              <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed font-normal">
                Specially blended for that perfect golden crunch and craggy restaurant-style crispiness with every fry.
              </p>
            </div>

            {/* Feature 2: Balanced Spices */}
            <div className="bg-white/90 lg:bg-transparent rounded-2xl p-4 sm:p-5 lg:p-0 border border-[#E8DFC8]/60 lg:border-none shadow-2xs lg:shadow-none space-y-1.5 lg:text-right group transition-all duration-200">
              <h3 className="text-sm sm:text-base font-extrabold text-stone-900 group-hover:text-[#0F5638] transition-colors tracking-tight">
                Balanced Spices
              </h3>
              <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed font-normal">
                A harmonious blend of Kashmiri chili heat and stone-ground spices—just the right kick without overpowering.
              </p>
            </div>

            {/* Feature 3: Easy to Prepare */}
            <div className="bg-white/90 lg:bg-transparent rounded-2xl p-4 sm:p-5 lg:p-0 border border-[#E8DFC8]/60 lg:border-none shadow-2xs lg:shadow-none space-y-1.5 lg:text-right group transition-all duration-200">
              <h3 className="text-sm sm:text-base font-extrabold text-stone-900 group-hover:text-[#0F5638] transition-colors tracking-tight">
                Easy to Prepare
              </h3>
              <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed font-normal">
                Restaurant-quality broasted chicken at home in minutes—simply marinate, dredge in seasoned flour, and fry.
              </p>
            </div>

          </div>

          {/* ── 2. Center Product Image (Order 2 on Mobile: Sits between 3 & 3) ── */}
          <div className="lg:col-span-4 flex justify-center items-center order-2 my-2 sm:my-4 lg:my-0">
            <div className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[500px] mx-auto group">
              {/* Warm Halo Glow behind Product */}
              <div className="absolute inset-0 rounded-full bg-[#E8AA42]/20 blur-2xl transform group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

              <img
                src="/assets/signature-broast-showcase.png"
                alt="Yumnest Broast Masala Powder - Signature Range & Crispy Chicken"
                loading="lazy"
                decoding="async"
                width={500}
                height={500}
                className="relative z-10 w-full h-auto object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.18)] hover:drop-shadow-[0_24px_36px_rgba(0,0,0,0.24)] transition-all duration-500 ease-out group-hover:scale-[1.03]"
              />
            </div>
          </div>

          {/* ── 3. Next 3 Features (Order 3 on Mobile, Right Column on Desktop) ── */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6 lg:space-y-10 order-3">

            {/* Feature 4: Made with Pure Spices */}
            <div className="bg-white/90 lg:bg-transparent rounded-2xl p-4 sm:p-5 lg:p-0 border border-[#E8DFC8]/60 lg:border-none shadow-2xs lg:shadow-none space-y-1.5 text-left group transition-all duration-200">
              <h3 className="text-sm sm:text-base font-extrabold text-stone-900 group-hover:text-[#0F5638] transition-colors tracking-tight">
                100% Pure Spices &amp; No Fillers
              </h3>
              <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed font-normal">
                Zero artificial flavors, synthetic preservatives, or fillers—only high-quality, naturally processed pure Kerala spices.
              </p>
            </div>

            {/* Feature 5: Consistent Restaurant-Style Results */}
            <div className="bg-white/90 lg:bg-transparent rounded-2xl p-4 sm:p-5 lg:p-0 border border-[#E8DFC8]/60 lg:border-none shadow-2xs lg:shadow-none space-y-1.5 text-left group transition-all duration-200">
              <h3 className="text-sm sm:text-base font-extrabold text-stone-900 group-hover:text-[#0F5638] transition-colors tracking-tight">
                Restaurant-Style Results
              </h3>
              <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed font-normal">
                Designed to deliver the exact same mouthwatering taste, crunchy texture, and golden color every single time you cook.
              </p>
            </div>

            {/* Feature 6: Boosts Aroma & Juiciness */}
            <div className="bg-white/90 lg:bg-transparent rounded-2xl p-4 sm:p-5 lg:p-0 border border-[#E8DFC8]/60 lg:border-none shadow-2xs lg:shadow-none space-y-1.5 text-left group transition-all duration-200">
              <h3 className="text-sm sm:text-base font-extrabold text-stone-900 group-hover:text-[#0F5638] transition-colors tracking-tight">
                Locks in Tender Juiciness
              </h3>
              <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed font-normal">
                Natural seasoning seals in succulent juices, keeping chicken tender and moist inside while ultra-crispy outside.
              </p>
            </div>

          </div>

        </div>

        {/* ── Shop Now CTA Button ── */}
        <div className="mt-10 sm:mt-14 text-center">
          <Link
            href={buttonHref}
            className="inline-flex items-center gap-2.5 px-8 sm:px-10 py-3 sm:py-3.5 rounded-full bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-xl hover-btn-smooth cursor-pointer group"
          >
            <span>{buttonText}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default BroastPromoBanner;
