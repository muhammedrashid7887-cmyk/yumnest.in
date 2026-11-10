'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Play, Video, ExternalLink, X, Clock, ChefHat, Sparkles, UtensilsCrossed } from 'lucide-react';
import { InstagramIcon } from '@/components/common/BrandMediaIcons';
import { fetchStorefrontMedia } from '@/lib/api/media';
import DepthCarousel from './DepthCarousel';
import type { DepthCarouselItem } from './DepthCarousel';
import type { Recipe } from '@/types';
import type { StorefrontMediaItem } from '@/types/api';

interface HomeRecipesPreviewProps {
  recipes?: Recipe[];
}

interface CookingMediaItem extends DepthCarouselItem {
  id: string;
  platform: 'youtube' | 'instagram';
  url: string;
  externalId: string;
  youtubeId?: string;
  titleEnglish: string;
  titleMalayalam: string;
  duration: string;
  category: string;
  thumbnailUrl: string;
  shortDescription: string;
  recipeDetails?: {
    prepTime?: string;
    cookTime?: string;
    servings?: string;
    ingredients?: string[];
    instructions?: string[];
  };
}

const DEFAULT_COOKING_MEDIA: CookingMediaItem[] = [
  {
    id: 'broast-chicken',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
    alt: 'Restaurant-Style Crispy Broasted Chicken',
    title: 'Restaurant-Style Crispy Broasted Chicken | Yumnest Broast Masala',
    titleEnglish: 'Restaurant-Style Crispy Broasted Chicken | Yumnest Broast Masala',
    titleMalayalam: 'റെസ്റ്റോറന്റ് സ്റ്റൈൽ ക്രിസ്പി ബ്രോസ്റ്റഡ് ചിക്കൻ എളുപ്പത്തിൽ ഉണ്ടാക്കാം',
    duration: '12:45',
    category: 'Broast Special',
    shortDescription: 'Master the iconic crispy craggy coating and juicy tenderness with authentic Yumnest Broast Masala.',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=bXvN_v8vXwE',
    externalId: 'bXvN_v8vXwE',
    youtubeId: 'bXvN_v8vXwE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
    recipeDetails: {
      prepTime: '2 hrs marination',
      cookTime: '15 mins',
      servings: '4 persons',
      ingredients: [
        '1kg Chicken pieces (medium cuts)',
        '4 tbsp Yumnest Broast Masala',
        '1 cup Buttermilk',
        '2 cups Refined Flour',
        '1 tbsp Garlic paste',
        'Chilled ice water',
        'Pure cooking oil for deep frying',
      ],
      instructions: [
        'Marinate cleaned chicken pieces in buttermilk, garlic paste, and 3 tbsp Yumnest Broast Masala for 2 hours.',
        'In a wide tray, mix refined flour with 1 tbsp Yumnest Broast Masala and a pinch of salt.',
        'Dredge seasoned chicken firmly in flour, dip in ice water for 1 second, then dredge again to create crispy flakes.',
        'Deep fry at 170°C for 12-14 minutes until golden, crunchy, and thoroughly cooked inside.',
      ],
    },
  },
  {
    id: 'alfaham-chicken',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
    alt: 'Signature Alfaham Chicken Masala',
    title: 'Signature Alfaham Chicken Masala Preparation & Grilling Guide',
    titleEnglish: 'Signature Alfaham Chicken Masala Preparation & Grilling Guide',
    titleMalayalam: 'സ്പെഷ്യൽ അൽഫാഹം ചിക്കൻ റെസിപ്പി - പെർഫെക്റ്റ് ഗ്രിൽഡ് ഫ്ലേവർ',
    duration: '15:20',
    category: 'Signature Rubs',
    shortDescription: 'Smoky charcoal-grilled Alfaham chicken infused with lemon, crushed garlic, and aromatic spices.',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    externalId: 'kJQP7kiw5Fk',
    youtubeId: 'kJQP7kiw5Fk',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
    recipeDetails: {
      prepTime: '4 hrs marination',
      cookTime: '25 mins',
      servings: '4 persons',
      ingredients: [
        '1 Whole Chicken (butterflied/scored)',
        '3 tbsp Yumnest Alfaham Rub',
        '2 tbsp Lemon juice',
        '2 tbsp Thick yogurt',
        '1 tbsp Ginger-garlic paste',
        'Olive or coconut oil for basting',
      ],
      instructions: [
        'Make deep incisions across chicken joints and breast for spice penetration.',
        'Rub chicken thoroughly with lemon juice, yogurt, and Yumnest Alfaham spice mix. Rest for 4 hours.',
        'Grill over medium charcoal or in a 200°C oven for 25 minutes, basting with oil every 7 minutes until smoky and tender.',
      ],
    },
  },
  {
    id: 'thalassery-biryani',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    alt: 'Authentic Thalassery Dum Biryani',
    title: 'Authentic Thalassery Dum Biryani with Heritage Spices',
    titleEnglish: 'Authentic Thalassery Dum Biryani with Heritage Spices',
    titleMalayalam: 'ഒറിജിനൽ തലശ്ശേരി ദം ബിരിയാണി ഉണ്ടാക്കുന്ന വിധം',
    duration: '18:10',
    category: 'Heritage Recipes',
    shortDescription: 'Fragrant Kaima rice cooked on slow dum with Tellicherry black pepper and fresh green cardamom.',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=X48VuDVv0do',
    externalId: 'X48VuDVv0do',
    youtubeId: 'X48VuDVv0do',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    recipeDetails: {
      prepTime: '30 mins',
      cookTime: '45 mins',
      servings: '6 persons',
      ingredients: [
        '500g Kaima Rice (Jeerakasala)',
        '750g Mutton or Chicken pieces',
        'Yumnest Bold Green Cardamom (6 pods)',
        '1 tbsp Yumnest Tellicherry Black Pepper',
        '3 tbsp Pure Kerala Ghee',
        'Fried onions, cashews, and raisins for garnish',
      ],
      instructions: [
        'Sauté sliced onions in pure ghee until deep golden brown; set half aside for garnishing.',
        'Slow cook meat with ground green chillies, ginger-garlic paste, yogurt, and crushed cardamom.',
        'Parboil washed Kaima rice with whole spices and lemon juice until 75% done.',
        'Layer cooked meat and rice in a heavy vessel, seal tightly with foil, and dum cook on low flame for 25 minutes.',
      ],
    },
  },
  {
    id: 'tawa-fish-fry',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    alt: 'Coastal King Fish Tawa Fry',
    title: 'Coastal King Fish Tawa Fry with Roasted Spices',
    titleEnglish: 'Coastal King Fish Tawa Fry with Roasted Spices',
    titleMalayalam: 'നാടൻ നെയ്മീൻ തവ ഫ്രൈ സ്പെഷ്യൽ മസാല കൂട്ട്',
    duration: '09:30',
    category: 'Seafood Specials',
    shortDescription: 'Fiery and zesty coastal fish fry marinated with Kashmiri chilli, crushed pepper, and roasted coconut oil.',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    externalId: 'LXb3EKWsInQ',
    youtubeId: 'LXb3EKWsInQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    recipeDetails: {
      prepTime: '20 mins marination',
      cookTime: '10 mins',
      servings: '3 persons',
      ingredients: [
        '500g Fresh Kingfish (Neymeen) steaks',
        '2 tbsp Yumnest Kashmiri Chilli Powder',
        '1 tsp Yumnest Wayanad Turmeric',
        '1 tsp Crushed Tellicherry Black Pepper',
        '1 tbsp Fresh lemon juice',
        '3 tbsp Yumnest Cold Pressed Coconut Oil',
        'Fresh curry leaves',
      ],
      instructions: [
        'Form a smooth thick paste with chilli powder, turmeric, pepper, ginger-garlic, lemon juice, and sea salt.',
        'Evenly coat the fish steaks and rest for 20 minutes to absorb flavor.',
        'Heat an iron tawa with coconut oil, scatter curry leaves, and shallow fry steaks for 4-5 minutes per side until crisp.',
      ],
    },
  },
  {
    id: 'kerala-beef-roast',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    alt: 'Authentic Kerala Beef Roast',
    title: 'Authentic Kerala Beef Roast with Roasted Coconut & Spices',
    titleEnglish: 'Authentic Kerala Beef Roast with Roasted Coconut & Spices',
    titleMalayalam: 'നാടൻ ബീഫ് ഉലർത്തിയത് - തനി നാടൻ രുചിയിൽ',
    duration: '14:15',
    category: 'Heritage Recipes',
    shortDescription: 'Tender slow-cooked meat tossed with roasted coconut slivers, curry leaves, and stone-ground spices.',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=bXvN_v8vXwE',
    externalId: 'bXvN_v8vXwE',
    youtubeId: 'bXvN_v8vXwE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'malabar-chicken-curry',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    alt: 'Traditional Malabar Coconut Chicken Curry',
    title: 'Traditional Malabar Coconut Chicken Curry',
    titleEnglish: 'Traditional Malabar Coconut Chicken Curry',
    titleMalayalam: 'സ്വാദിഷ്ടമായ മലബാർ ചിക്കൻ കറി റെസിപ്പി',
    duration: '11:40',
    category: 'Curry Specials',
    shortDescription: 'Rich and velvety slow-simmered chicken curry in fresh coconut milk with whole spices and curry leaves.',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    externalId: 'kJQP7kiw5Fk',
    youtubeId: 'kJQP7kiw5Fk',
    thumbnailUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
  },
];

