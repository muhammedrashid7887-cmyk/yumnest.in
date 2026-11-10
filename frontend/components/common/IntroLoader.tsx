'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

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

function generateParticles(): Particle[] {
  // Rich culinary gold, warm amber, and deep emerald accents for Light Theme
  const colors = ['#C87A14', '#E8AA42', '#0F5638', '#D4881E', '#187A4F'];
  const items: Particle[] = [];

  // 12 Small 4-point Sparkles
  for (let i = 0; i < 12; i++) {
    items.push({
      id: i,
      type: 'sparkle',
      x: 8 + Math.random() * 84,
      y: 10 + Math.random() * 80,
      size: 9 + Math.random() * 8, // 9px to 17px
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1.2,
      duration: 1.5 + Math.random() * 1.2,
      rotation: Math.random() * 45,
    });
  }

  // 6 Glowing Light Dots
  for (let i = 12; i < 18; i++) {
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

  // 6 Delicate Thin Lines
  for (let i = 18; i < 24; i++) {
    items.push({
      id: i,
      type: 'line',
      x: 8 + Math.random() * 80,
      y: 18 + Math.random() * 64,
      size: 1,
      width: 35 + Math.random() * 45, // 35px to 80px long
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1.2,
      duration: 2.0 + Math.random() * 1.2,
      rotation: (Math.random() - 0.5) * 60,
    });
  }

  return items;
}

export function IntroLoader() {
  const [phase, setPhase] = useState<'idle' | 'animating' | 'exiting' | 'done'>('idle');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [logoVisible, setLogoVisible] = useState(false);
  const [taglineVisible, setTaglineVisible] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const hasShown = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasShown.current) return;
    hasShown.current = true;

    // Generate standard small sparkles and lines client-side only
    setParticles(generateParticles());

    // Start animation
    setPhase('animating');

    // Logo pops in gently
    const t1 = setTimeout(() => setLogoVisible(true), 280);

    // Tagline slides up
    const t2 = setTimeout(() => setTaglineVisible(true), 680);

    // Progress bar fills smoothly
    let prog = 0;
    const progInterval = setInterval(() => {
      prog += 3 + Math.random() * 4;
      if (prog >= 100) {
        prog = 100;
        clearInterval(progInterval);
      }
      setProgressWidth(prog);
    }, 45);

    // Exit transition smoothly after ~2.1 seconds
    const exitTimer = setTimeout(() => {
      clearInterval(progInterval);
      setProgressWidth(100);
      setPhase('exiting');
      setTimeout(() => {
        setPhase('done');
      }, 650);
    }, 2100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(exitTimer);
      clearInterval(progInterval);
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <>
      <style>{`
        @keyframes yn-sparkle-float {
          0%   { opacity: 0; transform: translateY(18px) scale(0.6) rotate(0deg); }
          30%  { opacity: 0.95; }
          70%  { opacity: 0.95; }
          100% { opacity: 0; transform: translateY(-35px) scale(1.1) rotate(45deg); }
        }
        @keyframes yn-line-drift {
          0%   { opacity: 0; transform: translateX(-15px) rotate(var(--rot)) scaleX(0.7); }
          35%  { opacity: 0.8; transform: translateX(0px) rotate(var(--rot)) scaleX(1); }
          75%  { opacity: 0.8; }
          100% { opacity: 0; transform: translateX(15px) rotate(var(--rot)) scaleX(0.7); }
        }
        @keyframes yn-dot-shimmer {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%      { opacity: 1; transform: scale(1.2); }
        }
        @keyframes yn-pulse-ring {
          0%   { transform: scale(0.88); opacity: 0.5; }
          50%  { transform: scale(1.05); opacity: 0.2; }
          100% { transform: scale(0.88); opacity: 0.5; }
        }
        @keyframes yn-logo-pop {
          0%   { transform: scale(0.7); opacity: 0; filter: blur(4px); }
          70%  { transform: scale(1.03); opacity: 1; filter: blur(0px); }
          100% { transform: scale(1); opacity: 1; filter: blur(0px); }
        }
        @keyframes yn-slide-up {
          0%   { transform: translateY(14px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes yn-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes yn-curtain-up {
          0%   { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-100%); opacity: 0.95; }
        }
        @keyframes yn-dot-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50%      { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>

      {/* Overlay - Elegant Ivory Cream Canvas (Light Theme matching Yumnest Palette) */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          animation:
            phase === 'exiting'
              ? 'yn-curtain-up 0.65s cubic-bezier(0.76,0,0.24,1) forwards'
              : 'none',
          background: 'radial-gradient(circle at 50% 45%, #FFFFFF 0%, #FBF9F5 55%, #F3EDE2 100%)',
        }}
      >
        {/* Soft Radial Ambient Glow */}
        <div
          style={{
            position: 'absolute',
            width: '480px',
            height: '480px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232, 170, 66, 0.16) 0%, rgba(15, 86, 56, 0.06) 50%, transparent 70%)',
            animation: 'yn-pulse-ring 2.8s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Standard Small Sparkles, Lines & Shimmer Dots */}
        {particles.map((p) => {
          if (p.type === 'sparkle') {
            return (
              <span
                key={p.id}
                style={{
                  position: 'absolute',
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  color: p.color,
                  opacity: 0,
                  animation: `yn-sparkle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  filter: 'drop-shadow(0 1px 4px rgba(200, 122, 20, 0.28))',
                }}
              >
                {/* 4-Point Luxury Star / Sparkle */}
                <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
                  <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
                </svg>
              </span>
            );
          }

          if (p.type === 'line') {
            return (
              <span
                key={p.id}
                style={{
                  position: 'absolute',
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.width}px`,
                  height: '1px',
                  background: `linear-gradient(90deg, transparent, ${p.color}, transparent)`,
                  opacity: 0,
                  '--rot': `${p.rotation}deg`,
                  animation: `yn-line-drift ${p.duration}s ease-in-out ${p.delay}s infinite`,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  filter: 'drop-shadow(0 1px 3px rgba(15, 86, 56, 0.2))',
                } as React.CSSProperties}
              />
            );
          }

          // Dot
          return (
            <span
              key={p.id}
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                borderRadius: '50%',
                background: p.color,
                boxShadow: `0 0 5px ${p.color}`,
                animation: `yn-dot-shimmer ${p.duration}s ease-in-out ${p.delay}s infinite`,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
          );
        })}

        {/* Concentric Luxury Orbital Rings */}
        <div
          style={{
            position: 'absolute',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            border: '1px solid rgba(15, 86, 56, 0.12)',
            animation: 'yn-pulse-ring 3.2s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            border: '1px dashed rgba(232, 170, 66, 0.2)',
            animation: 'yn-pulse-ring 4s ease-in-out infinite 0.6s',
            pointerEvents: 'none',
          }}
        />

        {/* Center Brand Identity */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '18px',
          }}
        >
          {/* Logo */}
          <div
            style={{
              opacity: logoVisible ? 1 : 0,
              animation: logoVisible ? 'yn-logo-pop 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
              filter: 'drop-shadow(0 8px 24px rgba(15, 86, 56, 0.12))',
            }}
          >
            <Image
              src="/assets/yummnext-og-logo.png"
              alt="Yumnest"
              width={160}
              height={64}
              priority
              style={{ width: '160px', height: 'auto', objectFit: 'contain' }}
            />
          </div>

          {/* Shimmering Tagline */}
          <div
            style={{
              opacity: taglineVisible ? 1 : 0,
              animation: taglineVisible ? 'yn-slide-up 0.5s ease forwards' : 'none',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                color: '#0F5638',
                fontSize: '11px',
                letterSpacing: '0.28em',
                fontWeight: 700,
                textTransform: 'uppercase',
                fontFamily: 'var(--font-manrope, sans-serif)',
                background: 'linear-gradient(90deg, #0F5638 0%, #C87A14 50%, #0F5638 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'yn-shimmer 2.5s linear infinite',
              }}
            >
              Pure Spices · Authentic Flavours
            </p>
          </div>

          {/* Ambient Bouncing Dots */}
          <div
            style={{
              display: 'flex',
              gap: '7px',
              opacity: taglineVisible ? 1 : 0,
              transition: 'opacity 0.4s ease 0.15s',
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: i === 1 ? '#E8AA42' : '#0F5638',
                  boxShadow: '0 0 5px rgba(15, 86, 56, 0.3)',
                  animation: `yn-dot-bounce 0.85s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Minimalist Golden Progress Line */}
        <div
          style={{
            position: 'absolute',
            bottom: '44px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(240px, 68vw)',
            zIndex: 2,
          }}
        >
          <div
            style={{
              height: '3px',
              background: 'rgba(15, 86, 56, 0.08)',
              borderRadius: '99px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressWidth}%`,
                background: 'linear-gradient(90deg, #0F5638, #E8AA42)',
                borderRadius: '99px',
                transition: 'width 0.1s ease',
                boxShadow: '0 0 8px rgba(232, 170, 66, 0.4)',
              }}
            />
          </div>
          <p
            style={{
              color: '#8C827A',
              fontSize: '10px',
              letterSpacing: '0.22em',
              fontWeight: 600,
              textAlign: 'center',
              marginTop: '10px',
              fontFamily: 'var(--font-manrope, sans-serif)',
              textTransform: 'uppercase',
            }}
          >
            Loading…
          </p>
        </div>

        {/* Top & Bottom Accent Golden Fades */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, #0F5638 30%, #E8AA42 50%, #0F5638 70%, transparent 100%)',
            opacity: 0.35,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, #0F5638 30%, #E8AA42 50%, #0F5638 70%, transparent 100%)',
            opacity: 0.35,
          }}
        />
      </div>
    </>
  );
}
