'use client';

import React, { useState } from 'react';
import { Play, Video } from 'lucide-react';
import { Recipe } from '@/types';

interface HomeRecipesPreviewProps {
  recipes?: Recipe[];
}

interface VideoItem {
  id: string;
  titleMalayalam: string;
  titleEnglish: string;
  duration: string;
  category: string;
  youtubeId: string;
  thumbnailUrl: string;
}

const COOKING_VIDEOS: VideoItem[] = [
  {
    id: 'broast-chicken',
    titleMalayalam: 'റെസ്റ്റോറന്റ് സ്റ്റൈൽ ക്രിസ്പി ബ്രോസ്റ്റഡ് ചിക്കൻ എളുപ്പത്തിൽ ഉണ്ടാക്കാം',
    titleEnglish: 'Restaurant-Style Crispy Broasted Chicken | Yumnest Broast Masala',
    duration: '12:45',
    category: 'Broast Special',
    youtubeId: 'bXvN_v8vXwE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'alfaham-chicken',
    titleMalayalam: 'സ്പെഷ്യൽ അൽഫാഹം ചിക്കൻ റെസിപ്പി - പെർഫെക്റ്റ് ഗ്രിൽഡ് ഫ്ലേവർ',
    titleEnglish: 'Signature Alfaham Chicken Masala Preparation & Grilling Guide',
    duration: '15:20',
    category: 'Signature Rubs',
    youtubeId: 'kJQP7kiw5Fk',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'thalassery-biryani',
    titleMalayalam: 'ഒറിജിനൽ തലശ്ശേരി ദം ബിരിയാണി ഉണ്ടാക്കുന്ന വിധം',
    titleEnglish: 'Authentic Thalassery Dum Biryani with Heritage Spices',
    duration: '18:10',
    category: 'Heritage Recipes',
    youtubeId: 'X48VuDVv0do',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'tawa-fish-fry',
    titleMalayalam: 'നാടൻ നെയ്മീൻ തവ ഫ്രൈ സ്പെഷ്യൽ മസാല കൂട്ട്',
    titleEnglish: 'Coastal King Fish Tawa Fry with Roasted Spices',
    duration: '09:30',
    category: 'Seafood Specials',
    youtubeId: 'LXb3EKWsInQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
  },
];

export const HomeRecipesPreview: React.FC<HomeRecipesPreviewProps> = () => {
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  return (
    <section id="recipes" className="py-8 sm:py-20 lg:py-24 bg-[#FBF9F5] border-t border-[#E8DFC8]/70 relative overflow-hidden">
      
      {/* Subtle Background Decorative Accent */}
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-[#E8AA42]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-32 w-80 h-80 bg-[#12372A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8AA42]/15 text-[#9E7326] text-xs font-bold uppercase tracking-wider">
            <Video className="w-3.5 h-3.5 text-[#E8AA42]" />
            <span>Cooking Videos & Vlogs</span>
          </div>

          <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#12372A] tracking-tight">
            പാചക വിഡിയോകൾ & പാചകക്കുറിപ്പുകൾ
          </h2>
          
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            ഞങ്ങളുടെ സ്പെഷ്യൽ മസാലക്കൂട്ടുകൾ ഉപയോഗിച്ച് സ്വാദിഷ്ടമായ നാടൻ വിഭവങ്ങൾ തയ്യാറാക്കുന്ന വിധം കണ്ടുനോക്കൂ.
          </p>
        </div>

        {/* 2-Column Grid on Desktop / 1-Column on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          {COOKING_VIDEOS.map((video) => {
            const isPlaying = playingVideoId === video.id;

            return (
              <div
                key={video.id}
                className="group flex flex-col bg-white rounded-2xl border border-[#E8DFC8] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
              >
                
                {/* 16:9 Aspect Ratio Video Thumbnail / Player */}
                <div className="relative aspect-video w-full bg-stone-900 overflow-hidden">
                  {isPlaying ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
                      title={video.titleMalayalam}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPlayingVideoId(video.id)}
                      className="relative w-full h-full block focus:outline-none cursor-pointer group"
                      aria-label={`Play ${video.titleMalayalam}`}
                    >
                      {/* Video Thumbnail Image */}
                      <img
                        src={video.thumbnailUrl}
                        alt={video.titleMalayalam}
                        loading="lazy"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Dark Gradient Overlay for Contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                      {/* Category Badge */}
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#12372A]/90 text-[#E8AA42] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-xs backdrop-blur-xs">
                        {video.category}
                      </span>

                      {/* Duration Badge */}
                      <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/80 text-white text-[11px] font-semibold tracking-wide">
                        {video.duration}
                      </span>

                      {/* Prominent YouTube Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600 group-hover:bg-red-700 text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-200">
                          <Play className="w-6 h-6 fill-current ml-1" />
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                {/* Video Info Section */}
                <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-1.5 text-left bg-white">
                  {/* Malayalam Title */}
                  <h3 className="font-bold text-sm sm:text-base text-stone-900 group-hover:text-[#12372A] transition-colors leading-snug">
                    {video.titleMalayalam}
                  </h3>

                  {/* English Subtitle */}
                  <p className="text-xs text-stone-500 font-medium leading-relaxed">
                    {video.titleEnglish}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
