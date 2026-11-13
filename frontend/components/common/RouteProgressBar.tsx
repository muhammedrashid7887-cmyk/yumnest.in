'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * RouteProgressBar provides instant visual feedback at the top of the screen
 * when navigating between Next.js App Router pages.
 * Zero external dependencies, pure CSS animation with brand styling.
 */
export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  // When pathname or searchParams change, complete and hide the progress bar
  useEffect(() => {
    setIsNavigating(false);
    setProgress(100);
    const timer = setTimeout(() => {
      setProgress(0);
    }, 250);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Listen to clicks on internal navigation links
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        target.getAttribute('target') === '_blank' ||
        e.defaultPrevented ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if it's the exact same URL
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl || href === window.location.pathname) {
        return;
      }

      setIsNavigating(true);
      setProgress(30);

      // Smooth step progress while page is loading
      const t1 = setTimeout(() => setProgress(65), 150);
      const t2 = setTimeout(() => setProgress(85), 450);

      const cleanup = () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };

      window.addEventListener('beforeunload', cleanup, { once: true });
    };

    document.addEventListener('click', handleLinkClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleLinkClick, { capture: true });
    };
  }, []);

  if (!isNavigating && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-1 pointer-events-none overflow-hidden bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#0F5638] via-[#1FA971] to-[#E8AA42] transition-all duration-300 ease-out shadow-[0_0_8px_rgba(31,169,113,0.8)]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
