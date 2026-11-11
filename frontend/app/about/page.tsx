import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { WhatsAppFloat } from '@/components/common/WhatsAppFloat';
import { HomeAboutStory } from '@/components/home/HomeAboutStory';
import { TrustAndAwards } from '@/components/home/TrustAndAwards';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Yumnest Foods & Pure Spices',
  description:
    'Learn about Yumnest authentic Kerala heritage, sustainable spice sourcing from Wayanad & Idukki, and our commitment to pure, preservative-free foods.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917] selection:bg-[#E8AA42]/30 selection:text-[#0F5638]">
      <Navbar />

      <main className="flex-1 pb-16 lg:pb-0">
        {/* Hero Banner Header */}
        <section className="py-10 sm:py-14 bg-gradient-to-b from-[#F5EFE6] to-[#FBF9F5] border-b border-[#E8DFC8]">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#9E1B1B]">
              Our Heritage &amp; Mission
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0F5638] tracking-tight">
              One Nest, Pure Spices, Endless Flavours
            </h1>
            <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
              Founded in Kerala, Yumnest is dedicated to bringing traditional purity back to everyday kitchens. From single-origin hill produce to signature crispy broast coatings.
            </p>
          </div>
        </section>

        {/* Core Heritage Story */}
        <div className="py-8">
          <HomeAboutStory />
        </div>

        {/* Quality Values & Certifications */}
        <section className="py-12 bg-white border-y border-[#E8DFC8]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0F5638]">Purity Standards</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">Why Families Trust Yumnest</h2>
              <div className="w-12 h-1 bg-[#E8AA42] rounded-full mx-auto mt-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E8DFC8] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F5638] text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-[#0F5638]">Zero Artificial Additives</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  We never use MSG, chemical tenderizers, artificial colorings, or industrial fillers. Every gram is pure natural spices.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E8DFC8] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F5638] text-white flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-[#0F5638]">Traditional Stone Grinding</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Our slow-speed stone grinding prevents overheating, preserving natural essential oils, volatile aroma, and rich medicinal nutrients.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E8DFC8] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F5638] text-white flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-[#0F5638]">Direct Estate Partnerships</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Direct partnerships with certified smallholder farmers in Idukki, Wayanad, and Thalassery ensure fair compensation and peak harvest freshness.
                </p>
              </div>
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0F5638] hover:bg-[#187A4F] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md transition-colors"
              >
                <span>Explore Our Full Spice Range</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Business Excellency Recognition */}
        <div className="py-8">
          <TrustAndAwards />
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
      <WhatsAppFloat />
    </div>
  );
}
