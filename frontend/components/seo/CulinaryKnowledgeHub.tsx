'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChefHat, Flame, Sparkles, Award, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';

interface GuideItem {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  summary: string;
  chefQuote?: string;
  steps: string[];
  tips: string[];
  matchedProduct: {
    name: string;
    href: string;
    badge: string;
  };
}

const CULINARY_GUIDES: GuideItem[] = [
  {
    id: 'broast-guide',
    tag: 'Signature Masterclass',
    title: 'Restaurant-Style Crispy Broasted Chicken at Home',
    subtitle: 'The authentic technique for golden flakiness, juicy succulence, and zero sogginess.',
    summary:
      'True restaurant broast requires balanced spice penetration without overpowering the natural poultry flavor. Chef Faseeha Thanseel formulated Yum Nest Broast Masala Powder using balanced stone-ground spices, natural starch binders, and garlic-onion undertones that lock in juices during high-temperature frying.',
    chefQuote:
      'The secret to crunch that lasts for hours is double-dipping in ice-cold water before the second flour dredge. Never fry at smoking temperatures — 165°C to 170°C ensures the meat cooks through while the coating turns golden crisp.',
    steps: [
      'Marinate 1kg fresh bone-in chicken pieces with 3 tbsp Yum Nest Broast Masala, 1 tsp ginger-garlic paste, and 2 tbsp curd for at least 45 minutes.',
      'Prepare a dry dredging bowl with all-purpose flour seasoned with a pinch of Yum Nest Broast Masala and salt.',
      'Dredge the marinated chicken thoroughly in the seasoned flour, shaking off excess.',
      'Dip the coated piece briefly into a bowl of ice-cold water for exactly 2 seconds, then immediately return to the dry flour for a second rough coating.',
      'Deep fry in hot oil (165°C–170°C) for 12–14 minutes until golden amber and sizzling calm. Rest on a wire rack for 3 minutes before serving.',
    ],
    tips: [
      'Always rest on an elevated wire rack rather than paper towels to avoid trapping steam underneath the crust.',
      'Keep chicken pieces uniform in size (80g–100g) so they cook at an even rate.',
    ],
    matchedProduct: {
      name: 'Yum Nest Broast Masala Powder',
      href: '/products/broast-masala-powder',
      badge: 'Bestseller',
    },
  },
  {
    id: 'alfaham-guide',
    tag: 'Arabian Grilling Tradition',
    title: 'Authentic Charcoal Alfaham Chicken (Alfa Powder Guide)',
    subtitle: 'How Arabian barbecue meets Kerala heritage slow-smoke traditions.',
    summary:
      'In Kerala and Arabian culinary traditions, Alfaham (often colloquially referred to as Alfa Chicken or Alfa Masala) is a distinct slow-roasted barbecue style. Unlike bright red tandoori mixes that rely on artificial food coloring, authentic Yum Nest Alfaham Masala uses coriander seed, roasted cumin, black peppercorns, dried lemon nuances, and natural Kashmiri chilli.',
    chefQuote:
      'True Alfaham is earthy, mildly spiced, and deeply aromatic. We never use artificial colors. The gentle char from hardwood charcoal caramelizes the natural spice oils, creating that unmistakable Arabian cafeteria aroma.',
    steps: [
      'Make diagonal incisions across chicken thigh and breast pieces to allow the marinade to reach the bone.',
      'Rub chicken with 3 tbsp Yum Nest Alfaham Masala, fresh lemon juice, 2 tbsp olive oil, and crushed garlic paste.',
      'Refrigerate for at least 3 hours (preferably overnight) to allow the natural enzymes to tenderize the muscle fibers.',
      'Grill over natural charcoal embers on medium heat, turning every 4 minutes and basting with melted butter or ghee.',
      'For home ovens: Roast at 200°C for 25 minutes, then switch to broil/top grill for 5 minutes for that signature smoky char.',
    ],
    tips: [
      'Baste lightly with ghee during the final 3 minutes of cooking to lock in juiciness.',
      'Serve traditionally with kuboos, garlic toum, and pickled radishes.',
    ],
    matchedProduct: {
      name: 'Yum Nest Alfaham Masala',
      href: '/products/yum-nest-alfaham-masala',
      badge: 'Arabian Special',
    },
  },
  {
    id: 'coconut-oil-guide',
    tag: 'Heritage Extraction',
    title: '100% Pure Roasted Copra Coconut Oil: The Golden Standard',
    subtitle: 'Why traditional copra roasting makes all the difference in aroma and smoke point.',
    summary:
      'Traditional Kerala cuisine owes its comforting flavor to cold-pressed oil made from carefully sun-dried and lightly roasted mature coconut copra. Yum Nest Roasted Coconut Oil is extracted using traditional slow expellers without chemical refining, bleaching, or deodorizing (RBD).',
    chefQuote:
      'Commercial refined oils strip away both aroma and antioxidants. When you open a bottle of Yum Nest Roasted Copra Coconut Oil, the aroma immediately takes you back to traditional Malabar family kitchens.',
    steps: [
      'Selected mature Kerala coconuts are halved and naturally dried to optimal copra moisture content.',
      'Copra is gently slow-roasted to develop deep nutty notes and stabilize beneficial polyphenols.',
      'Cold expeller pressed at controlled low temperatures to preserve medium-chain triglycerides (MCTs).',
      'Filtered purely through micro-mesh cloth without mineral acid neutralization or artificial bleaching.',
    ],
    tips: [
      'Ideal for authentic Kerala fish curries, avial, thoran, and traditional tempering (tadka).',
      'Natural solidification below 24°C is proof of 100% unadulterated virgin coconut purity.',
    ],
    matchedProduct: {
      name: 'Yum Nest Coconut Oil',
      href: '/products/coconut-oil',
      badge: '100% Roasted Copra',
    },
  },
];

