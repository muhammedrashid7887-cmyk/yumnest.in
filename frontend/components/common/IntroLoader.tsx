'use client';

import { useEffect, useState } from 'react';

/* ─── types ─────────────────────────────────────────────── */
interface Particle {
  id: number;
  type: 'sparkle' | 'line' | 'dot';
  x: number;
  y: number;
  size: number;
  width?: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
}

/* ─── deterministic particle layout (safe for Next.js SSR & Prerender) ─── */
const STATIC_PARTICLES: Particle[] = [
  // Sparkles
  { id: 0, type: 'sparkle', x: 12, y: 18, size: 12, color: '#E8AA42', delay: 0.2, duration: 2.2, rotation: 15 },
  { id: 1, type: 'sparkle', x: 82, y: 24, size: 14, color: '#C87A14', delay: 0.6, duration: 2.6, rotation: 30 },
  { id: 2, type: 'sparkle', x: 22, y: 72, size: 10, color: '#0F5638', delay: 0.9, duration: 2.0, rotation: 25 },
  { id: 3, type: 'sparkle', x: 74, y: 78, size: 13, color: '#D4881E', delay: 0.4, duration: 2.4, rotation: 10 },
  { id: 4, type: 'sparkle', x: 15, y: 48, size: 11, color: '#187A4F', delay: 1.1, duration: 2.5, rotation: 40 },
  { id: 5, type: 'sparkle', x: 88, y: 52, size: 15, color: '#E8AA42', delay: 0.7, duration: 2.1, rotation: 20 },
  { id: 6, type: 'sparkle', x: 34, y: 28, size: 10, color: '#C87A14', delay: 1.3, duration: 2.7, rotation: 35 },
  { id: 7, type: 'sparkle', x: 68, y: 22, size: 12, color: '#0F5638', delay: 0.5, duration: 2.3, rotation: 18 },
  { id: 8, type: 'sparkle', x: 28, y: 84, size: 14, color: '#D4881E', delay: 1.0, duration: 2.4, rotation: 28 },
  { id: 9, type: 'sparkle', x: 78, y: 86, size: 11, color: '#E8AA42', delay: 0.8, duration: 2.6, rotation: 12 },
  { id: 10, type: 'sparkle', x: 48, y: 14, size: 13, color: '#C87A14', delay: 1.4, duration: 2.2, rotation: 22 },
  { id: 11, type: 'sparkle', x: 52, y: 88, size: 12, color: '#187A4F', delay: 0.3, duration: 2.5, rotation: 32 },

  // Drifting Lines
  { id: 12, type: 'line', x: 16, y: 26, size: 1, width: 48, color: '#C87A14', delay: 0.4, duration: 2.8, rotation: -18 },
  { id: 13, type: 'line', x: 72, y: 32, size: 1, width: 56, color: '#E8AA42', delay: 0.8, duration: 3.2, rotation: 15 },
  { id: 14, type: 'line', x: 24, y: 64, size: 1, width: 52, color: '#0F5638', delay: 1.2, duration: 2.9, rotation: -22 },
  { id: 15, type: 'line', x: 66, y: 68, size: 1, width: 62, color: '#D4881E', delay: 0.5, duration: 3.4, rotation: 24 },
  { id: 16, type: 'line', x: 38, y: 76, size: 1, width: 44, color: '#187A4F', delay: 1.1, duration: 3.0, rotation: -12 },
  { id: 17, type: 'line', x: 80, y: 44, size: 1, width: 50, color: '#C87A14', delay: 0.7, duration: 2.7, rotation: 18 },

  // Shimmer Dots
  { id: 18, type: 'dot', x: 18, y: 38, size: 3, color: '#E8AA42', delay: 0.3, duration: 2.1, rotation: 0 },
  { id: 19, type: 'dot', x: 84, y: 34, size: 4, color: '#0F5638', delay: 0.9, duration: 2.4, rotation: 0 },
  { id: 20, type: 'dot', x: 26, y: 80, size: 3, color: '#C87A14', delay: 1.4, duration: 2.0, rotation: 0 },
  { id: 21, type: 'dot', x: 76, y: 62, size: 4, color: '#D4881E', delay: 0.6, duration: 2.5, rotation: 0 },
  { id: 22, type: 'dot', x: 42, y: 22, size: 3, color: '#187A4F', delay: 1.2, duration: 2.2, rotation: 0 },
  { id: 23, type: 'dot', x: 62, y: 82, size: 3.5, color: '#E8AA42', delay: 0.8, duration: 2.3, rotation: 0 },
];

