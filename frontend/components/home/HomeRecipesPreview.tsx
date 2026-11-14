'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Play, Video, ExternalLink, X, Clock, ChefHat, Sparkles, UtensilsCrossed } from 'lucide-react';
import { InstagramIcon } from '@/components/common/BrandMediaIcons';
import { fetchStorefrontMedia } from '@/lib/api/media';
import { useSocketEvent } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/lib/socket/events';
import type { DepthCarouselItem } from './DepthCarousel';
import type { Recipe } from '@/types';
import type { StorefrontMediaItem } from '@/types/api';

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

export const HomeRecipesPreview: React.FC<HomeRecipesPreviewProps> = ({ recipes }) => {
  const [mediaList, setMediaList] = useState<CookingMediaItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<CookingMediaItem | null>(null);

  const loadLiveMedia = useCallback(() => {
    fetchStorefrontMedia({ limit: 20 })
      .then((items: StorefrontMediaItem[]) => {
        const mapped: CookingMediaItem[] = (items || []).map((m: StorefrontMediaItem) => {
          const isYt = m.platform === 'youtube';
          const thumb =
            m.thumbnailUrl ||
            (isYt
              ? `https://img.youtube.com/vi/${m.externalId}/hqdefault.jpg`
              : '/assets/instagram-reel-placeholder.png');
          return {
            id: m.id || m.externalId,
            image: thumb,
            alt: m.title,
            title: m.title,
            titleEnglish: m.title,
            titleMalayalam: m.titleMl || m.title,
            duration: m.duration || '',
            category: m.category || '',
            shortDescription: m.description || '',
            platform: m.platform,
            url: m.url,
            externalId: m.externalId,
            youtubeId: isYt ? m.externalId : undefined,
            thumbnailUrl: thumb,
          };
        });

        setMediaList(mapped);
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
