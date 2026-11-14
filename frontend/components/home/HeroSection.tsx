'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Volume2, VolumeX, ArrowRight, Play } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    // Detect viewport width on client mount
    const checkIsDesktop = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      return desktop;
    };

    const desktop = checkIsDesktop();

    // On desktop, auto-enable video streaming after idle/hydration settles
    if (desktop) {
      const navAny = typeof navigator !== 'undefined'
        ? (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } })
        : null;

      // Honor Data Saver or 2G connections by keeping crisp lightweight poster
      if (!navAny?.connection?.saveData && navAny?.connection?.effectiveType !== '2g') {
        if ('requestIdleCallback' in window) {
          (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
            .requestIdleCallback(() => setShouldLoadVideo(true), { timeout: 1500 });
        } else {
          setTimeout(() => setShouldLoadVideo(true), 600);
        }
      }
    }

    const onResize = () => {
      checkIsDesktop();
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // When video mounts and starts playing
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoadVideo) return;

    video.muted = isMuted;
    video.defaultMuted = true;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Retry muted autoplay on interaction or browser approval
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => setIsPlaying(true)).catch(() => {});
        });
    }

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [shouldLoadVideo, isMuted]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const handleBannerClick = () => {
    if (!shouldLoadVideo) {
      // Mobile tap-to-play: load and immediately start video
      setShouldLoadVideo(true);
      return;
    }

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
        onClick={handleBannerClick}
        className="relative w-full max-w-[1920px] mx-auto flex items-center justify-center bg-black cursor-pointer group"
      >
        {shouldLoadVideo ? (
          /* Main Brand Video: Full view with complete logo visibility */
          <video
            ref={videoRef}
            src="/assets/yumnestvedio.mp4"
            poster="/assets/hero1_small.webp"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="metadata"
            className="w-full h-auto block"
          />
        ) : (
          /* High-Performance LCP Hero Image: Server-rendered in initial HTML without JS delays */
          <div className="relative w-full aspect-[1280/714] overflow-hidden">
            <Image
              src="/assets/hero1_small.webp"
              alt="Yum Nest Pure Spices & Kerala Food Delights"
              width={1280}
              height={714}
              preload={true}
              fetchPriority="high"
              sizes="(max-width: 768px) 100vw, 1920px"
              className="w-full h-auto block object-cover"
              quality={82}
            />

            {/* Mobile Play Button Overlay: indicates interactive brand video without downloading 25MB */}
            {!isDesktop && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 text-[#0F5638] flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Minimal Bottom Gradient to keep entire video clear while elevating the CTA */}
        <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {/* Sound Toggle Button (Visible when video is playing) */}
        {shouldLoadVideo && (
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
        )}

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
