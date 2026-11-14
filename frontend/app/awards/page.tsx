import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { WhatsAppFloat } from '@/components/common/WhatsAppFloat';
import { ValuePillars } from '@/components/home/ValuePillars';

import { buildPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Awards & Honors | Verified Culinary Excellence',
  description:
    'Explore Yum Nest verified awards, including Malabar Adukkala Title Winner 2018, Business Kerala Award 2024, and official launch by Joseph IAS at Lulu Twin Tower.',
  path: '/awards',
  keywords: [
    'Yum Nest Awards',
    'Malabar Adukkala 2018',
    'Business Kerala Award 2024',
    'Joseph IAS Launch Lulu Twin Tower',
    'Kerala Spice Honors',
  ],
});

export default function AwardsPage() {
  const breadcrumb = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Awards & Honors' },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#1C1917] selection:bg-[#E8AA42]/30 selection:text-[#0F5638]">
      <JsonLd data={breadcrumb} />
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

