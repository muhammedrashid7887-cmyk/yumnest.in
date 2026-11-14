'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { CATEGORIES } from '@/data/mockData';
import { Product, CategoryItem } from '@/types';
import { getStorefrontProducts, getStorefrontCategories } from '@/lib/api/storefront';
import { useSocketEvent } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/lib/socket/events';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { useCart } from '@/context/CartContext';

import { HeroSection } from '@/components/home/HeroSection';
import { CategoryCircles } from '@/components/home/CategoryCircles';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BroastPromoBanner } from '@/components/home/BroastPromoBanner';
import type { GalleryItem } from '@/components/ui/CircularGallery';
import { HomeAboutStory } from '@/components/home/HomeAboutStory';
import { HomeRecipesPreview } from '@/components/home/HomeRecipesPreview';
import { WavyTickerRibbon } from '@/components/home/WavyTickerRibbon';
import { TrustAndAwards } from '@/components/home/TrustAndAwards';
import { CtaBanner } from '@/components/home/CtaBanner';
import { CulinaryKnowledgeHub } from '@/components/seo/CulinaryKnowledgeHub';
import { WhatsAppFloat } from '@/components/common/WhatsAppFloat';

// Heavy WebGL and modal components dynamically loaded to preserve instant FCP and LCP
const CircularGallery = dynamic(() => import('@/components/ui/CircularGallery'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#FAF7F0]">
      <div className="w-8 h-8 rounded-full border-2 border-[#0F5638]/20 border-t-[#0F5638] animate-spin" />
    </div>
  ),
});

const QuickViewModal = dynamic(
  () => import('@/components/common/QuickViewModal').then((mod) => mod.QuickViewModal),
  { ssr: false }
);

const SearchModal = dynamic(
  () => import('@/components/common/SearchModal').then((mod) => mod.SearchModal),
  { ssr: false }
);

