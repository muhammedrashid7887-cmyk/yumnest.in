'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SITE_SETTINGS } from '@/data/mockData';

export const WhatsAppFloat: React.FC = () => {
  const [hovered, setHovered] = useState(false);
  const whatsappCleanNumber = SITE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${whatsappCleanNumber}?text=Hi%20Yumnest,%20I%20would%20like%20to%20order%20pure%20spices.`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3 group"
    >
      {/* Tooltip label */}
      <span
        className={`
          hidden sm:flex items-center px-3 py-1.5 rounded-full
          bg-[#12372A] text-white text-xs font-bold tracking-wide shadow-lg
          transition-all duration-300 whitespace-nowrap
          ${hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}
        `}
      >
        Order on WhatsApp
      </span>

      {/* Floating WhatsApp icon button */}
      <div className="relative">
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping" />

        {/* Icon */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-xl overflow-hidden transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
          <Image
            src="/assets/whatsapp-icon.png"
            alt="WhatsApp"
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
      </div>
    </a>
  );
};
