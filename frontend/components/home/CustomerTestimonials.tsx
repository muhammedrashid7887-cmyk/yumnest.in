import React from 'react';
import { SAMPLE_REVIEWS } from '@/data/mockData';
import { Star, Quote, AlertCircle } from 'lucide-react';

export const CustomerTestimonials: React.FC = () => {
  return (
    <section className="py-8 sm:py-24 bg-[#FBF9F5] border-b border-[#E8DFC8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-1.5 sm:space-y-2">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C6D46]">
            Real Kitchen Stories
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#12372A]">
            Loved by Home Cooks & Chefs
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Hear why families and culinary enthusiasts choose Yumnest for their everyday recipes.
          </p>
        </div>

        {/* Prototype Sample Data Notice */}
        <div className="max-w-3xl mx-auto p-3 rounded-2xl bg-amber-500/10 border border-amber-600/20 flex items-start gap-2.5 sm:gap-3 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px] sm:text-xs">
            <strong>Prototype Notice:</strong> Testimonials displayed below are representative sample reviews for this frontend release prototype, illustrating future customer feedback displays.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          {SAMPLE_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col justify-between p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border border-[#E8DFC8] shadow-sm hover:shadow-lg transition-shadow relative"
            >
              <Quote className="w-8 h-8 text-[#E8AA42]/30 mb-3" />

              <div className="space-y-3">
                {/* Star rating */}
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Author & Favorite Dish Footer */}
              <div className="pt-5 mt-5 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1C1917]">
                    {rev.name}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    {rev.role} • {rev.location}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#12372A]/10 text-[#12372A]">
                  {rev.dish}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