const POSTER_GALLERY_ITEMS: GalleryItem[] = [
  {
    image: '/assets/animation/IMG-20261104-WA0011.jpg',
    text: 'The Signature Range',
    description: 'Pure Kerala Spices & Blends',
    alt: 'Complete Yumnest spice powders and cold-pressed coconut oil collection',
  },
  {
    image: '/assets/animation/IMG-20261104-WA0017.jpg',
    text: 'Broast Masala Powder',
    description: 'The Secret to Ultimate Crunch',
    alt: 'Yumnest Broast Masala Powder with fresh crispy fried chicken and spices',
  },
  {
    image: '/assets/animation/IMG-20261104-WA0018.jpg',
    text: 'Broast Prawns Masala',
    description: 'Coastal Crunch & Flavor',
    alt: 'Yumnest Broast Prawns Masala with crispy fried prawns on slate',
  },
  {
    image: '/assets/animation/IMG-20261104-WA0024.jpg',
    text: 'Cold Pressed Coconut Oil',
    description: '100% Pure & Traditional',
    alt: 'Yumnest Premium Cold Pressed Coconut Oil with fresh sliced coconuts',
  },
  {
    image: '/assets/animation/IMG-20261104-WA0029.jpg',
    text: 'Green Cardamom',
    description: 'Export Quality Aromatic Pods',
    alt: 'Yumnest Premium Export Quality Cardamom pods in traditional bowl',
  },
  {
    image: '/assets/animation/IMG-20261104-WA0034.jpg',
    text: 'Malabar Black Pepper',
    description: 'Direct from Wayanad Farmers',
    alt: 'Yumnest Black Pepper pack with whole organic peppercorns',
  },
  {
    image: '/assets/animation/IMG-20261104-WA0035.jpg',
    text: 'Farm Fresh Ingredients',
    description: 'Ginger, Garlic, Pepper & Chilli',
    alt: 'Yumnest Broast Masala box with raw whole spices on wooden board',
  },
  {
    image: '/assets/animation/IMG-20261104-WA0027.jpg',
    text: 'Culinary Perfection',
    description: 'Crafted for Home Chefs',
    alt: 'Yumnest Broast Masala packaging held in modern kitchen',
  },
  {
    image: '/assets/animation/IMG-20261104-WA0030.jpg',
    text: 'Kerala Heritage Oil',
    description: 'Slow Pressed & Nutrient Rich',
    alt: 'Yumnest Cold Pressed Coconut Oil bottle in rustic kitchen setting',
  },
  {
    image: '/assets/animation/IMG-20261104-WA0019.jpg',
    text: 'Authentic Spice Blends',
    description: 'Balanced Flavor Profile',
    alt: 'Yumnest Broast Masala pack with authentic ground spice bowl',
  },
  {
    image: '/assets/animation/IMG-20261104-WA0013.jpg',
    text: 'One Nest, Endless Flavors',
    description: 'Tradition in Every Dish',
    alt: 'Yumnest complete range of masalas and spice packs',
  },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>(CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Products');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [galleryHeight, setGalleryHeight] = useState('360px');

  useEffect(() => {
    const updateGalleryHeight = () => {
      if (window.innerWidth < 640) {
        setGalleryHeight('260px');
      } else if (window.innerWidth < 1024) {
        setGalleryHeight('310px');
      } else {
        setGalleryHeight('360px');
      }
    };
    updateGalleryHeight();
    window.addEventListener('resize', updateGalleryHeight);
    return () => window.removeEventListener('resize', updateGalleryHeight);
  }, []);

  const refreshHomeData = useCallback(() => {
    Promise.all([getStorefrontProducts({ limit: 100 }), getStorefrontCategories()])
      .then(([{ products: liveProds }, liveCats]) => {
        if (Array.isArray(liveProds)) setProducts(liveProds);
        if (Array.isArray(liveCats)) setCategories(liveCats);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshHomeData();
  }, [refreshHomeData]);

  // Real-Time Socket.IO: update featured products & category circles immediately
  useSocketEvent(SOCKET_EVENTS.PRODUCT_CREATED, refreshHomeData);
  useSocketEvent(SOCKET_EVENTS.PRODUCT_UPDATED, refreshHomeData);
  useSocketEvent(SOCKET_EVENTS.PRODUCT_DELETED, (payload?: { id?: string }) => {
    if (payload?.id) {
      setProducts((prev) => prev.filter((p) => p.id !== payload.id && p._id !== payload.id));
    }
    refreshHomeData();
  });
  useSocketEvent(SOCKET_EVENTS.PRODUCT_STOCK_UPDATED, refreshHomeData);
  useSocketEvent(SOCKET_EVENTS.CATEGORY_CREATED, refreshHomeData);
  useSocketEvent(SOCKET_EVENTS.CATEGORY_UPDATED, refreshHomeData);
  useSocketEvent(SOCKET_EVENTS.CATEGORY_DELETED, refreshHomeData);

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
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#1C1917] selection:bg-[#E8AA42]/30 selection:text-[#0F5638]">
      {/* 1. Global Navigation Header */}
      <Navbar
        onOpenCart={openCart}
        onSearchClick={() => setIsSearchOpen(true)}
      />

      <main className="flex-1 flex flex-col pb-16 lg:pb-0">
        {/* 1. First Banner Video + Spices Ticker Loop */}
        <div className="order-1">
          <HeroSection />
          {/* Black Ticker Ribbon with White Text & Amber Dot - with comfortable gap after hero banner */}
          <WavyTickerRibbon variant="black" direction="ltr" speedSeconds={65} />
        </div>

        {/* 2. Business Excellency Award & Recognition Section (Top 2nd on all devices) */}
        <div className="order-2">
          <TrustAndAwards />
        </div>

        {/* 3. From Our Spices to Your Kitchen (Curved 3D CircularGallery Poster Showcase) */}
        <div className="order-3">
          <section aria-label="Signature Visual Gallery" className="w-full pt-3 sm:pt-5 pb-4 sm:pb-6 bg-[#FAF7F0] overflow-hidden">
            {/* Section Header: From Our Spices to Your Kitchen */}
            <div className="text-center max-w-2xl mx-auto px-4 mb-1.5 sm:mb-2.5">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#0F5638] tracking-tight leading-tight">
                From Our Spices to Your Kitchen
              </h2>
              <div className="w-10 h-0.5 bg-[#E8AA42] rounded-full mx-auto mt-1.5" />
            </div>

            <div style={{ height: galleryHeight, position: 'relative' }}>
              <CircularGallery
                items={POSTER_GALLERY_ITEMS}
                bend={-1.4}
                textColor="#0F5638"
                borderRadius={0.06}
                scrollEase={0.13}
                onItemClick={(item, index) => console.log(item.text, index)}
                itemSize={0.88}
                itemAspect={1.52}
                gap={0.2}
                wave={0.4}
                fadeEdges={0.2}
                shadow={0.25}
                scrollSpeed={1.8}
                autoScroll={1}
                snap={false}
                grayscale={false}
                showTitles
                openOnClick
                intro
              />
            </div>
          </section>
        </div>

        {/* 4. Category Circles Navigation */}
        <div className="order-4">
          <CategoryCircles
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
        </div>

        {/* 5. Complete Featured Products Collection */}
        <div className="order-5">
          <FeaturedProducts
            products={products}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onAddToCart={handleAddToCart}
            onViewProduct={(prod) => setQuickViewProduct(prod)}
          />
        </div>

        {/* 6. Signature Broast Masala Spotlight Promo Banner */}
        <div className="order-6">
          <BroastPromoBanner />
        </div>

        {/* 7. Authentic Kerala Heritage & Processing Story (About Us) */}
        <div className="order-7">
          <HomeAboutStory />
        </div>

        {/* 8. Video Section Vlogs (Cooking Inspiration & Recipe Vlogs Preview) */}
        <div className="order-8">
          <HomeRecipesPreview />
        </div>

        {/* 9. Green Wavy Ribbon Ticker - Positioned immediately after Video Section */}
        <div className="order-9">
          <WavyTickerRibbon variant="green" direction="rtl" />
        </div>

        {/* 10. Culinary Masterclass & Spice Knowledge Hub */}
        <div className="order-10">
          <CulinaryKnowledgeHub />
        </div>

        {/* 11. Contact Section (Closing Call-to-Action Banner) */}
        <div className="order-11">
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
        products={products}
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