export const HomeRecipesPreview: React.FC<HomeRecipesPreviewProps> = ({ recipes }) => {
  const [mediaList, setMediaList] = useState<CookingMediaItem[]>(DEFAULT_COOKING_MEDIA);
  const [selectedVideo, setSelectedVideo] = useState<CookingMediaItem | null>(null);
  const [activeTab, setActiveTab] = useState<'video' | 'recipe'>('video');

  // Sync with live MongoDB published media items if available
  useEffect(() => {
    let isMounted = true;
    fetchStorefrontMedia({ limit: 20 })
      .then((liveMedia) => {
        if (!isMounted) return;
        if (liveMedia && liveMedia.length > 0) {
          const mapped: CookingMediaItem[] = liveMedia.map((m: StorefrontMediaItem) => {
            const isYt = m.platform === 'youtube';
            const defaultItem = DEFAULT_COOKING_MEDIA.find((d) => d.externalId === m.externalId);
            return {
              id: m.id || m.externalId,
              image:
                m.thumbnailUrl ||
                (isYt
                  ? `https://img.youtube.com/vi/${m.externalId}/hqdefault.jpg`
                  : 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'),
              alt: m.title,
              title: m.title,
              titleEnglish: m.title,
              titleMalayalam: m.titleMl || m.title,
              duration: m.duration || (isYt ? 'Video' : 'Reel'),
              category: m.category || 'Cooking Vlog',
              shortDescription:
                defaultItem?.shortDescription ||
                'Explore authentic Kerala cooking techniques, secret spice pairings, and step-by-step guides.',
              platform: m.platform,
              url: m.url,
              externalId: m.externalId,
              youtubeId: isYt ? m.externalId : undefined,
              thumbnailUrl:
                m.thumbnailUrl ||
                (isYt
                  ? `https://img.youtube.com/vi/${m.externalId}/hqdefault.jpg`
                  : 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'),
              recipeDetails: defaultItem?.recipeDetails,
            };
          });
          setMediaList(mapped);
        }
      })
      .catch(() => {
        // Fallback safely to curated default media
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleItemSelect = useCallback((item: DepthCarouselItem) => {
    const videoItem = item as CookingMediaItem;
    if (videoItem.platform === 'instagram') {
      window.open(videoItem.url, '_blank', 'noopener,noreferrer');
      return;
    }
    setSelectedVideo(videoItem);
    setActiveTab('video');
  }, []);

  const closeModal = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  // Handle escape key to close video/recipe modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    if (selectedVideo) {
      window.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = 'unset';
    };
  }, [selectedVideo, closeModal]);

  return (
    <section id="recipes" className="py-8 sm:py-10 lg:py-12 bg-[#FBF9F5] relative overflow-hidden reveal-on-scroll">
      
      {/* Subtle Symmetrical Background Glow */}
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-[#E8AA42]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 bg-[#0F5638]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F4C3A]/10 text-[#0F4C3A] text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#C87A14]" />
            <span>Culinary Masterclasses</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F5638] tracking-tight leading-tight">
            Cooking Videos &amp; Recipes
          </h2>
          <div className="w-12 h-1 rounded-full bg-[#E8AA42] mx-auto" />
          <p className="text-xs sm:text-sm md:text-base text-stone-600 leading-relaxed font-normal">
            Discover authentic Kerala recipes, step-by-step cooking videos, and culinary inspirations.
          </p>
        </div>

        {/* 3D DepthCarousel Container */}
        {mediaList.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-[#E8DFC8] p-8 max-w-lg mx-auto">
            <Video className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <h3 className="font-bold text-stone-800 text-base">New Recipes Coming Soon</h3>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">
              Stay tuned for delicious cooking videos, recipe vlogs, and behind-the-scenes specials.
            </p>
          </div>
        ) : (
          <div className="w-full h-[500px] sm:h-[530px] lg:h-[560px] relative flex items-center justify-center overflow-hidden">
            {/* Symmetrical Left and Right Fade Overlays */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 lg:w-24 bg-gradient-to-r from-[#FBF9F5] via-[#FBF9F5]/80 to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 lg:w-24 bg-gradient-to-l from-[#FBF9F5] via-[#FBF9F5]/80 to-transparent z-10" />

            <DepthCarousel
              items={mediaList}
              cardWidth={340}
              cardHeight={420}
              radius={20}
              duration={500}
              ease="power2.out"
              loop={false}
              autoplay={false}
              showControls={true}
              showIndicators={true}
              onItemClick={handleItemSelect}
            />
          </div>
        )}

      </div>

      {/* Video / Recipe Modal Overlay */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={selectedVideo.titleEnglish}
        >
          <div
            className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-[#E8DFC8] flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="px-5 py-3.5 border-b border-stone-200 flex items-center justify-between bg-[#FBF9F5]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#0F4C3A] text-white text-[11px] font-bold uppercase tracking-wider">
                  {selectedVideo.category}
                </span>
                {selectedVideo.duration && (
                  <span className="inline-flex items-center gap-1 text-xs text-stone-600 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#C87A14]" />
                    <span>{selectedVideo.duration}</span>
                  </span>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player or Recipe Tabs */}
            {selectedVideo.recipeDetails && (
              <div className="flex border-b border-stone-200 bg-stone-50 px-5 pt-2 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('video')}
                  className={`pb-2.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors border-b-2 ${
                    activeTab === 'video'
                      ? 'border-[#0F4C3A] text-[#0F4C3A]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Video Player</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('recipe')}
                  className={`pb-2.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors border-b-2 ${
                    activeTab === 'recipe'
                      ? 'border-[#0F4C3A] text-[#0F4C3A]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>Recipe Ingredients &amp; Method</span>
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
              {activeTab === 'video' ? (
                <>
                  {/* YouTube Embed Player */}
                  {selectedVideo.youtubeId ? (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-lg">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`}
                        title={selectedVideo.titleEnglish}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-stone-50 rounded-xl">
                      <Video className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                      <p className="text-sm text-stone-600">Video preview not available</p>
                    </div>
                  )}

                  {/* Title & Description */}
                  <div className="space-y-1.5 pt-2">
                    {selectedVideo.titleMalayalam && (
                      <p className="text-xs font-semibold text-[#C87A14]">
                        {selectedVideo.titleMalayalam}
                      </p>
                    )}
                    <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                      {selectedVideo.titleEnglish}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      {selectedVideo.shortDescription}
                    </p>
                  </div>

                  {/* Action Link to YouTube / External */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <a
                      href={selectedVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F4C3A] hover:text-[#C87A14] transition-colors"
                    >
                      <span>Open on YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {selectedVideo.recipeDetails && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('recipe')}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#C87A14] hover:underline cursor-pointer"
                      >
                        <UtensilsCrossed className="w-3.5 h-3.5" />
                        <span>View Step-by-Step Cooking Guide</span>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* Recipe Ingredients & Instructions Tab */
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-4 p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFC8]/60 text-xs text-stone-700">
                    {selectedVideo.recipeDetails?.prepTime && (
                      <div>
                        <span className="font-semibold text-stone-500 block">Prep Time</span>
                        <span className="font-bold text-stone-900">{selectedVideo.recipeDetails.prepTime}</span>
                      </div>
                    )}
                    {selectedVideo.recipeDetails?.cookTime && (
                      <div>
                        <span className="font-semibold text-stone-500 block">Cook Time</span>
                        <span className="font-bold text-stone-900">{selectedVideo.recipeDetails.cookTime}</span>
                      </div>
                    )}
                    {selectedVideo.recipeDetails?.servings && (
                      <div>
                        <span className="font-semibold text-stone-500 block">Servings</span>
                        <span className="font-bold text-stone-900">{selectedVideo.recipeDetails.servings}</span>
                      </div>
                    )}
                  </div>

                  {selectedVideo.recipeDetails?.ingredients && (
                    <div className="space-y-2">
                      <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#0F4C3A] flex items-center gap-1.5">
                        <UtensilsCrossed className="w-4 h-4 text-[#C87A14]" />
                        <span>Ingredients Required</span>
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-stone-700">
                        {selectedVideo.recipeDetails.ingredients.map((ing, idx) => (
                          <li key={idx} className="flex items-start gap-2 bg-stone-50 p-2 rounded-lg border border-stone-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C87A14] mt-1.5 flex-shrink-0" />
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedVideo.recipeDetails?.instructions && (
                    <div className="space-y-2">
                      <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#0F4C3A] flex items-center gap-1.5">
                        <ChefHat className="w-4 h-4 text-[#C87A14]" />
                        <span>Step-by-Step Instructions</span>
                      </h4>
                      <ol className="space-y-2 text-xs sm:text-sm text-stone-700">
                        {selectedVideo.recipeDetails.instructions.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
                            <span className="w-6 h-6 rounded-full bg-[#0F4C3A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed mt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
