import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { WhatsAppFloat } from '@/components/common/WhatsAppFloat';
import { HomeAboutStory } from '@/components/home/HomeAboutStory';
import { TrustAndAwards } from '@/components/home/TrustAndAwards';

import { buildPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { getFounderPersonSchema, getBreadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Our Heritage & Founder Story - Chef Faseeha Thanseel',
  description:
    'Discover the journey of Yum Nest, founded by award-winning culinary consultant Chef Faseeha Thanseel and Dubai businessman Thanseel. Authentic Kerala spices crafted with 15 years of culinary expertise.',
  path: '/about',
  keywords: [
    'Chef Faseeha Thanseel',
    'Yum Nest Founder',
    'Malabar Adukkala Title Winner 2018',
    'Business Kerala Award 2024',
    'Kerala Spice Heritage',
    'About Yum Nest',
  ],
});

export default function AboutPage() {
  const breadcrumb = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'About Us' },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#1C1917] selection:bg-[#E8AA42]/30 selection:text-[#0F5638]">
      <JsonLd data={[getFounderPersonSchema(), breadcrumb]} />
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
