import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { WhatsAppFloat } from '@/components/common/WhatsAppFloat';
import { ValuePillars } from '@/components/home/ValuePillars';

export const metadata: Metadata = {
  title: 'Awards & Honours | Yumnest Foods Kerala',
  description:
    'Discover Yumnest honours, Business Excellency Award at Kerala Trade Expo, food purity certifications, and regional spice excellence citations.',
};

export default function AwardsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#1C1917] selection:bg-[#E8AA42]/30 selection:text-[#0F5638]">
      <Navbar />

      <main className="flex-1 pb-16 lg:pb-0">
        <ValuePillars />
      </main>

      <Footer />
      <MobileBottomNav />
      <WhatsAppFloat />
    </div>
  );
}

