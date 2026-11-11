'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';

export const HomeAboutStory: React.FC = () => {
  return (
    <section id="about" className="py-14 sm:py-20 lg:py-28 bg-[#FAF8F5] border-b border-[#E8DFC8]/80 relative overflow-hidden reveal-on-scroll">
      
      {/* Subtle Warm Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E8AA42]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#0F5638]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14 relative z-10">

        {/* ── Top Grid : Chef Photograph (Left) + Editorial Profile & Story (Right) ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* Left: Chef Faseeha Cooking Photograph */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-xl border border-[#E8DFC8] bg-white group">
              <picture>
                <source type="image/webp" srcSet="/assets/chef-faseeha.webp" />
                <img
                  src="/assets/chef-faseeha.jpg"
                  alt="Chef Faseeha Thanseel preparing authentic Kerala cuisine with Yum Nest spices"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto block aspect-[3/4] object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </picture>
            </div>
          </div>

          {/* Right: Editorial Typography & Chef Bio */}
          <div className="md:col-span-7 space-y-5 text-left pt-1">
            
            {/* Chef Name Header */}
            <div className="space-y-1">
              <p className="text-[11px] sm:text-xs font-bold tracking-[0.25em] text-[#9E7326] uppercase">
                Culinary Consultant &amp; Co-Founder
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F5638] tracking-tight leading-tight">
                CHEF FASEEHA THANSEEL
              </h2>
            </div>

            {/* Quote Block (Styled like the luxury Chaat reference layout) */}
            <div className="relative pl-4 border-l-2 border-[#E8AA42] space-y-1 py-1">
              <p className="text-stone-800 text-sm sm:text-base lg:text-[17px] font-medium italic leading-snug">
                &ldquo;Food is not just about taste; it is health and happiness &mdash; crafted with the same love and care that we provide to our own family.&rdquo;
              </p>
            </div>

            {/* Narrative Body Text */}
            <div className="space-y-3.5 text-stone-600 text-xs sm:text-sm lg:text-[15px] leading-relaxed font-normal">
              <p>
                &mdash; These words, inspired by 15 years of expat culinary experience and dreams, define the essence of Yum Nest. The steadfast support and encouragement of my husband, Thanseel, a prominent Dubai-based businessman, have been the core strength that guided me from a dedicated homemaker to an award-winning culinary consultant and successful entrepreneur.
              </p>
              <p>
                With confidence gained from cooking competition victories &mdash; including <span className="font-semibold text-stone-900">Malabar Adukkala Title Winner (2018)</span> and <span className="font-semibold text-stone-900">Business Kerala Award (2024)</span> &mdash; Yum Nest was launched with the mission of delivering authentic, chemical-free food to every home.
              </p>
            </div>

          </div>

        </div>

        {/* ── Middle Spanning Story Paragraph ── */}
        <div className="max-w-4xl mx-auto text-center space-y-3 border-t border-[#E8DFC8]/60 pt-8 sm:pt-10">
          <p className="text-stone-700 text-xs sm:text-sm lg:text-base leading-relaxed font-normal">
            Officially launched by the honorable <span className="font-semibold text-[#0F5638]">Joseph IAS</span> at <span className="font-semibold text-stone-900">Lulu Twin Tower</span>, Yum Nest is the realization of our family&apos;s culinary vision. Using only pure, natural, and preservative-free ingredients, every blend brings the authentic warmth of Kerala heritage cooking directly to your dining table.
          </p>
        </div>

        {/* ── Bottom Card : Centered Action Callout with Cursor Spotlight Interaction ── */}
        <SpotlightCard
          theme="dark"
          spotlightColor="#3a3636"
          intensity={0.15}
          spotlightSize={240}
          softness={0.7}
          shape="circle"
          borderGlow={0.6}
          proximity={80}
          smoothing={0.3}
          grain={0}
          ambient={false}
          flare
          className="max-w-lg mx-auto p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-md text-center space-y-4"
          style={{
            '--spotlight-card-surface': '#ffffff',
            '--spotlight-card-border': '#E8DFC8',
          } as React.CSSProperties}
        >
          <div className="space-y-1">
            <h3 className="font-bold text-base sm:text-lg text-[#0F5638] tracking-tight">
              From Our Kitchen to Your Home
            </h3>
            <p className="text-xs text-stone-500 font-normal">
              Available at your fingertips across leading platforms
            </p>
          </div>

          {/* Platform Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E8DFC8] text-[11px] font-semibold text-stone-700">Amazon</span>
            <span className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E8DFC8] text-[11px] font-semibold text-stone-700">Flipkart</span>
            <span className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E8DFC8] text-[11px] font-semibold text-stone-700">Meesho</span>
            <span className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E8DFC8] text-[11px] font-semibold text-stone-700">JioMart</span>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer group"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </SpotlightCard>

        {/* ── Founders Sign-off ── */}
        <div className="text-center pt-1">
          <p className="text-xs sm:text-sm font-bold text-[#0F5638]">
            Thanseel &amp; Chef Faseeha Thanseel
          </p>
          <p className="text-[11px] sm:text-xs text-[#9E7326] font-medium">
            Founders, Yum Nest
          </p>
        </div>

      </div>
    </section>
  );
};
