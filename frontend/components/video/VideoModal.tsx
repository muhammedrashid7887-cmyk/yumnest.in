'use client';

import React, { useEffect, useCallback } from 'react';
import { X, Clock, Sparkles } from 'lucide-react';
import { NativeVideoPlayer } from './NativeVideoPlayer';
import type { NativeVideo } from '@/types/api';

interface VideoModalProps {
  video: NativeVideo | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (video) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [video, handleKeyDown]);

  if (!video) return null;

  const thumbnail = video.customThumbnailUrl || video.thumbnailUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
    >
      <div
        className="relative w-full max-w-4xl bg-stone-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 py-3 bg-stone-900 border-b border-stone-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 truncate mr-3">
            <span className="px-2.5 py-0.5 rounded-full bg-[#0F5638] text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-100">
              {video.category}
            </span>
            {video.durationFormatted && (
              <span className="inline-flex items-center gap-1 text-xs text-stone-400 font-mono">
                <Clock className="w-3.5 h-3.5 text-[#E8AA42]" />
                <span>{video.durationFormatted}</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close video player"
            className="p-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Area */}
        <div className="relative w-full bg-black">
          <NativeVideoPlayer
            videoUrl={video.videoUrl}
            posterUrl={thumbnail}
            title={video.title}
            autoPlay={true}
            aspectRatio={video.height > video.width ? '9/16' : '16/9'}
          />
        </div>

        {/* Video Meta Info Area */}
        <div className="p-4 sm:p-5 bg-stone-900 text-white space-y-2 overflow-y-auto max-h-[30vh]">
          <h2 className="text-base sm:text-lg font-bold text-stone-100 leading-snug">
            {video.title}
          </h2>

          {video.description && (
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-normal whitespace-pre-line">
              {video.description}
            </p>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 border-t border-stone-800/80">
            <span className="inline-flex items-center gap-1 text-[#E8AA42] font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Yum Nest Culinary Masterclass</span>
            </span>
            <span className="font-mono">
              Format: {video.format.toUpperCase()} &bull; {video.width}&times;{video.height}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
