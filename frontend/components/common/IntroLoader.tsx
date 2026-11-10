'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

// Spice particle data — SVG paths / emoji equivalents rendered as CSS
const SPICES = ['🌶️', '🧄', '🫚', '✨', '🌿', '⭐', '🫙', '🌾'];

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  angle: number;
  distance: number;
  emoji: string;
  rotation: number;
}

function generateParticles(count: number): Particle[] {
  const colors = ['#E8AA42', '#C87A14', '#0F5638', '#187A4F', '#D4AF37', '#FFF8E7'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    size: 8 + Math.random() * 18,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 1.5,
    duration: 1.2 + Math.random() * 1.5,
    angle: Math.random() * 360,
    distance: 60 + Math.random() * 140,
    emoji: SPICES[Math.floor(Math.random() * SPICES.length)],
    rotation: Math.random() * 360,
  }));
}

export function IntroLoader() {
  const [phase, setPhase] = useState<'idle' | 'animating' | 'exiting' | 'done'>('idle');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [logoVisible, setLogoVisible] = useState(false);
  const [taglineVisible, setTaglineVisible] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const hasShown = useRef(false);

  useEffect(() => {
    // Only show once per session
    if (typeof window === 'undefined') return;
    const shown = sessionStorage.getItem('yumnest_intro_v2');
    if (shown) {
      setPhase('done');
      return;
    }
    if (hasShown.current) return;
    hasShown.current = true;

    // Generate particles client-side only
    setParticles(generateParticles(22));

    // Start animation
    setPhase('animating');

    // Logo pops in after 400ms
    const t1 = setTimeout(() => setLogoVisible(true), 400);

    // Tagline slides in after 900ms
    const t2 = setTimeout(() => setTaglineVisible(true), 900);

    // Progress bar fills up
    let prog = 0;
    const progInterval = setInterval(() => {
      prog += 2 + Math.random() * 3;
      if (prog >= 100) {
        prog = 100;
        clearInterval(progInterval);
      }
      setProgressWidth(prog);
    }, 55);

    // Start exit after 2.8s (or when page loads — whichever is later but max 3.5s)
    let exitStarted = false;
    const startExit = () => {
      if (exitStarted) return;
      exitStarted = true;
      clearInterval(progInterval);
      setProgressWidth(100);
      setTimeout(() => {
        setPhase('exiting');
        setTimeout(() => {
          setPhase('done');
          sessionStorage.setItem('yumnest_intro_v2', '1');
        }, 700);
      }, 300);
    };

    // Minimum display time
    const minTimer = setTimeout(startExit, 2900);

    // Also trigger on window load if page finishes early
    const onLoad = () => {
      if (prog > 70) startExit();
    };
    window.addEventListener('load', onLoad);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(minTimer);
      clearInterval(progInterval);
      window.removeEventListener('load', onLoad);
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <>
      <style>{`
        @keyframes yn-float-up {
          0%   { opacity: 0; transform: translateY(30px) rotate(var(--rot)) scale(0.5); }
          30%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(-80px) rotate(calc(var(--rot) + 180deg)) scale(1.1); }
        }
        @keyframes yn-pulse-ring {
          0%   { transform: scale(0.85); opacity: 0.7; }
          60%  { transform: scale(1.05); opacity: 0.3; }
          100% { transform: scale(0.85); opacity: 0.7; }
        }
        @keyframes yn-logo-pop {
          0%   { transform: scale(0.3) rotate(-8deg); opacity: 0; }
          55%  { transform: scale(1.08) rotate(2deg); opacity: 1; }
          80%  { transform: scale(0.97) rotate(-1deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes yn-slide-up {
          0%   { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0);    opacity: 1; }
        }
        @keyframes yn-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes yn-curtain-up {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-100%); }
        }
        @keyframes yn-curtain-down {
          0%   { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
        @keyframes yn-bg-radial {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes yn-dot-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50%       { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>

      {/* Overlay */}
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
          animation: phase === 'exiting' ? 'yn-curtain-up 0.65s cubic-bezier(0.76,0,0.24,1) forwards' : 'yn-bg-radial 0.4s ease forwards',
          background: '#0F5638',
        }}
      >
        {/* Radial glow behind logo */}
        <div style={{
          position: 'absolute',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,170,66,0.18) 0%, transparent 70%)',
          animation: 'yn-pulse-ring 2.4s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* Spice particles */}
        {particles.map((p) => (
          <span
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: `${p.size}px`,
              opacity: 0,
              '--rot': `${p.rotation}deg`,
              animation: `yn-float-up ${p.duration}s ease-in-out ${p.delay}s infinite`,
              pointerEvents: 'none',
              userSelect: 'none',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            } as React.CSSProperties}
          >
            {p.emoji}
          </span>
        ))}

        {/* Decorative gold ring */}
        <div style={{
          position: 'absolute',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          border: '1.5px solid rgba(232,170,66,0.25)',
          animation: 'yn-pulse-ring 3s ease-in-out infinite 0.5s',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          border: '1px solid rgba(232,170,66,0.12)',
          animation: 'yn-pulse-ring 3s ease-in-out infinite 1s',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}>
          <div style={{
            opacity: logoVisible ? 1 : 0,
            animation: logoVisible ? 'yn-logo-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
            filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))',
          }}>
            <Image
              src="/assets/yummnext-og-logo.png"
              alt="Yumnest"
              width={160}
              height={64}
              priority
              style={{ width: '160px', height: 'auto', objectFit: 'contain' }}
            />
          </div>

          {/* Tagline */}
          <div style={{
            opacity: taglineVisible ? 1 : 0,
            animation: taglineVisible ? 'yn-slide-up 0.5s ease forwards' : 'none',
            textAlign: 'center',
          }}>
            <p style={{
              color: '#E8AA42',
              fontSize: '11px',
              letterSpacing: '0.3em',
              fontWeight: 600,
              textTransform: 'uppercase',
              fontFamily: 'var(--font-manrope, sans-serif)',
              background: 'linear-gradient(90deg, #E8AA42 0%, #FFF8E7 50%, #E8AA42 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'yn-shimmer 2.5s linear infinite',
            }}>
              Pure Spices · Authentic Flavours
            </p>
          </div>

          {/* Loading dots */}
          <div style={{
            display: 'flex',
            gap: '8px',
            opacity: taglineVisible ? 1 : 0,
            transition: 'opacity 0.4s ease 0.2s',
          }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#E8AA42',
                animation: `yn-dot-bounce 0.9s ease-in-out ${i * 0.15}s infinite`,
              }} />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          position: 'absolute',
          bottom: '48px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(260px, 70vw)',
          zIndex: 2,
        }}>
          <div style={{
            height: '2px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '99px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progressWidth}%`,
              background: 'linear-gradient(90deg, #E8AA42, #FFF8E7)',
              borderRadius: '99px',
              transition: 'width 0.1s ease',
              boxShadow: '0 0 8px rgba(232,170,66,0.6)',
            }} />
          </div>
          <p style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: '9px',
            letterSpacing: '0.2em',
            textAlign: 'center',
            marginTop: '10px',
            fontFamily: 'var(--font-manrope, sans-serif)',
            textTransform: 'uppercase',
          }}>
            Loading…
          </p>
        </div>

        {/* Top decorative line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, #E8AA42 50%, transparent 100%)',
          opacity: 0.6,
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, #E8AA42 50%, transparent 100%)',
          opacity: 0.6,
        }} />
      </div>
    </>
  );
}
