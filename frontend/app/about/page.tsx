import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { WhatsAppFloat } from '@/components/common/WhatsAppFloat';
import { HomeAboutStory } from '@/components/home/HomeAboutStory';
import { TrustAndAwards } from '@/components/home/TrustAndAwards';

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
        {/* Core Heritage Story */}
        <HomeAboutStory />

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
