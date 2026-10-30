'use client';

import React from 'react';
import { Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const TrustAndAwards: React.FC = () => {
  return (
    <section id="awards" className="py-8 sm:py-20 bg-[#FBF9F5] border-t border-[#E8DFC8]/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8AA42]/15 text-[#9E7326] text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-[#E8AA42]" />
            <span>Honours & Recognition</span>
          </div>

          <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#12372A] tracking-tight">
            Awards & Achievements
          </h2>
          
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Recognised for our dedication to authentic Kerala flavours, natural spice sourcing, and uncompromising food purity.
          </p>
        </div>

        {/* Main Award Showcase Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DFC8] p-4 sm:p-8 lg:p-10 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 lg:gap-12 items-center">
            
            {/* Left: Actual Stage Ceremony Award Photograph */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-full max-w-xs sm:max-w-sm rounded-xl sm:rounded-2xl overflow-hidden shadow-md border border-stone-200 bg-stone-100">
                <img
                  src="/assets/award.jpeg"
                  alt="Yumnest receiving Business Excellency Award at Kerala Trade Expo"
                  loading="lazy"
                  className="w-full h-auto max-h-[380px] sm:max-h-[420px] object-cover object-top block"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-6 text-white text-center">
                  <p className="text-xs font-semibold tracking-wide">Kerala Trade Expo Presentation Ceremony</p>
                </div>
              </div>
            </div>

            {/* Right: Real Verified Award & Milestone Details */}
            <div className="md:col-span-7 space-y-5 text-left">
              
              {/* Award Header */}
              <div className="space-y-2 border-b border-stone-100 pb-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#12372A]/10 text-[#12372A] text-xs font-bold tracking-wide">
                  <Award className="w-4 h-4 text-[#E8AA42]" />
                  <span>Official Recognition</span>
                </div>
                <h3 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-[#12372A]">
                  Business Excellency Award
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-[#E8AA42]">
                  Awarded at Kerala Trade Expo
                </p>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed pt-1">
                  Honoured with the Business Excellency Award in recognition of excellence in traditional spice blending, natural processing standards, and dedication to authentic food culture.
                </p>
              </div>

              {/* Quality Standards & Verification Badges */}
              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Certified Standards
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E8DFC8]/60">
                    <ShieldCheck className="w-5 h-5 text-[#12372A] shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-stone-900">FSSAI Certified</h5>
                      <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                        Compliant with national food safety and hygiene regulations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E8DFC8]/60">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-stone-900">100% Pure & Natural</h5>
                      <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                        Zero MSG, no synthetic dyes, and no chemical preservatives.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
