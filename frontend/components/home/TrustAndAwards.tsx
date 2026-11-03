'use client';

import React from 'react';
import Link from 'next/link';
import { Award, ShieldCheck, ArrowRight } from 'lucide-react';

export const TrustAndAwards: React.FC = () => {
  return (
    <section id="awards" className="bg-[#F5F0E6] border-y border-[#E8DFC8] py-12 sm:py-16 lg:py-20 overflow-hidden scroll-mt-20 reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">

          {/* ── Left : Preserved Ceremony Stage Photograph (Clean, No Overlay) ── */}
          <div className="lg:col-span-5 relative w-full max-w-md mx-auto lg:max-w-none">
            {/* Subtle warm glow */}
            <div className="absolute -inset-3 rounded-3xl bg-[#E8AA42]/15 blur-2xl pointer-events-none" />
            
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-[#E8DFC8] bg-white group">
              <img
                src="/assets/award.jpeg"
                alt="Yum Nest founders receiving award on stage"
                loading="lazy"
                className="w-full h-auto block aspect-[4/5] object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          </div>

          {/* ── Right : The Story Behind Yum Nest ── */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-6">

            {/* Header & Subtitle */}
            <div className="space-y-2">
              <h2 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-[#0F5638] leading-tight tracking-tight">
                The Story Behind Yum Nest
              </h2>
              <p className="text-sm sm:text-base font-semibold text-[#E8AA42]">
                From Our Kitchen to Your Home
              </p>
              <div className="w-12 h-1 rounded-full bg-[#E8AA42]" />
            </div>

            {/* Story Paragraph */}
            <p className="text-stone-600 text-xs sm:text-sm lg:text-base leading-relaxed max-w-xl font-normal">
              &lsquo;Yum Nest&rsquo; is the realization of 15 years of expat culinary passion and dreams. Built with the steadfast business vision of Dubai-based businessman Thanseel and the culinary mastery of award-winning chef Faseeha Thanseel, our journey from home cooking to an acclaimed spice venture is dedicated to delivering pure, authentic flavours with uncompromising quality.
            </p>

            {/* Two Clean, Elegant Information Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1 sm:pt-2">
              {/* Card 1: Accolades & Milestones */}
              <div className="group relative p-4 sm:p-5 rounded-2xl bg-white/95 hover:bg-white border border-[#E8DFC8] hover:border-[#0F5638]/40 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#E8AA42]/20 text-[#9E7326] group-hover:bg-[#0F5638] group-hover:text-[#E8AA42] flex items-center justify-center shrink-0 transition-colors duration-200">
                    <Award className="w-5 h-5 text-[#E8AA42] group-hover:text-[#E8AA42]" />
                  </div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F5638]">
                    Award-Winning Recognition
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-normal">
                    Malabar Adukkala Title Winner 2018 &amp; Business Kerala Award 2024. Officially launched by Shri Joseph IAS at Lulu Twin Tower.
                  </p>
                </div>
              </div>

              {/* Card 2: Purity & Family Care */}
              <div className="group relative p-4 sm:p-5 rounded-2xl bg-white/95 hover:bg-white border border-[#E8DFC8] hover:border-[#0F5638]/40 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#0F5638]/10 text-[#0F5638] group-hover:bg-[#0F5638] group-hover:text-[#E8AA42] flex items-center justify-center shrink-0 transition-colors duration-200">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F5638]">
                    100% Pure &amp; Natural
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-normal">
                    Food is health and happiness. Every blend is prepared with zero chemicals, pure spices, and the exact love we give our own family.
                  </p>
                </div>
              </div>
            </div>

            {/* Founder Signature Sign-Off & CTA Button */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#E8DFC8]/60">
              <div>
                <p className="text-sm font-bold text-[#0F5638]">
                  Thanseel &amp; Chef Faseeha Thanseel
                </p>
                <p className="text-xs text-[#9E7326] font-medium">
                  Founders, Yum Nest
                </p>
              </div>

              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-xl transition-all active:scale-95 cursor-pointer group w-fit"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
