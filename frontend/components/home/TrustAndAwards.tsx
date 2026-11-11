'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const TrustAndAwards: React.FC = () => {
  return (
    <section
      id="awards"
      className="relative bg-[#FBF9F5] border-y border-[#E8DFC8]/60 py-12 sm:py-16 lg:py-20 overflow-hidden scroll-mt-20 reveal-on-scroll"
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">

          {/* ── Left : Pure Award Recognition Poster (Clean, Direct, No Extra Frame) ── */}
          <div className="lg:col-span-6 xl:col-span-5 relative w-full max-w-lg mx-auto lg:max-w-none">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl transition-transform duration-500 hover:scale-[1.01] group">
              <img
                src="/assets/yum-nest-award-poster.jpg"
                alt="Yum Nest Award Recognition - Malabar Adukkala Title Winner 2018 & Business Kerala Award 2024"
                loading="lazy"
                decoding="async"
                width={600}
                height={450}
                className="w-full h-auto block object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
            </div>
          </div>

          {/* ── Right : Authentic Journey & Story ── */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-5 text-left">

            {/* Header & Subtitle */}
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-[11px] sm:text-xs font-bold tracking-[0.25em] text-[#9E7326] uppercase">
                Title Winner &amp; Business Excellence
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
                The Story of Yum Nest
              </h2>
            </div>

            {/* Story Paragraphs */}
            <div className="space-y-4 text-stone-700 text-sm sm:text-base leading-relaxed font-normal">
              <p>
                Yum Nest was born from 15 years of culinary experience, driven by the vision and support of Dubai-based businessman Thanseel and the culinary expertise of award-winning chef Faseeha Thanseel. Together, they built a brand dedicated to bringing authentic flavours to every home.
              </p>

              <p>
                With a commitment to quality, every Yum Nest product is crafted using pure and natural ingredients, blending tradition, health and happiness. Officially launched by Joseph IAS at Lulu Twin Tower, Yum Nest continues to bring quality products closer to customers.
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-2 sm:pt-3">
              <Link
                href="/#about"
                className="inline-flex items-center gap-2 px-8 sm:px-9 py-3 sm:py-3.5 rounded-full bg-[#9E1B1B] hover:bg-[#801414] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-xl transition-all hover-btn-smooth cursor-pointer group w-fit"
              >
                <span>About Us</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default TrustAndAwards;
