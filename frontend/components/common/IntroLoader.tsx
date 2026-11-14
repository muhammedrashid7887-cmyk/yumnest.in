'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/* ─── lightweight asset preloader: only preloads critical lightweight LCP assets ─── */
function preloadCriticalAssets() {
  if (typeof window === 'undefined') return;

  // Next.js handles LCP hero image preload natively via <Image preload>
  const critical = ['/assets/yummnext-og-logo.png'];
  critical.forEach((src) => {
    const img = new window.Image();
    img.src = src;
  });
}

/* ─── component ─────────────────────────────────────────── */
type Phase = 'hidden' | 'visible' | 'exiting';

export function IntroLoader() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  // Skip loader completely for admin dashboard to ensure instant admin UX
  const [phase, setPhase] = useState<Phase>(isAdmin ? 'hidden' : 'visible');
  const [progress, setProgress] = useState(0);

  // Prevent background scroll while loading screen is active on storefront
  useEffect(() => {
    if (isAdmin) return;
    if (phase === 'visible') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [phase, isAdmin]);

  useEffect(() => {
    if (isAdmin) return;

    // If intro was already shown once in this user session, never show it again
    try {
      if (sessionStorage.getItem('yn_intro_completed') === 'true') {
        setPhase('hidden');
        return;
      }
    } catch {}

    // Preload only lightweight critical brand assets
    preloadCriticalAssets();

    let prog = 0;
    const bar = setInterval(() => {
      prog = Math.min(100, prog + 3.2 + Math.random() * 1.5);
      setProgress(prog);
      if (prog >= 100) clearInterval(bar);
    }, 30);

    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const exitTimer = setTimeout(() => {
      clearInterval(bar);
      setProgress(100);
      setPhase('exiting');

      try {
        sessionStorage.setItem('yn_intro_completed', 'true');
      } catch {}

      hideTimer = setTimeout(() => {
        try {
          sessionStorage.setItem('yn_intro_completed', 'true');
        } catch {}
        try {
          document.documentElement.classList.add('yn-intro-done');
        } catch {}
        setPhase('hidden');
      }, 400);
    }, 1100);

    return () => {
      clearInterval(bar);
      clearTimeout(exitTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isAdmin]);

  if (phase === 'hidden' || isAdmin) return null;

  return (
    <>
      <style>{`
        @keyframes yn-logo-pop {
          0%  { transform:scale(.78); opacity:0; }
          65% { transform:scale(1.03); opacity:1; }
          100%{ transform:scale(1); opacity:1; }
        }
        @keyframes yn-slide-up {
          0%  { transform:translateY(10px); opacity:0; }
          100%{ transform:translateY(0); opacity:1; }
        }
        @keyframes yn-curtain {
          from{ transform:translateY(0); opacity:1; }
          to  { transform:translateY(-100%); opacity:0.98; }
        }
        html.yn-intro-done #yn-intro-loader {
          display: none !important;
        }
      `}</style>

      {/* ── Full-screen maroon overlay with highest z-index ── */}
      <div
        id="yn-intro-loader"
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
          backgroundColor: '#650016',
          backgroundImage:
            'radial-gradient(ellipse at 50% 48%, #7A001B 0%, #650016 55%, #3E000D 100%)',
          animation:
            phase === 'exiting'
              ? 'yn-curtain .6s cubic-bezier(.76,0,.24,1) forwards'
              : 'none',
        }}
      >
        {/* ── Brand centre block ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            padding: '0 20px',
          }}
        >
          {/* Logo */}
          <div
            style={{
              animation: 'yn-logo-pop .65s cubic-bezier(.16,1,.3,1) both',
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,.35))',
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
              animation: 'yn-slide-up .5s ease .25s both',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: 11,
                letterSpacing: '0.28em',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontFamily: 'var(--font-manrope,sans-serif)',
                color: '#FFF5E8',
                margin: 0,
              }}
            >
              Pure Spices · Authentic Flavours
            </p>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div
          style={{
            position: 'absolute',
            bottom: '8vh',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(240px, 68vw)',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '100%',
              height: 3,
              background: 'rgba(255, 255, 255, 0.22)',
              borderRadius: 99,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: '#FFFFFF',
                borderRadius: 99,
                transition: 'width .1s ease',
              }}
            />
          </div>
          <p
            style={{
              color: '#FFF5E8',
              opacity: 0.85,
              fontSize: 10,
              letterSpacing: '0.24em',
              fontWeight: 600,
              textAlign: 'center',
              marginTop: 10,
              fontFamily: 'var(--font-manrope,sans-serif)',
              textTransform: 'uppercase',
            }}
          >
            LOADING...
          </p>
        </div>
      </div>
    </>
  );
}
