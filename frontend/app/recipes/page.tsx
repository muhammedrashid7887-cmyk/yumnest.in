import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { WhatsAppFloat } from '@/components/common/WhatsAppFloat';
import { RecipesVlogsContent } from '@/components/recipes/RecipesVlogsContent';

import { buildPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Recipes & Culinary Vlogs',
  description:
    'Watch authentic Kerala spice recipes, crispy broast chicken preparation tutorials, and culinary masterclasses by Chef Faseeha Thanseel.',
  path: '/recipes',
  keywords: [
    'Kerala Recipes',
    'Broast Chicken Tutorial',
    'Yum Nest Cooking Vlogs',
    'Chef Faseeha Thanseel Recipes',
    'Authentic Malabar Cooking',
  ],
});

export default function RecipesPage() {
  const breadcrumb = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Recipes & Vlogs' },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#1C1917] selection:bg-[#E8AA42]/30 selection:text-[#0F5638]">
      <JsonLd data={breadcrumb} />
      <Navbar />

      <main className="flex-1 pb-16 lg:pb-0">
        <RecipesVlogsContent />
      </main>

      <Footer />
      <MobileBottomNav />
      <WhatsAppFloat />
    </div>
  );
}
