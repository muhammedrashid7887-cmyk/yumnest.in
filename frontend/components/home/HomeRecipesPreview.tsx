'use client';

import React, { useState, useEffect } from 'react';
import { Play, Video, ExternalLink, ArrowRight } from 'lucide-react';
import { InstagramIcon } from '@/components/common/BrandMediaIcons';
import { fetchStorefrontMedia } from '@/lib/api/media';
import type { Recipe } from '@/types';
import type { StorefrontMediaItem } from '@/types/api';

interface HomeRecipesPreviewProps {
  recipes?: Recipe[];
}

interface VideoCardItem {
  id: string;
  platform: 'youtube' | 'instagram';
  url: string;
  externalId: string;
  youtubeId?: string;
  titleMalayalam: string;
  titleEnglish: string;
  duration: string;
  category: string;
  thumbnailUrl: string;
}

const DEFAULT_COOKING_VIDEOS: VideoCardItem[] = [
  {
    id: 'broast-chicken',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=bXvN_v8vXwE',
    externalId: 'bXvN_v8vXwE',
    youtubeId: 'bXvN_v8vXwE',
    titleMalayalam: 'റെസ്റ്റോറന്റ് സ്റ്റൈൽ ക്രിസ്പി ബ്രോസ്റ്റഡ് ചിക്കൻ എളുപ്പത്തിൽ ഉണ്ടാക്കാം',
    titleEnglish: 'Restaurant-Style Crispy Broasted Chicken | Yumnest Broast Masala',
    duration: '12:45',
    category: 'Broast Special',
    thumbnailUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'alfaham-chicken',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    externalId: 'kJQP7kiw5Fk',
    youtubeId: 'kJQP7kiw5Fk',
    titleMalayalam: 'സ്പെഷ്യൽ അൽഫാഹം ചിക്കൻ റെസിപ്പി - പെർഫെക്റ്റ് ഗ്രിൽഡ് ഫ്ലേവർ',
    titleEnglish: 'Signature Alfaham Chicken Masala Preparation & Grilling Guide',
    duration: '15:20',
    category: 'Signature Rubs',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'thalassery-biryani',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=X48VuDVv0do',
    externalId: 'X48VuDVv0do',
    youtubeId: 'X48VuDVv0do',
    titleMalayalam: 'ഒറിജിനൽ തലശ്ശേരി ദം ബിരിയാണി ഉണ്ടാക്കുന്ന വിധം',
    titleEnglish: 'Authentic Thalassery Dum Biryani with Heritage Spices',
    duration: '18:10',
    category: 'Heritage Recipes',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  },
];