/* ─── asset preloader: preloads video, images & APIs during the 4s window ─── */
function preloadPageAssets() {
  if (typeof window === 'undefined') return;

  // 1. Preload Hero Video into browser media cache
  try {
    const video = document.createElement('video');
    video.src = '/assets/yumnestvedio.mp4';
    video.preload = 'auto';
    video.muted = true;
    video.load();
  } catch {}

  // 2. Preload Key Visual Images (Gallery, Posters, Badges)
  const keyImages = [
    '/assets/banner1.jpeg',
    '/assets/whatsapp-icon.png',
    '/assets/yummnext-og-logo.png',
    '/assets/animation/IMG-20261104-WA0011.jpg',
    '/assets/animation/IMG-20261104-WA0017.jpg',
    '/assets/animation/IMG-20261104-WA0018.jpg',
    '/assets/animation/IMG-20261104-WA0024.jpg',
    '/assets/animation/IMG-20261104-WA0029.jpg',
    '/assets/animation/IMG-20261104-WA0034.jpg',
    '/assets/animation/IMG-20261104-WA0035.jpg',
    '/assets/animation/IMG-20261104-WA0027.jpg',
    '/assets/animation/IMG-20261104-WA0030.jpg',
    '/assets/animation/IMG-20261104-WA0019.jpg',
    '/assets/animation/IMG-20261104-WA0013.jpg',
  ];

  keyImages.forEach((src) => {
    const img = new window.Image();
    img.src = src;
  });

  // 3. Pre-warm live API endpoints so cache is hot
  try {
    fetch('https://yumnest-in.onrender.com/api/products?limit=100', { mode: 'cors' }).catch(() => {});
    fetch('https://yumnest-in.onrender.com/api/categories', { mode: 'cors' }).catch(() => {});
  } catch {}
}

/* ─── component ─────────────────────────────────────────── */
type Phase = 'hidden' | 'visible' | 'exiting';

