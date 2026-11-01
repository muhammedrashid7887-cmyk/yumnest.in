'use client';

import React from 'react';
import Link from 'next/link';
import { Award, ShieldCheck, Leaf, Star, ArrowRight } from 'lucide-react';

const achievements = [
  {
    icon: Award,
    title: 'Business Excellency Award',
    desc: 'Recognised at Kerala Trade Expo 2023',
  },
  {
    icon: ShieldCheck,
    title: 'FSSAI Certified',
    desc: 'All products meet national food safety standards',
  },
  {
    icon: Leaf,
    title: '100% Natural Ingredients',
    desc: 'Zero MSG · No Preservatives · Zero Artificial Colours',
  },
  {
    icon: Star,
    title: 'Loved by 10,000+ Families',
    desc: 'Trusted across Kerala, delivered pan-India',
  },
];

export const ValuePillars: React.FC = () => {
  return (
    <section id="awards" className="bg-[#F4EFE6] border-y border-[#E8DFC8] py-10 sm:py-16 lg:py-20 overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">

          {/* ── Left : Award Image Showcase ── */}
          <div className="lg:col-span-5 relative w-full max-w-md mx-auto lg:max-w-none">
            {/* Subtle warm glow background */}
            <div className="absolute -inset-3 rounded-3xl bg-[#E8AA42]/15 blur-2xl pointer-events-none" />
            
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-[#E8DFC8] bg-white group">
              <img
                src="/assets/award.jpeg"
                alt="Yumnest receiving Business Excellency Award"
                loading="lazy"
                className="w-full h-auto max-h-[460px] object-cover object-top block transition-transform duration-500 group-hover:scale-[1.02]"
              />
              
              {/* Luxury Verification Tag at bottom */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3 rounded-xl bg-white/95 backdrop-blur-md border border-[#E8DFC8] shadow-md flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#E8AA42]/20 flex items-center justify-center text-[#D9381E] shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#12372A] leading-tight">Kerala Trade Expo 2023</p>
                    <p className="text-[10px] sm:text-[11px] text-stone-500 leading-tight">Business Excellency Award Winner</p>
                  </div>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#12372A] text-white shrink-0">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* ── Right : Content & Standard Achievements Grid ── */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-6">

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8AA42]/15 text-[#9E7326] text-[10px] sm:text-[11px] font-bold uppercase tracking-widest border border-[#E8AA42]/30 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D9381E]" />
              <span>Our Achievements</span>
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h2 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-[#12372A] leading-tight tracking-tight">
                Trusted for Quality,{' '}
                <span className="text-[#D9381E] block sm:inline">Loved for Taste.</span>
              </h2>
              <div className="w-12 h-1 rounded-full bg-[#E8AA42]" />
            </div>

            {/* Description */}
            <p className="text-stone-600 text-xs sm:text-sm lg:text-base leading-relaxed max-w-xl font-normal">
              Yumnest has earned recognition across Kerala for our commitment to pure, natural spices and masalas. From award-winning blends to FSSAI-certified processes, every product reflects our passion for authentic flavour.
            </p>

            {/* Standard 2x2 Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1 sm:pt-2">
              {achievements.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="group relative p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/90 hover:bg-white border border-[#E8DFC8] hover:border-[#12372A]/30 shadow-2xs hover:shadow-md transition-all duration-200 flex items-start gap-3"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#12372A]/10 text-[#12372A] group-hover:bg-[#12372A] group-hover:text-[#E8AA42] flex items-center justify-center shrink-0 transition-colors duration-200">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-xs sm:text-sm text-[#12372A] leading-snug tracking-normal">
                        {item.title}
                      </p>
                      <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed font-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* About Us Action Button */}
            <div className="pt-2">
              <Link
                href="/#about"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-xl transition-all active:scale-95 cursor-pointer group"
              >
                <span>About Us</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
