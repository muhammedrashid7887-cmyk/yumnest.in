'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

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

/* ─── particle factory (run only client-side) ───────────── */
function generateParticles(): Particle[] {
  const colors = ['#C87A14', '#E8AA42', '#0F5638', '#D4881E', '#187A4F'];
  const items: Particle[] = [];

  for (let i = 0; i < 10; i++) {
    items.push({
      id: i,
      type: 'sparkle',
      x: 8 + Math.random() * 84,
      y: 10 + Math.random() * 80,
      size: 9 + Math.random() * 7,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1.1,
      duration: 1.4 + Math.random() * 1.2,
      rotation: Math.random() * 45,
    });
  }

  for (let i = 10; i < 16; i++) {
    items.push({
      id: i,
      type: 'line',
      x: 8 + Math.random() * 80,
      y: 15 + Math.random() * 65,
      size: 1,
      width: 32 + Math.random() * 50,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1.1,
      duration: 1.9 + Math.random() * 1.2,
      rotation: (Math.random() - 0.5) * 60,
    });
  }

  for (let i = 16; i < 22; i++) {
    items.push({
      id: i,
      type: 'dot',
      x: 10 + Math.random() * 80,
      y: 15 + Math.random() * 70,
      size: 2.5 + Math.random() * 2.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1.5,
      duration: 1.8 + Math.random() * 1.0,
      rotation: 0,
    });
  }

  return items;
}

/* ─── component ─────────────────────────────────────────── */
type Phase = 'hidden' | 'visible' | 'exiting';

export function IntroLoader() {
  // Start hidden — never render on SSR or if already shown this session
  const [phase, setPhase] = useState<Phase>('hidden');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [logoIn, setLogoIn] = useState(false);
  const [tagIn, setTagIn] = useState(false);
  const [progress, setProgress] = useState(0);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // Show only once per browser session
    try {
      if (sessionStorage.getItem('yn_intro_done')) return;
      sessionStorage.setItem('yn_intro_done', '1');
    } catch {
      // sessionStorage blocked (private mode edge case) — still show it
    }

    setParticles(generateParticles());
    setPhase('visible');

    const t1 = setTimeout(() => setLogoIn(true), 250);
    const t2 = setTimeout(() => setTagIn(true), 650);

    let prog = 0;
    const bar = setInterval(() => {
      prog = Math.min(100, prog + 3 + Math.random() * 4);
      setProgress(prog);
      if (prog >= 100) clearInterval(bar);
    }, 42);

    const exit = setTimeout(() => {
      clearInterval(bar);
      setProgress(100);
      setPhase('exiting');
      setTimeout(() => setPhase('hidden'), 650);
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(exit);
      clearInterval(bar);
    };
  }, []);

  // Don't render anything until the effect decides to show it
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
          0%  { transform:scale(.68); opacity:0; filter:blur(5px); }
          65% { transform:scale(1.04); opacity:1; filter:blur(0); }
          100%{ transform:scale(1);   opacity:1; filter:blur(0); }
        }
        @keyframes yn-slide-up {
          from{ transform:translateY(13px); opacity:0; }
          to  { transform:translateY(0);    opacity:1; }
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
          to  { transform:translateY(-100%); opacity:.92; }
        }
      `}</style>

      {/* ── Full-screen cream overlay ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background:
            'radial-gradient(ellipse at 50% 42%, #FFFFFF 0%, #FBF9F5 52%, #F3EDE2 100%)',
          animation:
            phase === 'exiting'
              ? 'yn-curtain .65s cubic-bezier(.76,0,.24,1) forwards'
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
        {particles.map((p) => {
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
            gap: 18,
          }}
        >
          {/* Logo */}
          <div
            style={{
              opacity: logoIn ? 1 : 0,
              animation: logoIn
                ? 'yn-logo-pop .72s cubic-bezier(.16,1,.3,1) forwards'
                : 'none',
              filter: 'drop-shadow(0 6px 20px rgba(15,86,56,.13))',
            }}
          >
            <Image
              src="/assets/yummnext-og-logo.png"
              alt="Yumnest"
              width={160}
              height={64}
              priority
              style={{ width: 160, height: 'auto', objectFit: 'contain' }}
            />
          </div>

          {/* Tagline */}
          <div
            style={{
              opacity: tagIn ? 1 : 0,
              animation: tagIn ? 'yn-slide-up .5s ease forwards' : 'none',
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
              opacity: tagIn ? 1 : 0,
              transition: 'opacity .4s ease .15s',
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
