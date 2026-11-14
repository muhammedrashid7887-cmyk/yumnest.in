import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { WhatsAppFloat } from '@/components/common/WhatsAppFloat';
import { SignatureCollectionContent } from '@/components/signature/SignatureCollectionContent';

import { buildPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Signature Collection - Crispy Broast & Gourmet Spices',
  description:
    'Experience the Yum Nest Signature Collection — authentic Broast Masala Powder crafted for restaurant-style crunch, tender juiciness, and pure Kerala flavors.',
  path: '/signature-collection',
  keywords: [
    'Signature Collection',
    'Broast Masala Powder',
    'Restaurant Style Broast',
    'Yum Nest Signature',
    'Gourmet Kerala Spices',
  ],
});

export default function SignatureCollectionPage() {
  const breadcrumb = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Signature Collection' },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#1C1917] selection:bg-[#E8AA42]/30 selection:text-[#0F5638]">
      <JsonLd data={breadcrumb} />
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
