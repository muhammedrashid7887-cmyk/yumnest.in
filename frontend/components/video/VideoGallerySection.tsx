'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Video as VideoIcon, Film, Sparkles, Filter } from 'lucide-react';
import { fetchPublishedVideos } from '@/lib/api/videos';
import { useSocketEvent } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/lib/socket/events';
import { VideoCard } from './VideoCard';
import { VideoModal } from './VideoModal';
import type { NativeVideo } from '@/types/api';

interface VideoGallerySectionProps {
  className?: string;
  title?: string;
  subtitle?: string;
}

export const VideoGallerySection: React.FC<VideoGallerySectionProps> = ({
  className = '',
  title = 'Culinary Masterclasses & Cooking Videos',
  subtitle = 'Watch step-by-step authentic recipes, chef secrets, and Malabar cooking techniques directly on Yum Nest.',
}) => {
  const [videos, setVideos] = useState<NativeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalVideo, setActiveModalVideo] = useState<NativeVideo | null>(null);

  const refreshVideos = useCallback(() => {
    fetchPublishedVideos({
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      limit: 30,
    })
      .then((data) => {
        setVideos(data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  useEffect(() => {
    let cancelled = false;
    fetchPublishedVideos({
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      limit: 30,
    })
      .then((data) => {
        if (!cancelled) setVideos(data || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCategory]);

  // Real-time synchronization via Socket.IO
  useSocketEvent(SOCKET_EVENTS.VIDEO_CREATED, refreshVideos);
  useSocketEvent(SOCKET_EVENTS.VIDEO_UPDATED, refreshVideos);
  useSocketEvent(SOCKET_EVENTS.VIDEO_PUBLISHED, refreshVideos);
  useSocketEvent(SOCKET_EVENTS.VIDEO_UNPUBLISHED, refreshVideos);
  useSocketEvent(SOCKET_EVENTS.VIDEO_DELETED, (payload?: { id?: string; cloudinaryPublicId?: string }) => {
    if (payload?.id || payload?.cloudinaryPublicId) {
      setVideos((prev) =>
        prev.filter(
          (v) =>
            v._id !== payload.id &&
            v.id !== payload.id &&
            v.cloudinaryPublicId !== payload.id &&
            v.cloudinaryPublicId !== payload.cloudinaryPublicId
        )
      );
    }
    refreshVideos();
  });

  // Extract unique categories
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    videos.forEach((v) => {
      if (v.category) set.add(v.category);
    });
    return Array.from(set);
  }, [videos]);

  if (!loading && videos.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3F2EA] text-[#0F6B47] text-xs font-bold uppercase tracking-wider">
          <Film className="w-3.5 h-3.5" />
          <span>Yum Nest Originals</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#14261D] tracking-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-[#66766D] leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Category Filter Pills */}
      {categories.length > 1 && (
        <div className="flex items-center justify-center flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full font-bold transition cursor-pointer border ${
              selectedCategory === 'all'
                ? 'bg-[#0F5638] text-white border-[#0F5638]'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            All Videos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-[#0F5638] text-white border-[#0F5638]'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Video Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-stone-100 rounded-2xl aspect-video animate-pulse border border-stone-200"
            />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200/80 p-8 max-w-md mx-auto space-y-2">
          <VideoIcon className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="font-bold text-stone-800 text-base">No Videos Available</h3>
          <p className="text-xs text-stone-500">
            Check back soon for new chef recipes, masterclasses, and cooking episodes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <VideoCard
              key={vid._id || vid.id}
              video={vid}
              onSelect={(v) => setActiveModalVideo(v)}
            />
          ))}
        </div>
      )}

      {/* Video Playback Modal */}
      <VideoModal
        video={activeModalVideo}
        onClose={() => setActiveModalVideo(null)}
      />
    </section>
  );
};
