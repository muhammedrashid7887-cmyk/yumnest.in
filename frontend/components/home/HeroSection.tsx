'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX, Play, Pause, ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    // Attempt automatic playback on mount
    const video = videoRef.current;
    if (video) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Autoplay was blocked (standard browser policy), fallback to muted
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => setIsPlaying(false));
          });
      }
    }
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <section className="relative w-full bg-stone-950 overflow-hidden select-none">
      {/* 16:9 Full Responsive Video Wrapper */}
      <div 
        onClick={togglePlay}
        className="relative w-full aspect-video max-h-[85vh] lg:max-h-[640px] xl:max-h-[720px] mx-auto flex items-center justify-center overflow-hidden cursor-pointer group"
      >
        {/* Main Video: "yumnestvedio" */}
        <video
          ref={videoRef}
          src="/assets/yumnestvedio.mp4"
          poster="/assets/banner1.jpeg"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center block"
        />

        {/* Subtle Dark Gradient at Bottom for CTA Prominence */}
        <div className="absolute inset-x-0 bottom-0 h-28 sm:h-36 md:h-44 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

        {/* Top-Right Audio & Playback Controls */}
        <div className="absolute top-3 right-3 sm:top-5 sm:right-6 flex items-center gap-2 z-20">
          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
            title={isMuted ? 'Unmute' : 'Mute'}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-stone-300" />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#E8AA42]" />
            )}
          </button>

          {/* Play/Pause Toggle Indicator */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            title={isPlaying ? 'Pause' : 'Play'}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-200" />
            ) : (
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E8AA42] fill-[#E8AA42] translate-x-0.5" />
            )}
          </button>
        </div>

        {/* Bottom Centered "Shop Now" Action Bar (Neat, Lean & Standard) */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="absolute bottom-3 sm:bottom-6 md:bottom-8 inset-x-0 flex items-center justify-center z-20 px-4"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 sm:px-9 py-2 sm:py-3 rounded-full bg-white hover:bg-stone-50 text-[#0F5638] text-xs sm:text-sm font-bold uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer group/btn"
          >
            <span>Shop Now</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
};
