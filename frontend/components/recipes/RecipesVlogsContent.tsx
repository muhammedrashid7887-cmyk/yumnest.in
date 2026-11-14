'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Play, Video, X } from 'lucide-react';
import { fetchStorefrontMedia } from '@/lib/api/media';
import { useSocketEvent } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/lib/socket/events';
import type { CookingMediaItem } from '@/data/recipesData';
import type { StorefrontMediaItem } from '@/types/api';

const NativeVideoPlayer = dynamic(
  () => import('@/components/video/NativeVideoPlayer').then((m) => m.NativeVideoPlayer),
  { ssr: false }
);

export const RecipesVlogsContent: React.FC = () => {
  const [mediaList, setMediaList] = useState<CookingMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedVideo, setSelectedVideo] = useState<CookingMediaItem | null>(null);

  const loadLiveMedia = useCallback(() => {
    fetchStorefrontMedia({ limit: 50 })
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
        setIsLoading(false);
      })
      .catch(() => {
        setMediaList([]);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    loadLiveMedia();
  }, [loadLiveMedia]);

  // Real-time synchronization when admin publishes or deletes videos
  useSocketEvent(SOCKET_EVENTS.VIDEO_CREATED, loadLiveMedia);
  useSocketEvent(SOCKET_EVENTS.VIDEO_UPDATED, loadLiveMedia);
  useSocketEvent(SOCKET_EVENTS.VIDEO_PUBLISHED, loadLiveMedia);
  useSocketEvent(SOCKET_EVENTS.VIDEO_UNPUBLISHED, loadLiveMedia);
  useSocketEvent(SOCKET_EVENTS.VIDEO_DELETED, loadLiveMedia);

  const closeModal = useCallback(() => {
    setSelectedVideo(null);
  }, []);

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
    <div className="w-full">
      {/* ── Page Header ── */}
      <section className="py-10 sm:py-14 bg-gradient-to-b from-[#F5EFE6] to-[#FAF7F0] border-b border-[#E8DFC8]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0F5638] tracking-tight">
            Recipes &amp; Vlogs
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
            Watch authentic culinary preparations, signature crispy broast tutorials, and traditional Kerala spice masterclasses.
          </p>
        </div>
      </section>

      {/* ── Video Grid (4 per row desktop, 2 tablet, 1 mobile) ── */}
      <section className="py-10 sm:py-14 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E8DFC8] overflow-hidden p-4 space-y-3 animate-pulse">
                <div className="aspect-video w-full bg-stone-200 rounded-xl" />
                <div className="h-4 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : mediaList.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#0F5638]/10 text-[#0F5638] flex items-center justify-center mx-auto">
              <Video className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-stone-800">
              No videos available at the moment.
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Please check back soon for authentic recipe tutorials and cooking vlogs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {mediaList.map((video) => (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="group bg-white rounded-2xl border border-[#E8DFC8] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                {/* Top: Video Thumbnail with Play Button */}
                <div>
                  <div className="relative aspect-video w-full bg-stone-900 overflow-hidden">
                    <img
                      src={video.image || video.thumbnailUrl}
                      alt={video.alt || video.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                    {/* Centered Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#0F5638]/90 group-hover:bg-[#0F5638] text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Info */}
                  <div className="p-4 sm:p-5">
                    <h3
                      className="font-bold text-sm sm:text-base text-stone-900 group-hover:text-[#0F5638] transition-colors line-clamp-2 leading-snug mb-1.5"
                      title={video.titleEnglish || video.title}
                    >
                      {video.titleEnglish || video.title}
                    </h3>

                    {video.shortDescription && (
                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {video.shortDescription}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer: Watch Video Action */}
                <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-[#E8DFC8]/60 mt-auto">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    {video.platform === 'native' ? 'Yumnest Video' : video.platform === 'instagram' ? 'Instagram Reel' : 'YouTube Video'}
                  </span>
                  <span className="text-xs font-bold text-[#0F5638] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    Watch Video &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Video Modal Player Overlay ── */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={selectedVideo.titleEnglish || selectedVideo.title}
        >
          <div
            className="relative w-full max-w-4xl bg-stone-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Title & Close Button */}
            <div className="px-4 py-3 bg-stone-900/90 flex items-center justify-between text-white border-b border-stone-800">
              <h3 className="text-xs sm:text-sm font-semibold truncate pr-3 text-stone-200">
                {selectedVideo.titleEnglish || selectedVideo.title}
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

            {/* Video Player Area */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              {selectedVideo.isNative && selectedVideo.nativeVideoUrl ? (
                <NativeVideoPlayer
                  videoUrl={selectedVideo.nativeVideoUrl}
                  posterUrl={selectedVideo.thumbnailUrl}
                  title={selectedVideo.titleEnglish || selectedVideo.title}
                  autoPlay={true}
                />
              ) : selectedVideo.youtubeId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`}
                  title={selectedVideo.titleEnglish || selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : selectedVideo.platform === 'instagram' ? (
                <div className="w-full h-full flex items-center justify-center py-4 bg-stone-950">
                  <iframe
                    src={`https://www.instagram.com/reel/${selectedVideo.externalId}/embed/`}
                    title={selectedVideo.titleEnglish || selectedVideo.title}
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
    </div>
  );
};

export default RecipesVlogsContent;
