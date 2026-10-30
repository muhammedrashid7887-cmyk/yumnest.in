'use client';

import React, { useState } from 'react';
import { PRODUCTS, RECIPES } from '@/data/mockData';
import { Product } from '@/types';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { QuickViewModal } from '@/components/common/QuickViewModal';
import { SearchModal } from '@/components/common/SearchModal';
import { useCart } from '@/context/CartContext';

import { HeroSection } from '@/components/home/HeroSection';
import { ValuePillars } from '@/components/home/ValuePillars';
import { CategoryCircles } from '@/components/home/CategoryCircles';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BroastPromoBanner } from '@/components/home/BroastPromoBanner';
import { HomeAboutStory } from '@/components/home/HomeAboutStory';
import { HomeRecipesPreview } from '@/components/home/HomeRecipesPreview';
import { TrustAndAwards } from '@/components/home/TrustAndAwards';
import { CustomerTestimonials } from '@/components/home/CustomerTestimonials';
import { CtaBanner } from '@/components/home/CtaBanner';
import { WhatsAppFloat } from '@/components/common/WhatsAppFloat';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Products');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const { addToCart, openCart } = useCart();

  const handleAddToCart = (product: Product, variantId: string, quantity: number) => {
    addToCart(product, variantId, quantity);
  };

  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917] selection:bg-[#E8AA42]/30 selection:text-[#12372A]">
      {/* 1. Global Navigation Header */}
      <Navbar
        onOpenCart={openCart}
        onSearchClick={() => setIsSearchOpen(true)}
      />

      <main className="flex-1 flex flex-col pb-16 lg:pb-0">
        {/* 2. Hero Section with Showcase Slider */}
        <div className="order-1">
          <HeroSection />
        </div>

        {/* 6. Signature Broast Masala Spotlight Promo Banner - Immediately after hero on mobile, order-5 on desktop */}
        <div className="order-2 lg:order-5">
          <BroastPromoBanner />
        </div>

        {/* 3. Four Value Pillars Bar - order-3 on mobile, order-2 on desktop */}
        <div className="order-3 lg:order-2">
          <ValuePillars />
        </div>

        {/* 4. Circular Category Navigation with Malayalam Subtitles - order-4 on mobile, order-3 on desktop */}
        <div className="order-4 lg:order-3">
          <CategoryCircles
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
        </div>

        {/* 5. Complete Featured Products Collection - order-5 on mobile, order-4 on desktop */}
        <div className="order-5 lg:order-4">
          <FeaturedProducts
            products={PRODUCTS}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onAddToCart={handleAddToCart}
            onViewProduct={(prod) => setQuickViewProduct(prod)}
          />
        </div>

        {/* 7. Authentic Kerala Heritage & Processing Story */}
        <div className="order-6">
          <HomeAboutStory />
        </div>

        {/* 8. Cooking Inspiration & Recipe Vlogs Preview */}
        <div className="order-7">
          <HomeRecipesPreview recipes={RECIPES} />
        </div>

        {/* 9. Standards, Quality & Awards (Sample Data Disclosed) */}
        <div className="order-8">
          <TrustAndAwards />
        </div>

        {/* 10. Sample Customer Testimonials (Sample Data Disclosed) */}
        <div className="order-9">
          <CustomerTestimonials />
        </div>

        {/* 11. Closing Call-to-Action Banner */}
        <div className="order-10">
          <CtaBanner />
        </div>
      </main>

      {/* 12. Global Comprehensive Footer */}
      <Footer />

      {/* 13. Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        onOpenCart={openCart}
      />

      {/* 14. Product Quick View & Specification Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* 15. Quick Real-Time Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={PRODUCTS}
        onSelectProduct={(prod) => {
          setQuickViewProduct(prod);
          setIsSearchOpen(false);
        }}
      />

      {/* 16. Floating WhatsApp Button */}
      <WhatsAppFloat />
    </div>
  );
}
