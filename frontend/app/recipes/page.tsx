import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { WhatsAppFloat } from '@/components/common/WhatsAppFloat';
import { RecipesVlogsContent } from '@/components/recipes/RecipesVlogsContent';

export const metadata: Metadata = {
  title: 'Recipes & Vlogs | Yumnest Foods & Pure Spices',
  description:
    'Watch authentic Kerala spice recipes, crispy broast chicken preparation tutorials, and culinary masterclasses from Yumnest.',
};

export default function RecipesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#1C1917] selection:bg-[#E8AA42]/30 selection:text-[#0F5638]">
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
