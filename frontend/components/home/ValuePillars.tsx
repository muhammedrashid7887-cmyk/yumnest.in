import React from 'react';
import Link from 'next/link';
import { Award, ShieldCheck, Leaf, Star } from 'lucide-react';

const achievements = [
  { icon: Award,       title: 'Business Excellency Award',  desc: 'Recognised at Kerala Trade Expo 2023' },
  { icon: ShieldCheck, title: 'FSSAI Certified',             desc: 'All products meet India food safety standards' },
  { icon: Leaf,        title: '100% Natural Ingredients',    desc: 'Zero MSG · Zero Preservatives · Zero Colours' },
  { icon: Star,        title: 'Loved by 10,000+ Families',   desc: 'Trusted across Kerala, delivered all over India' },
];

export const ValuePillars: React.FC = () => {
  return (
    <section className="bg-[#F4EFE6] border-y border-[#E8DFC8] py-8 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-20 items-center">

          {/* ── Left : Award Image ── */}
          <div className="relative w-full">
            {/* Decorative gold shadow frame */}
            <div className="absolute -inset-2 rounded-2xl bg-[#E8AA42]/20 blur-xl pointer-events-none" />
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#E8DFC8]">
              <img
                src="/assets/award.jpeg"
                alt="Yumnest Awards and Achievements"
                className="w-full h-auto object-cover block"
              />
            </div>
          </div>

          {/* ── Right : Content ── */}
          <div className="flex flex-col gap-4 sm:gap-6">

            {/* Eyebrow */}
            <div className="flex items-center gap-2">
              <span className="w-8 h-px bg-[#E8AA42]" />
              <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#E8AA42]">
                Our Achievements
              </span>
            </div>

            {/* Heading */}
            <h2 className="font-serif font-extrabold text-2xl sm:text-4xl lg:text-[2.6rem] text-[#12372A] leading-[1.2]">
              Trusted for Quality,
              <br />
              <span className="text-[#D9381E]">Loved for Taste.</span>
            </h2>

            {/* Divider */}
            <div className="w-14 h-1 rounded-full bg-[#E8AA42]" />

            {/* Description */}
            <p className="text-stone-600 text-xs sm:text-[15px] leading-relaxed max-w-md">
              Yumnest has earned recognition across Kerala for our commitment to pure, natural spices and masalas.
              From award-winning blends to FSSAI-certified processes, every product reflects our passion for authentic flavour.
            </p>

            {/* Achievement grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {achievements.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl bg-white border border-[#E8DFC8] shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#12372A] text-[#E8AA42] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </div>
                    <div>
                      <p className="text-[#12372A] font-bold text-xs sm:text-sm leading-snug">{item.title}</p>
                      <p className="text-stone-500 text-[10px] sm:text-[11px] leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="pt-2">
              <Link
                href="/#about"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs font-bold uppercase tracking-widest shadow-lg transition-all active:scale-95"
              >
                <span>About Us</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
