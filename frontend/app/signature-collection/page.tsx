import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { WhatsAppFloat } from '@/components/common/WhatsAppFloat';
import { SignatureCollectionContent } from '@/components/signature/SignatureCollectionContent';

export const metadata: Metadata = {
  title: 'Signature Collection | Yumnest Foods & Pure Spices',
  description:
    'Experience the Yumnest Signature Collection — authentic Broast Masala Powder crafted for restaurant-style crunch, tender juiciness, and pure Kerala flavors.',
};

export default function SignatureCollectionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#1C1917] selection:bg-[#E8AA42]/30 selection:text-[#0F5638]">
      <Navbar />

      <main className="flex-1 pb-16 lg:pb-0">
        <SignatureCollectionContent />
      </main>

      <Footer />
      <MobileBottomNav />
      <WhatsAppFloat />
    </div>
  );
}
