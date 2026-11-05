'use client';

import React, { useState, useEffect } from 'react';
import { PRODUCTS, CATEGORIES, RECIPES } from '@/data/mockData';
import { Product, CategoryItem } from '@/types';
import { getStorefrontProducts, getStorefrontCategories } from '@/lib/api/storefront';
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
import FlexCarousel from '@/components/home/FlexCarousel';
import { HomeAboutStory } from '@/components/home/HomeAboutStory';
import { HomeRecipesPreview } from '@/components/home/HomeRecipesPreview';
import { CtaBanner } from '@/components/home/CtaBanner';
import { WhatsAppFloat } from '@/components/common/WhatsAppFloat';

const ANIMATION_CAROUSEL_ITEMS = [
  {
    src: '/assets/animation/IMG-20261104-WA0011.jpg',
    alt: 'Complete Yumnest spice powders and cold-pressed coconut oil collection',
    title: 'The Signature Range',
    subtitle: 'Pure Kerala Spices & Blends',
  },
  {
    src: '/assets/animation/IMG-20261104-WA0017.jpg',
    alt: 'Yumnest Broast Masala Powder with fresh crispy fried chicken and spices',
    title: 'Broast Masala Powder',
    subtitle: 'The Secret to Ultimate Crunch',
  },
  {
    src: '/assets/animation/IMG-20261104-WA0018.jpg',
    alt: 'Yumnest Broast Prawns Masala with crispy fried prawns on slate',
    title: 'Broast Prawns Masala',
    subtitle: 'Coastal Crunch & Flavor',
  },
  {
    src: '/assets/animation/IMG-20261104-WA0024.jpg',
    alt: 'Yumnest Premium Cold Pressed Coconut Oil with fresh sliced coconuts',
    title: 'Cold Pressed Coconut Oil',
    subtitle: '100% Pure & Traditional',
  },
  {
    src: '/assets/animation/IMG-20261104-WA0029.jpg',
    alt: 'Yumnest Premium Export Quality Cardamom pods in traditional bowl',
    title: 'Green Cardamom',
    subtitle: 'Export Quality Aromatic Pods',
  },
  {
    src: '/assets/animation/IMG-20261104-WA0034.jpg',
    alt: 'Yumnest Black Pepper pack with whole organic peppercorns',
    title: 'Malabar Black Pepper',
    subtitle: 'Direct from Wayanad Farmers',
  },
  {
    src: '/assets/animation/IMG-20261104-WA0035.jpg',
    alt: 'Yumnest Broast Masala box with raw whole spices on wooden board',
    title: 'Farm Fresh Ingredients',
    subtitle: 'Ginger, Garlic, Pepper & Chilli',
  },
  {
    src: '/assets/animation/IMG-20261104-WA0027.jpg',
    alt: 'Yumnest Broast Masala packaging held in modern kitchen',
    title: 'Culinary Perfection',
    subtitle: 'Crafted for Home Chefs',
  },
  {
    src: '/assets/animation/IMG-20261104-WA0030.jpg',
    alt: 'Yumnest Cold Pressed Coconut Oil bottle in rustic kitchen setting',
    title: 'Kerala Heritage Oil',
    subtitle: 'Slow Pressed & Nutrient Rich',
  },
  {
    src: '/assets/animation/IMG-20261104-WA0019.jpg',
    alt: 'Yumnest Broast Masala pack with authentic ground spice bowl',
    title: 'Authentic Spice Blends',
    subtitle: 'Balanced Flavor Profile',
  },
  {
    src: '/assets/animation/IMG-20261104-WA0013.jpg',
    alt: 'Yumnest complete range of masalas and spice packs',
    title: 'One Nest, Endless Flavors',
    subtitle: 'Tradition in Every Dish',
  },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState<CategoryItem[]>(CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Products');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getStorefrontProducts({ limit: 100 }), getStorefrontCategories()])
      .then(([{ products: liveProds }, liveCats]) => {
        if (isMounted) {
          if (liveProds && liveProds.length > 0) setProducts(liveProds);
          if (liveCats && liveCats.length > 0) setCategories(liveCats);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

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
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917] selection:bg-[#E8AA42]/30 selection:text-[#0F5638]">
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

        {/* FlexCarousel Visual Showcase - Positioned immediately before Signature Product */}
        <div className="order-2 lg:order-5">
          <section aria-label="Signature Visual Gallery" className="w-full py-4 sm:py-8 bg-[#FBF9F5] overflow-hidden">
            <div style={{ width: '100%', height: '560px', position: 'relative' }}>
              <FlexCarousel
                items={ANIMATION_CAROUSEL_ITEMS}
                preset="liquid"
                intro="rise"
                cardHeight={0.5}
                gap={12}
                squeeze={0.2}
                focusOnClick
                captions
                fit="natural"
                radius={0}
                lensWidth={0.74}
                lensHeight={1.18}
                tilt={62}
                roundness={1}
                bend={0.34}
                reach={0.38}
                curl="twist"
                dispersion={0.45}
                liquid={0}
                followCursor={false}
                autoplay={false}
                interval={4}
                captureWheel
              />
            </div>
          </section>
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
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
        </div>

        {/* 5. Complete Featured Products Collection - order-5 on mobile, order-4 on desktop */}
        <div className="order-5 lg:order-4">
          <FeaturedProducts
            products={products}
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
