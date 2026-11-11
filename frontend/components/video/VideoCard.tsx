'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Clock, Sparkles } from 'lucide-react';
import type { NativeVideo } from '@/types/api';

interface VideoCardProps {
  video: NativeVideo;
  onSelect: (video: NativeVideo) => void;
  className?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onSelect, className = '' }) => {
  const thumbnail = video.customThumbnailUrl || video.thumbnailUrl;

  return (
    <div
      onClick={() => onSelect(video)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(video);
        }
      }}
      className={`group relative bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#0F5638]/40 ${className}`}
      aria-label={`Watch video: ${video.title}`}
    >
      {/* 16:9 Video Thumbnail Area */}
      <div className="relative aspect-video w-full bg-stone-900 overflow-hidden">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={video.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-stone-800 flex items-center justify-center text-stone-500">
            <span>Video Thumbnail</span>
          </div>
        )}

        {/* Dark Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

        {/* Centered YouTube-like Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#0F5638]/90 group-hover:bg-[#E11D48] text-white flex items-center justify-center shadow-lg transition-all duration-300 transform group-hover:scale-110">
            <Play className="w-6 h-6 fill-white translate-x-0.5" />
          </div>
        </div>

        {/* YouTube-style Duration Badge (Bottom-Right) */}
        {video.durationFormatted && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/85 text-white font-mono text-[11px] font-bold tracking-tight shadow-md flex items-center gap-1">
            <Clock className="w-3 h-3 text-stone-300" />
            <span>{video.durationFormatted}</span>
          </div>
        )}

        {/* Category Pill (Top-Left) */}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2 py-0.5 rounded-full bg-[#0F5638]/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
            {video.category}
          </span>
        </div>
      </div>

      {/* Video Information Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <h3
            className="font-bold text-[#14261D] text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-[#0F5638] transition-colors"
            title={video.title}
          >
            {video.title}
          </h3>
          {video.description && (
            <p className="text-xs text-[#66766D] line-clamp-2 mt-1 leading-relaxed">
              {video.description}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-[#66766D]">
          <span className="inline-flex items-center gap-1 font-semibold text-[#0F5638]">
            <Sparkles className="w-3 h-3 text-[#E8AA42]" />
            <span>Watch Masterclass</span>
          </span>
          <span className="font-mono text-stone-400">
            {new Date(video.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