export function IntroLoader() {
  // CRITICAL: Initialize immediately to 'visible' on initial page open
  // This guarantees ZERO flash of underlying page content!
  const [phase, setPhase] = useState<Phase>(() => {
    if (typeof window !== 'undefined') {
      try {
        if (sessionStorage.getItem('yn_intro_completed') === 'true') {
          return 'hidden';
        }
      } catch {}
    }
    return 'visible';
  });

  const [progress, setProgress] = useState(0);

  // Prevent background scroll while loading screen is active
  useEffect(() => {
    if (phase === 'visible') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [phase]);

  useEffect(() => {
    // If intro was already shown once in this user session, never show it again
    try {
      if (sessionStorage.getItem('yn_intro_completed') === 'true') {
        setPhase('hidden');
        return;
      }
    } catch {}

    // Start background asset preloading immediately (video, gallery images, APIs)
    preloadPageAssets();

    let prog = 0;
    const bar = setInterval(() => {
      prog = Math.min(100, prog + 0.95 + Math.random() * 0.3);
      setProgress(prog);
      if (prog >= 100) clearInterval(bar);
    }, 40);

    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const exitTimer = setTimeout(() => {
      clearInterval(bar);
      setProgress(100);
      setPhase('exiting');

      // Mark intro as completed so subsequent navigations never reload
      try {
        sessionStorage.setItem('yn_intro_completed', 'true');
      } catch {}

      hideTimer = setTimeout(() => {
        setPhase('hidden');
      }, 750);
    }, 4000);

    return () => {
      clearInterval(bar);
      clearTimeout(exitTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  if (phase === 'hidden') return null;

  return (
    <>
      <style>{`
        @keyframes yn-sparkle {
          0%   { opacity:0; transform:translateY(16px) scale(.55) rotate(0deg); }
          25%  { opacity:.9; }
          75%  { opacity:.9; }
          100% { opacity:0; transform:translateY(-32px) scale(1.1) rotate(45deg); }
        }
        @keyframes yn-line {
          0%   { opacity:0; transform:translateX(-12px) rotate(var(--r)) scaleX(.6); }
          30%  { opacity:.75; transform:translateX(0) rotate(var(--r)) scaleX(1); }
          70%  { opacity:.75; }
          100% { opacity:0; transform:translateX(14px) rotate(var(--r)) scaleX(.6); }
        }
        @keyframes yn-dot {
          0%,100%{ opacity:.25; transform:scale(.75); }
          50%    { opacity:1;   transform:scale(1.25); }
        }
        @keyframes yn-ring {
          0%  { transform:scale(.87); opacity:.45; }
          50% { transform:scale(1.04); opacity:.18; }
          100%{ transform:scale(.87); opacity:.45; }
        }
        @keyframes yn-logo-pop {
          0%  { transform:scale(.72); opacity:0; }
          65% { transform:scale(1.04); opacity:1; }
          100%{ transform:scale(1); opacity:1; }
        }
        @keyframes yn-slide-up {
          0%  { transform:translateY(12px); opacity:0; }
          100%{ transform:translateY(0); opacity:1; }
        }
        @keyframes yn-shimmer {
          from{ background-position:-220% center; }
          to  { background-position: 220% center; }
        }
        @keyframes yn-bounce {
          0%,100%{ transform:translateY(0);   opacity:.38; }
          50%    { transform:translateY(-5px); opacity:1;   }
        }
        @keyframes yn-curtain {
          from{ transform:translateY(0);    opacity:1; }
          to  { transform:translateY(-100%); opacity:0.98; }
        }
      `}</style>

      {/* ── Full-screen cream overlay with highest z-index ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background:
            'radial-gradient(ellipse at 50% 42%, #FFFFFF 0%, #FBF9F5 52%, #F3EDE2 100%)',
          animation:
            phase === 'exiting'
              ? 'yn-curtain .75s cubic-bezier(.76,0,.24,1) forwards'
              : 'none',
        }}
      >
        {/* ── Ambient centre glow ── */}
        <div
          style={{
            position: 'absolute',
            width: 480,
            height: 480,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(232,170,66,.18) 0%, rgba(15,86,56,.07) 50%, transparent 70%)',
            animation: 'yn-ring 2.9s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* ── Orbital rings ── */}
        {[240, 320].map((size, i) => (
          <div
            key={size}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: '50%',
              border: i === 0
                ? '1px solid rgba(15,86,56,.11)'
                : '1px dashed rgba(232,170,66,.2)',
              animation: `yn-ring ${3.2 + i * 0.8}s ease-in-out ${i * 0.6}s infinite`,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* ── Particles ── */}
        {STATIC_PARTICLES.map((p) => {
          if (p.type === 'sparkle') return (
            <span
              key={p.id}
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                color: p.color,
                opacity: 0,
                animation: `yn-sparkle ${p.duration}s ease-in-out ${p.delay}s infinite`,
                pointerEvents: 'none',
                filter: 'drop-shadow(0 1px 4px rgba(200,122,20,.3))',
              }}
            >
              <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
                <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8Z" />
              </svg>
            </span>
          );

          if (p.type === 'line') return (
            <span
              key={p.id}
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.width,
                height: 1,
                background: `linear-gradient(90deg,transparent,${p.color},transparent)`,
                opacity: 0,
                '--r': `${p.rotation}deg`,
                animation: `yn-line ${p.duration}s ease-in-out ${p.delay}s infinite`,
                pointerEvents: 'none',
                filter: 'drop-shadow(0 1px 3px rgba(15,86,56,.18))',
              } as React.CSSProperties}
            />
          );

          return (
            <span
              key={p.id}
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                background: p.color,
                boxShadow: `0 0 6px ${p.color}80`,
                animation: `yn-dot ${p.duration}s ease-in-out ${p.delay}s infinite`,
                pointerEvents: 'none',
              }}
            />
          );
        })}

        {/* ── Brand centre block ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {/* Logo - renders immediately from frame 0 and pops in smoothly */}
          <div
            style={{
              animation: 'yn-logo-pop .65s cubic-bezier(.16,1,.3,1) both',
              filter: 'drop-shadow(0 6px 20px rgba(15,86,56,.14))',
            }}
          >
            <img
              src="/assets/yummnext-og-logo.png"
              alt="Yumnest"
              width={165}
              height={165}
              style={{ width: 165, height: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </div>

          {/* Tagline */}
          <div
            style={{
              animation: 'yn-slide-up .5s ease .35s both',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: 11,
                letterSpacing: '0.28em',
                fontWeight: 700,
                textTransform: 'uppercase',
                fontFamily: 'var(--font-manrope,sans-serif)',
                background:
                  'linear-gradient(90deg,#0F5638 0%,#C87A14 50%,#0F5638 100%)',
                backgroundSize: '220% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'yn-shimmer 2.6s linear infinite',
                margin: 0,
              }}
            >
              Pure Spices · Authentic Flavours
            </p>
          </div>

          {/* Bouncing dots */}
          <div
            style={{
              display: 'flex',
              gap: 7,
              animation: 'yn-slide-up .4s ease .5s both',
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: i === 1 ? '#E8AA42' : '#0F5638',
                  boxShadow: '0 0 5px rgba(15,86,56,.28)',
                  animation: `yn-bounce .85s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div
          style={{
            position: 'absolute',
            bottom: 44,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(240px,68vw)',
            zIndex: 2,
          }}
        >
          <div
            style={{
              height: 3,
              background: 'rgba(15,86,56,.09)',
              borderRadius: 99,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg,#0F5638,#E8AA42)',
                borderRadius: 99,
                transition: 'width .1s ease',
                boxShadow: '0 0 8px rgba(232,170,66,.35)',
              }}
            />
          </div>
          <p
            style={{
              color: '#9A9188',
              fontSize: 10,
              letterSpacing: '0.22em',
              fontWeight: 600,
              textAlign: 'center',
              marginTop: 10,
              fontFamily: 'var(--font-manrope,sans-serif)',
              textTransform: 'uppercase',
            }}
          >
            Loading…
          </p>
        </div>

        {/* ── Top + bottom brand accent lines ── */}
        {['top', 'bottom'].map((side) => (
          <div
            key={side}
            style={{
              position: 'absolute',
              [side]: 0,
              left: 0,
              right: 0,
              height: 2,
              background:
                'linear-gradient(90deg,transparent 0%,#0F5638 28%,#E8AA42 50%,#0F5638 72%,transparent 100%)',
              opacity: 0.32,
            }}
          />
        ))}
      </div>
    </>
  );
}
