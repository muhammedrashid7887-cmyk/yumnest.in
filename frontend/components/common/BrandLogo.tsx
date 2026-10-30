import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  isLight?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '' }) => {
  return (
    <Link
      href="/"
      className={`inline-flex items-center select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#12372A] ${className}`}
      aria-label="Yumnest Home"
    >
      <Image
        src="/assets/yummnext-og-logo.png"
        alt="Yumnest Logo"
        width={120}
        height={48}
        className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
        priority
      />
    </Link>
  );
};
