import React from 'react';
import Link from 'next/link';
import { Leaf, UtensilsCrossed, Smile, ArrowRight } from 'lucide-react';

export const HomeAboutStory: React.FC = () => {
  return (
    <section id="about" className="py-6 sm:py-16 lg:py-20 bg-[#F8F7EE] border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-12 items-center">
          
          {/* Left Side: Overlapping Collage of 3 Food Images */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <div className="relative w-full max-w-lg lg:max-w-none flex items-center justify-center">
              <img
                src="/assets/about-collage.png"
                alt="Kerala traditional food, Yumnest masalas and spice cooking"
                loading="lazy"
                className="w-full h-auto max-h-[260px] sm:max-h-[440px] object-contain drop-shadow-xs"
              />
            </div>
          </div>

          {/* Right Side: Editorial Content */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-5 lg:space-y-6 text-left">
            
            {/* Small Label Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#12372A]/10 text-[#12372A] text-xs font-bold tracking-wider uppercase">
              <Leaf className="w-3.5 h-3.5" />
              <span>About Yumnest</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-[2.35rem] font-serif font-bold text-[#12372A] leading-tight">
              Bringing Authentic Kerala Flavours to Every Kitchen
            </h2>

            {/* Short Paragraph */}
            <p className="text-stone-600 text-xs sm:text-sm md:text-[15px] leading-relaxed">
              At Yumnest, we bring the rich and traditional flavours of Kerala to your home. Our products are made from carefully selected natural ingredients, ensuring the best quality, authentic taste and a healthier choice for you and your family.
            </p>

            {/* Three Feature Items with Icons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-2 pt-3 border-t border-stone-200/80 sm:divide-x sm:divide-stone-200/80">
              
              {/* Feature 1: Quality Ingredients */}
              <div className="flex items-center sm:flex-col sm:items-start lg:flex-row lg:items-center gap-2.5 sm:gap-2 lg:gap-2.5 sm:pr-2">
                <div className="w-10 h-10 rounded-full bg-[#12372A]/10 flex items-center justify-center text-[#12372A] shrink-0">
                  <Leaf className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-[13px] font-bold text-[#12372A]">
                    Quality Ingredients
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-stone-500 leading-tight mt-0.5">
                    Pure, natural and carefully sourced.
                  </p>
                </div>
              </div>

              {/* Feature 2: Authentic Taste */}
              <div className="flex items-center sm:flex-col sm:items-start lg:flex-row lg:items-center gap-2.5 sm:gap-2 lg:gap-2.5 sm:px-2">
                <div className="w-10 h-10 rounded-full bg-[#12372A]/10 flex items-center justify-center text-[#12372A] shrink-0">
                  <UtensilsCrossed className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-[13px] font-bold text-[#12372A]">
                    Authentic Taste
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-stone-500 leading-tight mt-0.5">
                    Traditional Kerala flavours, always.
                  </p>
                </div>
              </div>

              {/* Feature 3: Customer Satisfaction */}
              <div className="flex items-center sm:flex-col sm:items-start lg:flex-row lg:items-center gap-2.5 sm:gap-2 lg:gap-2.5 sm:pl-2">
                <div className="w-10 h-10 rounded-full bg-[#12372A]/10 flex items-center justify-center text-[#12372A] shrink-0">
                  <Smile className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-[13px] font-bold text-[#12372A]">
                    Customer Satisfaction
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-stone-500 leading-tight mt-0.5">
                    Your happiness is our priority.
                  </p>
                </div>
              </div>

            </div>

            {/* LEARN MORE Button */}
            <div className="pt-2">
              <Link
                href="/#about"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
