'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Play, Video, ExternalLink, X, Clock, ChefHat, Sparkles, UtensilsCrossed } from 'lucide-react';
import { InstagramIcon } from '@/components/common/BrandMediaIcons';
import { fetchStorefrontMedia } from '@/lib/api/media';
import { fetchPublishedVideos } from '@/lib/api/videos';
import { useSocketEvent } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/lib/socket/events';
import type { DepthCarouselItem } from './DepthCarousel';
import type { Recipe } from '@/types';
import type { StorefrontMediaItem, NativeVideo } from '@/types/api';

const DepthCarousel = dynamic(() => import('./DepthCarousel'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 flex items-center justify-center bg-black/40 rounded-2xl">
      <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
    </div>
  ),
});

const NativeVideoPlayer = dynamic(
  () => import('@/components/video/NativeVideoPlayer').then((m) => m.NativeVideoPlayer),
  { ssr: false }
);

interface HomeRecipesPreviewProps {
  recipes?: Recipe[];
}

interface CookingMediaItem extends DepthCarouselItem {
  id: string;
  platform: 'youtube' | 'instagram' | 'native';
  url: string;
  externalId: string;
  youtubeId?: string;
  nativeVideoUrl?: string;
  isNative?: boolean;
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
  const [mediaList, setMediaList] = useState<CookingMediaItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<CookingMediaItem | null>(null);

