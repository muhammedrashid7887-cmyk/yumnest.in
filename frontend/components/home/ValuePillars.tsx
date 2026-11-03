'use client';

import React from 'react';
import Link from 'next/link';
import { Award, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export const ValuePillars: React.FC = () => {
  return (
    <section id="awards" className="bg-[#F5F0E6] border-y border-[#E8DFC8] py-12 sm:py-16 lg:py-20 overflow-hidden scroll-mt-20 reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">

          {/* ── Left : Preserved Stage Ceremony Award Photograph ── */}
          <div className="lg:col-span-5 relative w-full max-w-md mx-auto lg:max-w-none">
            {/* Subtle warm glow background */}
            <div className="absolute -inset-3 rounded-3xl bg-[#E8AA42]/15 blur-2xl pointer-events-none" />
            
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-[#E8DFC8] bg-[#0F5638]/5 group">
              <img
                src="/assets/award.jpeg"
                alt="Yumnest receiving Business Excellency Award at Kerala Trade Expo"
                loading="lazy"
                className="w-full h-auto block aspect-[4/5] object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
              />
              
              {/* Elegant Presentation Caption */}
              <div className="p-3 sm:p-3.5 bg-white/95 backdrop-blur-sm border-t border-[#E8DFC8] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#E8AA42]/20 flex items-center justify-center text-[#9E7326] shrink-0">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#0F5638] truncate">Kerala Trade Expo Presentation Ceremony</p>
                    <p className="text-[11px] text-stone-500">Official Stage Handover</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0F5638] text-white shrink-0">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* ── Right : Content & Achievements ── */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-6">

            {/* Honours Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8AA42]/15 text-[#9E7326] text-xs font-bold uppercase tracking-widest border border-[#E8AA42]/30 w-fit">
              <Award className="w-3.5 h-3.5 text-[#E8AA42]" />
              <span>Honours &amp; Recognition</span>
            </div>

            {/* Award Header */}
            <div className="space-y-2">
              <h2 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-[#0F5638] leading-tight tracking-tight">
                Business Excellency Award
              </h2>
              <p className="text-sm sm:text-base font-semibold text-[#E8AA42]">
                Conferred at Kerala Trade Expo
              </p>
              <div className="w-12 h-1 rounded-full bg-[#E8AA42]" />
            </div>

            {/* Award Description */}
            <p className="text-stone-600 text-xs sm:text-sm lg:text-base leading-relaxed max-w-xl font-normal">
              Honoured on stage with the Business Excellency Award in appreciation of our pioneering commitment to pure Kerala spices, ethical local farm procurement, and breakthrough natural seasoning innovations like the signature Yumnest Broast Masala.
            </p>

            {/* Two Achievements in Clean, Elegant Information Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1 sm:pt-2">
              {/* Card 1: Purity Benchmark */}
              <div className="group relative p-4 sm:p-5 rounded-2xl bg-white/95 hover:bg-white border border-[#E8DFC8] hover:border-[#0F5638]/40 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#0F5638]/10 text-[#0F5638] group-hover:bg-[#0F5638] group-hover:text-[#E8AA42] flex items-center justify-center shrink-0 transition-colors duration-200">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F5638]">
                    Purity Benchmark
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-normal">
                    Acknowledged for delivering 100% filler-free ground masalas with zero chemical flow agents.
                  </p>
                </div>
              </div>

              {/* Card 2: Culinary Impact */}
              <div className="group relative p-4 sm:p-5 rounded-2xl bg-white/95 hover:bg-white border border-[#E8DFC8] hover:border-[#0F5638]/40 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#E8AA42]/20 text-[#9E7326] group-hover:bg-[#0F5638] group-hover:text-[#E8AA42] flex items-center justify-center shrink-0 transition-colors duration-200">
                    <Sparkles className="w-5 h-5 text-[#E8AA42] group-hover:text-[#E8AA42]" />
                  </div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F5638]">
                    Home &amp; Commercial Culinary Impact
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-normal">
                    Enabling families and fast-food eateries to cook authentic crispy broasts effortlessly.
                  </p>
                </div>
              </div>
            </div>

            {/* Taste Our Award-Winning Spices CTA Button */}
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-xl transition-all active:scale-95 cursor-pointer group"
              >
                <span>Taste Our Award-Winning Spices</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
