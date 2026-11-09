'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX, ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    // Attempt automatic playback on mount
    const video = videoRef.current;
    if (video) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was blocked by browser policy, keep muted and retry
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
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
          poster="/assets/banner1.jpeg"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
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

      {/* ── Animated Dual Brand Marquee Banner (Positioned immediately below Video Section) ── */}
      <div className="w-full overflow-hidden select-none border-t border-black/40 border-b border-[#E8DFC8]/60 shadow-md">
        {/* Strip 1: Deep olive-green background with warm cream text (Right to Left) */}
        <div className="w-full bg-[#0F5638] text-[#FAF7F2] py-2.5 sm:py-3 overflow-hidden border-b border-[#0A3D27]">
          <div className="animate-marquee-rtl flex items-center whitespace-nowrap">
            {/* Track A */}
            <div className="flex shrink-0 items-center text-xs sm:text-[13px] font-medium tracking-wider uppercase font-sans">
              {[...Array(3)].map((_, i) => (
                <span key={`strip1-a-${i}`} className="inline-flex items-center">
                  <span className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#0A3D27]/85 border border-[#FAF7F2]/20 shadow-2xs">
                    Yum Nest – One Nest, Endless Flavors
                  </span>
                  <span className="mx-3 sm:mx-4.5 inline-flex items-center text-[#E8AA42]">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#E8AA42] rounded-[1px] shadow-2xs" />
                  </span>

                  <span className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#0A3D27]/85 border border-[#FAF7F2]/20 shadow-2xs">
                    Premium Masala Blends
                  </span>
                  <span className="mx-3 sm:mx-4.5 inline-flex items-center text-[#E8AA42]">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#E8AA42] rounded-[1px] shadow-2xs" />
                  </span>

                  <span className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#0A3D27]/85 border border-[#FAF7F2]/20 shadow-2xs">
                    Authentic Taste in Every Bite
                  </span>
                  <span className="mx-3 sm:mx-4.5 inline-flex items-center text-[#E8AA42]">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#E8AA42] rounded-[1px] shadow-2xs" />
                  </span>

                  <span className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#0A3D27]/85 border border-[#FAF7F2]/20 shadow-2xs">
                    Quality Ingredients
                  </span>
                  <span className="mx-3 sm:mx-4.5 inline-flex items-center text-[#E8AA42]">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#E8AA42] rounded-[1px] shadow-2xs" />
                  </span>
                </span>
              ))}
            </div>
            {/* Track B (Duplicate for seamless loop) */}
            <div className="flex shrink-0 items-center text-xs sm:text-[13px] font-medium tracking-wider uppercase font-sans" aria-hidden="true">
              {[...Array(3)].map((_, i) => (
                <span key={`strip1-b-${i}`} className="inline-flex items-center">
                  <span className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#0A3D27]/85 border border-[#FAF7F2]/20 shadow-2xs">
                    Yum Nest – One Nest, Endless Flavors
                  </span>
                  <span className="mx-3 sm:mx-4.5 inline-flex items-center text-[#E8AA42]">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#E8AA42] rounded-[1px] shadow-2xs" />
                  </span>

                  <span className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#0A3D27]/85 border border-[#FAF7F2]/20 shadow-2xs">
                    Premium Masala Blends
                  </span>
                  <span className="mx-3 sm:mx-4.5 inline-flex items-center text-[#E8AA42]">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#E8AA42] rounded-[1px] shadow-2xs" />
                  </span>

                  <span className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#0A3D27]/85 border border-[#FAF7F2]/20 shadow-2xs">
                    Authentic Taste in Every Bite
                  </span>
                  <span className="mx-3 sm:mx-4.5 inline-flex items-center text-[#E8AA42]">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#E8AA42] rounded-[1px] shadow-2xs" />
                  </span>

                  <span className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#0A3D27]/85 border border-[#FAF7F2]/20 shadow-2xs">
                    Quality Ingredients
                  </span>
                  <span className="mx-3 sm:mx-4.5 inline-flex items-center text-[#E8AA42]">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#E8AA42] rounded-[1px] shadow-2xs" />
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Strip 2: Golden-yellow background with dark charcoal text (Left to Right) */}
        <div className="w-full bg-[#E8AA42] text-[#1C1917] py-2 sm:py-2.5 overflow-hidden">
          <div className="animate-marquee-ltr flex items-center whitespace-nowrap">
            {/* Track A */}
            <div className="flex shrink-0 items-center text-xs sm:text-[13px] font-semibold tracking-wider uppercase font-sans">
              {[...Array(3)].map((_, i) => (
                <span key={`strip2-a-${i}`} className="inline-flex items-center">
                  <span className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#D99A30]/45 border border-[#1C1917]/20 shadow-2xs">
                    Broast Masala
                  </span>
                  <span className="mx-3 sm:mx-4.5 inline-flex items-center text-[#0F5638]">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#0F5638] rounded-[1px] shadow-2xs" />
                  </span>

                  <span className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#D99A30]/45 border border-[#1C1917]/20 shadow-2xs">
                    Alfaham Masala
                  </span>
                  <span className="mx-3 sm:mx-4.5 inline-flex items-center text-[#0F5638]">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#0F5638] rounded-[1px] shadow-2xs" />
                  </span>

                  <span className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#D99A30]/45 border border-[#1C1917]/20 shadow-2xs">
                    Shawaya Masala
                  </span>
                  <span className="mx-3 sm:mx-4.5 inline-flex items-center text-[#0F5638]">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#0F5638] rounded-[1px] shadow-2xs" />
                  </span>

                  <span className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#D99A30]/45 border border-[#1C1917]/20 shadow-2xs">
                    Prawns Masala
                  </span>
                  <span className="mx-3 sm:mx-4.5 inline-flex items-center text-[#0F5638]">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#0F5638] rounded-[1px] shadow-2xs" />
                  </span>

                  <span className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#D99A30]/45 border border-[#1C1917]/20 shadow-2xs">
                    Chicken Tikka Masala
                  </span>
                  <span className="mx-3 sm:mx-4.5 inline-flex items-center text-[#0F5638]">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#0F5638] rounded-[1px] shadow-2xs" />
                  </span>

                  <span className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#D99A30]/45 border border-[#1C1917]/20 shadow-2xs">
                    Pure Spices, Perfect Flavours
                  </span>
                  <span className="mx-3 sm:mx-4.5 inline-flex items-center text-[#0F5638]">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#0F5638] rounded-[1px] shadow-2xs" />
                  </span>
                </span>
              ))}
            </div>
            {/* Track B (Duplicate for seamless loop) */}
            <div className="flex shrink-0 items-center text-xs sm:text-[13px] font-semibold tracking-wider uppercase font-sans" aria-hidden="true">
              {[...Array(3)].map((_, i) => (
                <span key={`strip2-b-${i}`} className="inline-flex items-center">
                  <span className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#D99A30]/45 border border-[#1C1917]/20 shadow-2xs">
                    Broast Masala
                  </span>
                  <span className="mx-3 sm:mx-4.5 inline-flex items-center text-[#0F5638]">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#0F5638] rounded-[1px] shadow-2xs" />
                  </span>

                  <span className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#D99A30]/45 border border-[#1C1917]/20 shadow-2xs">
                    Alfaham Masala
                  </span>
                  <span className="mx-3 sm:mx-4.5 inline-flex items-center text-[#0F5638]">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#0F5638] rounded-[1px] shadow-2xs" />
                  </span>

                  <span className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#D99A30]/45 border border-[#1C1917]/20 shadow-2xs">
                    Shawaya Masala
                  </span>
                  <span className="mx-3 sm:mx-4.5 inline-flex items-center text-[#0F5638]">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#0F5638] rounded-[1px] shadow-2xs" />
                  </span>

                  <span className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#D99A30]/45 border border-[#1C1917]/20 shadow-2xs">
                    Prawns Masala
                  </span>
                  <span className="mx-3 sm:mx-4.5 inline-flex items-center text-[#0F5638]">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#0F5638] rounded-[1px] shadow-2xs" />
                  </span>

                  <span className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#D99A30]/45 border border-[#1C1917]/20 shadow-2xs">
                    Chicken Tikka Masala
                  </span>
                  <span className="mx-3 sm:mx-4.5 inline-flex items-center text-[#0F5638]">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#0F5638] rounded-[1px] shadow-2xs" />
                  </span>

                  <span className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#D99A30]/45 border border-[#1C1917]/20 shadow-2xs">
                    Pure Spices, Perfect Flavours
                  </span>
                  <span className="mx-3 sm:mx-4.5 inline-flex items-center text-[#0F5638]">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#0F5638] rounded-[1px] shadow-2xs" />
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