  const loadLiveMedia = useCallback(() => {
    Promise.allSettled([
      fetchPublishedVideos({ limit: 20 }),
      fetchStorefrontMedia({ limit: 20 }),
    ])
      .then(([nativeResult, legacyResult]) => {
        const nativeVideos = nativeResult.status === 'fulfilled' ? nativeResult.value : [];
        const legacyMedia = legacyResult.status === 'fulfilled' ? legacyResult.value : [];

        const mappedNative: CookingMediaItem[] = (nativeVideos || []).map((nv: NativeVideo) => {
          const thumb = nv.customThumbnailUrl || nv.thumbnailUrl;
          return {
            id: nv._id || nv.id || nv.cloudinaryPublicId,
            image: thumb,
            alt: nv.title,
            title: nv.title,
            titleEnglish: nv.title,
            titleMalayalam: nv.title,
            duration: nv.durationFormatted || 'Video',
            category: nv.category || 'Cooking Special',
            shortDescription:
              nv.description || 'Authentic Yumnest culinary masterclass and recipe preparation guide.',
            platform: 'native',
            url: nv.videoUrl,
            externalId: nv.cloudinaryPublicId,
            nativeVideoUrl: nv.videoUrl,
            isNative: true,
            thumbnailUrl: thumb,
          };
        });

        const mappedLegacy: CookingMediaItem[] = (legacyMedia || []).map((m: StorefrontMediaItem) => {
          const isYt = m.platform === 'youtube';
          const defaultItem = DEFAULT_COOKING_MEDIA.find((d) => d.externalId === m.externalId);
          return {
            id: m.id || m.externalId,
            image:
              m.thumbnailUrl ||
              (isYt
                ? `https://img.youtube.com/vi/${m.externalId}/hqdefault.jpg`
                : '/assets/instagram-reel-placeholder.png'),
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
                : '/assets/instagram-reel-placeholder.png'),
            recipeDetails: defaultItem?.recipeDetails,
          };
        });

        const combined = [...mappedNative, ...mappedLegacy];
        setMediaList(combined);
        setIsLoaded(true);
      })
      .catch(() => {
        setMediaList([]);
        setIsLoaded(true);
      });
  }, []);

  // Sync with live MongoDB published media items on mount
  useEffect(() => {
    loadLiveMedia();
  }, [loadLiveMedia]);

  // Real-time: update videos automatically when admin uploads, edits, or deletes
  useSocketEvent(SOCKET_EVENTS.VIDEO_CREATED, loadLiveMedia);
  useSocketEvent(SOCKET_EVENTS.VIDEO_UPDATED, loadLiveMedia);
  useSocketEvent(SOCKET_EVENTS.VIDEO_PUBLISHED, loadLiveMedia);
  useSocketEvent(SOCKET_EVENTS.VIDEO_UNPUBLISHED, loadLiveMedia);
  useSocketEvent(SOCKET_EVENTS.VIDEO_DELETED, (payload?: { id?: string; externalId?: string }) => {
    if (payload?.id || payload?.externalId) {
      setMediaList((prev) =>
        prev.filter(
          (m) =>
            m.id !== payload.id &&
            m.id !== payload.externalId &&
            m.externalId !== payload.id &&
            m.externalId !== payload.externalId
        )
      );
    }
    loadLiveMedia();
  });

  const handleItemSelect = useCallback((item: DepthCarouselItem) => {
    const videoItem = item as CookingMediaItem;
    setSelectedVideo(videoItem);
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

  // Hide entire section if videos haven't loaded yet or if no videos exist
  if (!isLoaded || mediaList.length === 0) {
    return null;
  }

  return (
    <section id="recipes" className="py-8 sm:py-10 lg:py-12 bg-[#FAF7F0] relative overflow-hidden reveal-on-scroll border-y border-stone-200/60" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.25em] text-[#9E7326] uppercase">
            Culinary Masterclasses
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F5638] tracking-tight leading-tight">
            Cooking Videos &amp; Recipes
          </h2>
          <div className="w-12 h-1 rounded-full bg-[#E8AA42] mx-auto" />
          <p className="text-xs sm:text-sm md:text-base text-stone-600 leading-relaxed font-normal">
            Discover authentic Kerala recipes, step-by-step cooking videos, and culinary inspirations.
          </p>
        </div>

        {/* 3D DepthCarousel Container */}
        <div className="w-full h-[520px] sm:h-[540px] lg:h-[570px] relative flex items-center justify-center overflow-hidden">
          {/* Symmetrical Left and Right Fade Overlays matching light standard #FAF7F0 */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 lg:w-24 bg-gradient-to-r from-[#FAF7F0] via-[#FAF7F0]/80 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 lg:w-24 bg-gradient-to-l from-[#FAF7F0] via-[#FAF7F0]/80 to-transparent z-10" />

          <DepthCarousel
            items={mediaList}
            cardWidth={330}
            cardHeight={395}
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

      </div>

      {/* Clean & Simple Video Modal Overlay */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={selectedVideo.titleEnglish}
        >
          <div
            className="relative w-full max-w-4xl bg-stone-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Title & Close Button */}
            <div className="px-4 py-3 bg-stone-900/90 flex items-center justify-between text-white border-b border-stone-800">
              <h3 className="text-xs sm:text-sm font-semibold truncate pr-3 text-stone-200">
                {selectedVideo.titleEnglish || selectedVideo.titleMalayalam}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Clean Video Player */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              {selectedVideo.isNative && selectedVideo.nativeVideoUrl ? (
                <NativeVideoPlayer
                  videoUrl={selectedVideo.nativeVideoUrl}
                  posterUrl={selectedVideo.thumbnailUrl}
                  title={selectedVideo.titleEnglish}
                  autoPlay={true}
                />
              ) : selectedVideo.youtubeId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`}
                  title={selectedVideo.titleEnglish}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : selectedVideo.platform === 'instagram' ? (
                <div className="w-full h-full flex items-center justify-center py-4 bg-stone-950">
                  <iframe
                    src={`https://www.instagram.com/reel/${selectedVideo.externalId}/embed/`}
                    title={selectedVideo.titleEnglish}
                    className="w-full max-w-[420px] h-[520px] rounded-lg border-0 shadow-md"
                    allowFullScreen
                    scrolling="no"
                  />
                </div>
              ) : (
                <div className="p-8 text-center text-stone-400">
                  <Video className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Video not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
