'use client';

import React, { useEffect } from 'react';

/**
 * ScrollReveal component that observes all [data-reveal] and .reveal-on-scroll
 * elements across the page and adds .is-revealed when they scroll into the viewport.
 * Fully supports reduced-motion accessibility.
 */
export const ScrollReveal: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let observer: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let timerId: number | undefined;

    const init = () => {
      // Check prefers-reduced-motion
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        document.querySelectorAll('.reveal-on-scroll, [data-reveal]').forEach((el) => {
          el.classList.add('is-revealed');
        });
        return;
      }

      if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.reveal-on-scroll, [data-reveal]').forEach((el) => {
          el.classList.add('is-revealed');
        });
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              observer?.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.08,
          rootMargin: '0px 0px -30px 0px',
        }
      );

      const observeElements = () => {
        document.querySelectorAll('.reveal-on-scroll:not(.is-revealed), [data-reveal]:not(.is-revealed)').forEach((el) => {
          observer?.observe(el);
        });
      };

      observeElements();

      // Re-check for dynamically rendered items after initial load
      mutationObserver = new MutationObserver(() => {
        observeElements();
      });

      mutationObserver.observe(document.body, { childList: true, subtree: true });
    };

    // Defer initialization to after initial React hydration completes
    timerId = window.setTimeout(init, 50);

    return () => {
      if (timerId) clearTimeout(timerId);
      observer?.disconnect();
      mutationObserver?.disconnect();
    };
  }, []);

  return null;
};
