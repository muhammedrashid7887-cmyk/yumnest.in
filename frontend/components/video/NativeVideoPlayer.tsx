'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface NativeVideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  title?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  className?: string;
  aspectRatio?: '16/9' | '9/16' | 'auto';
}

export const NativeVideoPlayer: React.FC<NativeVideoPlayerProps> = ({
  videoUrl,
  posterUrl,
  title = 'Yum Nest Video',
  autoPlay = false,
  onEnded,
  className = '',
  aspectRatio = '16/9',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(autoPlay);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!hasStartedPlaying) {
      setHasStartedPlaying(true);
    }

    if (video.paused || video.ended) {
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasError(false);
        })
        .catch((err) => {
          // If browser blocked autoplay with sound, retry muted
          if (err.name === 'NotAllowedError') {
            video.muted = true;
            setIsMuted(true);
            video.play().then(() => setIsPlaying(true)).catch(() => {});
          } else {
            setHasError(true);
            setErrorMessage('Unable to play video.');
          }
        });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [hasStartedPlaying]);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (!video.muted && volume === 0) {
      setVolume(0.5);
      video.volume = 0.5;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;
    video.volume = val;
    setVolume(val);
    if (val === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  // Clean unmount to prevent background audio / video leaks
  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (video) {
        video.pause();
        video.src = '';
        video.load();
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative group bg-black overflow-hidden select-none flex items-center justify-center ${
        aspectRatio === '16/9'
          ? 'aspect-video'
          : aspectRatio === '9/16'
          ? 'aspect-[9/16] max-h-[80vh]'
          : 'w-full'
      } ${className}`}
    >
      {/* HTML5 Native Video Element */}
      {hasStartedPlaying ? (
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          preload="metadata"
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
              setHasError(false);
            }
          }}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => {
            setIsBuffering(false);
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setShowControls(true);
            if (onEnded) onEnded();
          }}
          onError={() => {
            setIsBuffering(false);
            setHasError(true);
            setErrorMessage('Unable to load video. Please check your internet connection.');
          }}
        />
      ) : (
        /* Poster First Rendering: Zero video bytes downloaded until clicked */
        <div
          className="relative w-full h-full cursor-pointer group"
          onClick={togglePlay}
          role="button"
          tabIndex={0}
          aria-label={`Play video: ${title}`}
        >
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-102"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
              priority={autoPlay}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-stone-900 to-stone-800" />
          )}

          {/* YouTube-like Centered Play Button Overlay */}
          <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0F5638]/90 group-hover:bg-[#E11D48] text-white flex items-center justify-center shadow-2xl transition-all duration-300 transform group-hover:scale-110">
              <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white translate-x-0.5" />
            </div>
          </div>
        </div>
      )}

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/30 z-20">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      )}

      {/* Error Overlay with Retry */}
      {hasError && (
        <div className="absolute inset-0 bg-stone-950/90 flex flex-col items-center justify-center p-6 text-center text-white z-30 space-y-3">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-sm font-semibold max-w-sm">{errorMessage}</p>
          <button
            type="button"
            onClick={() => {
              setHasError(false);
              const v = videoRef.current;
              if (v) {
                v.load();
                v.play().catch(() => {});
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#0F5638] text-white text-xs font-bold hover:bg-[#15734B] transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Playback</span>
          </button>
        </div>
      )}

      {/* Custom Clean Player Controls Bar */}
      {hasStartedPlaying && (
        <div
          className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4 z-20 transition-opacity duration-300 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Timeline Scrubber */}
          <div className="relative w-full group/scrub mb-2 sm:mb-3">
            <div className="w-full h-1.5 group-hover/scrub:h-2.5 bg-white/20 rounded-full cursor-pointer relative overflow-hidden transition-all">
              <div
                className="h-full bg-[#0F5638] group-hover/scrub:bg-[#E11D48] transition-all rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Seek video position"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between text-white text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="p-1 hover:text-[#E8AA42] transition cursor-pointer"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              {/* Volume & Mute */}
              <div className="flex items-center gap-1.5 group/vol">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                  className="p-1 hover:text-[#E8AA42] transition cursor-pointer"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-red-400" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Volume slider"
                  className="w-14 sm:w-20 h-1 accent-[#0F5638] opacity-70 group-hover/vol:opacity-100 transition cursor-pointer"
                />
              </div>

              {/* Time indicator: Current / Duration */}
              <div className="text-[11px] sm:text-xs font-mono text-stone-300">
                <span>{formatTime(currentTime)}</span>
                <span className="mx-1 text-stone-500">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls: Title & Fullscreen */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-300 truncate max-w-[180px] hidden md:inline">
                {title}
              </span>

              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                className="p-1 hover:text-[#E8AA42] transition cursor-pointer"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
