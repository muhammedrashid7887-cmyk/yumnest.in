'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX, ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    // Defer video auto-loading until after critical hydration and idle time
    const loadAndPlay = () => {
      const navAny = typeof navigator !== 'undefined' ? (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }) : null;
      if (navAny?.connection?.saveData || navAny?.connection?.effectiveType === '2g') {
        // Keep crisp poster without auto-downloading 25MB on low-bandwidth / data saver
        return;
      }

      video.preload = 'metadata';
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            video.muted = true;
            setIsMuted(true);
            video.play().then(() => setIsPlaying(true)).catch(() => {});
          });
      }
    };

    let idleId: number | undefined;
    let timerId: ReturnType<typeof setTimeout> | undefined;

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = (window as unknown as { requestIdleCallback: (cb: () => void, opts: { timeout: number }) => number })
        .requestIdleCallback(loadAndPlay, { timeout: 2000 });
    } else {
      timerId = setTimeout(loadAndPlay, 1200);
    }

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      if (idleId && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      }
      if (timerId) clearTimeout(timerId);
    };
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
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <section className="relative w-full bg-[#120a05] overflow-hidden select-none">
      {/* 
        Full Video Banner Container:
        - Natural 16:9 aspect ratio preservation across desktop and mobile
        - No object-cover cropping — the entire video frame and logo are 100% visible
        - Up to 1920px max width for clean desktop display
      */}
      <div 
        onClick={togglePlay}
        className="relative w-full max-w-[1920px] mx-auto flex items-center justify-center bg-black cursor-pointer group"
      >
        {/* Main Brand Video: Full view with complete logo visibility */}
        <video
          ref={videoRef}
          src="/assets/yumnestvedio.mp4"
          poster="/assets/banner1.webp"
          loop
          muted={isMuted}
          playsInline
          preload="none"
          className="w-full h-auto block"
        />

        {/* Minimal Bottom Gradient to keep entire video clear while elevating the CTA */}
        <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {/* Sound Toggle Button (Discreet, Top-Right) */}
        <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-20">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
            title={isMuted ? 'Unmute' : 'Mute'}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-200" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E8AA42]" />
            )}
          </button>
        </div>

        {/* Bottom Centered "Shop Now" Button */}
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-2.5 sm:bottom-4 md:bottom-6 inset-x-0 flex items-center justify-center z-20 px-4"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-2 sm:py-2.5 rounded-full bg-white hover:bg-stone-50 text-[#0F5638] text-xs sm:text-sm font-bold uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer group"
          >
            <span>Shop Now</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
};