export const HomeRecipesPreview: React.FC<HomeRecipesPreviewProps> = () => {
  const [videos, setVideos] = useState<VideoCardItem[]>(DEFAULT_COOKING_VIDEOS);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  // Sync with live MongoDB published media items
  useEffect(() => {
    let isMounted = true;
    fetchStorefrontMedia({ limit: 20 })
      .then((liveMedia) => {
        if (!isMounted) return;
        if (liveMedia && liveMedia.length > 0) {
          const mapped: VideoCardItem[] = liveMedia.map((m: StorefrontMediaItem) => {
            const isYt = m.platform === 'youtube';
            return {
              id: m.id || m.externalId,
              platform: m.platform,
              url: m.url,
              externalId: m.externalId,
              youtubeId: isYt ? m.externalId : undefined,
              titleMalayalam: m.titleMl || m.title,
              titleEnglish: m.title,
              duration: m.duration || (isYt ? 'Video' : 'Reel'),
              category: m.category || 'Cooking Vlog',
              thumbnailUrl:
                m.thumbnailUrl ||
                (isYt
                  ? `https://img.youtube.com/vi/${m.externalId}/hqdefault.jpg`
                  : 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'),
            };
          });
          setVideos(mapped);
        }
      })
      .catch(() => {
        // Fallback to default cooking videos if API is offline
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCardClick = (video: VideoCardItem) => {
    if (video.platform === 'youtube') {
      setPlayingVideoId(video.id);
    } else {
      window.open(video.url, '_blank', 'noopener,noreferrer');
    }
  };

  const displayVideos = videos.slice(0, 3);

  return (
    <section id="recipes" className="py-12 sm:py-16 lg:py-20 bg-[#FBF9F5] border-t border-[#E8DFC8]/70 relative overflow-hidden reveal-on-scroll">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-[#E8AA42]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-32 w-80 h-80 bg-[#0F5638]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 relative z-10">
        
        {/* Section Header (Top badge removed as requested) */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F5638] tracking-tight leading-tight">
            Cooking Videos &amp; Recipes
          </h2>
          <div className="w-12 h-1 rounded-full bg-[#E8AA42] mx-auto" />
          <p className="text-xs sm:text-sm md:text-base text-stone-600 leading-relaxed font-normal">
            Discover authentic Kerala recipes, step-by-step cooking videos, and culinary inspirations.
          </p>
        </div>

        {/* 3 Videos in One Line (Responsive Grid: 1 col on mobile, 2 on tablet, 3 on desktop) */}
        {displayVideos.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-[#E8DFC8] p-8 max-w-lg mx-auto">
            <Video className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <h3 className="font-bold text-stone-800 text-base">New Recipes Coming Soon</h3>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">
              Stay tuned for delicious cooking videos, recipe vlogs, and behind-the-scenes specials.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {displayVideos.map((video) => {
              const isPlaying = playingVideoId === video.id && video.platform === 'youtube';
              const isInstagram = video.platform === 'instagram';

              return (
                <div
                  key={video.id}
                  className="group flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-[#E8DFC8] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#0F5638]/40 transition-all duration-300"
                >
                  
                  {/* 16:9 Aspect Ratio Video Thumbnail / Player */}
                  <div className="relative aspect-video w-full bg-stone-900 overflow-hidden">
                    {isPlaying && video.youtubeId ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
                        title={video.titleMalayalam}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCardClick(video)}
                        className="relative w-full h-full block focus:outline-none cursor-pointer group/btn"
                        aria-label={`Play ${video.titleMalayalam}`}
                      >
                        {/* Video Thumbnail Image */}
                        <img
                          src={video.thumbnailUrl}
                          alt={video.titleMalayalam}
                          loading="lazy"
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Subtle Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Clean Minimal Category Badge */}
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[#E8AA42] text-[11px] font-bold uppercase tracking-wider">
                          {video.category}
                        </span>

                        {/* Platform Indicator (Instagram Reel) */}
                        {isInstagram && (
                          <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold">
                            <InstagramIcon className="w-3 h-3 text-pink-400" />
                            <span>Reel</span>
                          </span>
                        )}

                        {/* Duration Pill */}
                        {video.duration && (
                          <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[11px] font-semibold tracking-wide">
                            {video.duration}
                          </span>
                        )}

                        {/* Redesigned Sleek Center Play Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-black/45 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-xl group-hover/btn:scale-110 group-hover/btn:bg-[#0F5638] group-hover/btn:border-[#E8AA42] transition-all duration-300">
                            {isInstagram ? (
                              <InstagramIcon className="w-6 h-6 text-white group-hover/btn:text-[#E8AA42] transition-colors" />
                            ) : (
                              <Play className="w-5 h-5 fill-white text-white translate-x-0.5 group-hover/btn:fill-[#E8AA42] group-hover/btn:text-[#E8AA42] transition-colors" />
                            )}
                          </div>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Video Info Section */}
                  <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3 text-left bg-white">
                    <div className="space-y-1">
                      {/* Malayalam Title */}
                      <h3 className="font-bold text-sm sm:text-[15px] text-stone-900 group-hover:text-[#0F5638] transition-colors leading-snug tracking-normal line-clamp-2">
                        {video.titleMalayalam}
                      </h3>

                      {/* English Subtitle */}
                      <p className="text-xs text-stone-500 font-normal leading-relaxed line-clamp-1">
                        {video.titleEnglish}
                      </p>
                    </div>

                    {/* Bottom Action Hint */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="text-[#0F5638] font-bold inline-flex items-center gap-1 group-hover:text-[#187A4F] transition-colors">
                        <span>Watch Recipe</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      {isInstagram && (
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-400 hover:text-pink-600 transition"
                          title="Open Reel in Instagram"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