export const CulinaryKnowledgeHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('broast-guide');
  const currentGuide = CULINARY_GUIDES.find((g) => g.id === activeTab) || CULINARY_GUIDES[0];

  return (
    <section className="py-12 sm:py-16 bg-[#FAF7F0] border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[#0F5638] text-xs font-bold uppercase tracking-wider">
            <ChefHat className="w-3.5 h-3.5" />
            <span>Masterclass Culinary Guides</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F5638] tracking-tight">
            Kerala Spice Knowledge &amp; Preparation Secrets
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
            Step-by-step cooking techniques curated by award-winning culinary consultant{' '}
            <strong className="text-stone-900 font-semibold">Chef Faseeha Thanseel</strong>.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {CULINARY_GUIDES.map((guide) => (
            <button
              key={guide.id}
              type="button"
              onClick={() => setActiveTab(guide.id)}
              className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === guide.id
                  ? 'bg-[#0F5638] text-white shadow-md'
                  : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/80'
              }`}
            >
              {guide.matchedProduct.name}
            </button>
          ))}
        </div>

        {/* Selected Guide Content Card */}
        <div className="bg-white rounded-3xl border border-[#E8DFC8] p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-5">
            <div>
              <span className="text-[11px] font-bold text-[#9E7326] uppercase tracking-widest">
                {currentGuide.tag}
              </span>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0F5638] tracking-tight mt-0.5">
                {currentGuide.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                {currentGuide.subtitle}
              </p>
            </div>

            <Link
              href={currentGuide.matchedProduct.href}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E8AA42] hover:bg-[#d9982f] text-stone-900 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs shrink-0 self-start sm:self-auto"
            >
              <span>View Product</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
            {currentGuide.summary}
          </p>

          {/* Chef Advice Quote */}
          {currentGuide.chefQuote && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border-l-4 border-[#E8AA42] text-xs sm:text-sm text-stone-800 italic leading-relaxed">
              &ldquo;{currentGuide.chefQuote}&rdquo;
              <span className="block not-italic font-bold text-[11px] text-[#0F5638] mt-1.5 uppercase tracking-wider">
                &mdash; Chef Faseeha Thanseel, Culinary Consultant
              </span>
            </div>
          )}

          {/* Steps Breakdown */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-sm sm:text-base text-stone-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E8AA42]" />
              <span>Step-by-Step Preparation Method</span>
            </h4>
            <ol className="space-y-2.5 text-xs sm:text-sm text-stone-600 font-normal">
              {currentGuide.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100/80 text-[#0F5638] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Chef Pro Tips */}
          <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-2 sm:gap-4 text-xs text-stone-600">
            {currentGuide.tips.map((tip, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
