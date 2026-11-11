'use client';

import React, { useRef, useEffect, useCallback, type FC, type ReactNode, type CSSProperties } from 'react';

export interface ClickSparkProps {
  sparkColor?: string | string[];
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  sparkWidth?: number;
  duration?: number;
  easing?: 'ease-out' | 'ease-in' | 'ease-in-out' | 'linear' | 'spring';
  extraScale?: number;
  shape?: 'star' | 'line' | 'streak' | 'dot' | 'square' | 'circle';
  randomness?: number;
  gravity?: number;
  spread?: number;
  direction?: number;
  glow?: number;
  ring?: boolean;
  layer?: 'front' | 'back';
  onlyButtons?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

interface SparkParticle {
  originX: number;
  originY: number;
  angle: number;
  maxDist: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  startTime: number;
}

interface SparkBurst {
  x: number;
  y: number;
  color: string;
  startTime: number;
}

const easeFunctions: Record<string, (t: number) => number> = {
  linear: (t: number) => t,
  'ease-in': (t: number) => t * t,
  'ease-out': (t: number) => 1 - Math.pow(1 - t, 3),
  'ease-in-out': (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  spring: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

/**
 * Draws a 4-point sparkle star (glint/twinkle) centered at (cx, cy).
 */
function drawSparkleStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  rotation: number
) {
  const spikes = 4;
  let rot = (Math.PI / 2) * 3 + rotation;
  const step = Math.PI / spikes;

  ctx.beginPath();
  let x = cx + Math.cos(rot) * outerRadius;
  let y = cy + Math.sin(rot) * outerRadius;
  ctx.moveTo(x, y);

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.closePath();
}

export const ClickSpark: FC<ClickSparkProps> = ({
  sparkColor = '#D4AF37',
  sparkSize = 12,
  sparkRadius = 35,
  sparkCount = 8,
  sparkWidth = 2,
  duration = 450,
  easing = 'ease-out',
  extraScale = 1,
  shape = 'star',
  randomness = 0.3,
  gravity = 0,
  spread = 360,
  direction = 0,
  glow = 0.3,
  ring = false,
  layer = 'front',
  onlyButtons = true,
  disabled = false,
  className = '',
  style,
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<SparkParticle[]>([]);
  const burstsRef = useRef<SparkBurst[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTriggerTimeRef = useRef<number>(0);

  // Resize canvas to match the viewport with device pixel ratio
  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    }
  }, []);

  useEffect(() => {
    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);
    return () => {
      window.removeEventListener('resize', updateCanvasDimensions);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [updateCanvasDimensions]);

  // Main animation frame loop
  const animateRef = useRef<((time: number) => void) | null>(null);
  const animate = useCallback(
    (currentTime: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      ctx.clearRect(0, 0, width, height);

      const easeFn = easeFunctions[easing] || easeFunctions['ease-out'];

      // 1. Render expanding shockwave ring if enabled
      if (ring) {
        burstsRef.current = burstsRef.current.filter(burst => {
          const elapsed = currentTime - burst.startTime;
          if (elapsed >= duration) return false;

          const progress = elapsed / duration;
          const eased = easeFn(progress);
          const currentRingRadius = eased * sparkRadius * 1.5 * extraScale;
          const ringAlpha = (1 - eased) * 0.7;

          ctx.save();
          ctx.beginPath();
          ctx.arc(burst.x, burst.y, Math.max(0, currentRingRadius), 0, Math.PI * 2);
          ctx.strokeStyle = burst.color;
          ctx.lineWidth = Math.max(0.5, sparkWidth * (1 - eased));
          ctx.globalAlpha = Math.max(0, ringAlpha);
          if (glow > 0) {
            ctx.shadowBlur = glow * 10;
            ctx.shadowColor = burst.color;
          }
          ctx.stroke();
          ctx.restore();

          return true;
        });
      }

      // 2. Render all spark particles
      particlesRef.current = particlesRef.current.filter(particle => {
        const elapsed = currentTime - particle.startTime;
        if (elapsed >= duration) return false;

        const progress = elapsed / duration;
        const eased = easeFn(progress);

        // Calculate travel distance and position
        const currentDist = eased * particle.maxDist;
        const gravityDrop = gravity * 140 * eased * eased;
        const posX = particle.originX + Math.cos(particle.angle) * currentDist;
        const posY = particle.originY + Math.sin(particle.angle) * currentDist + gravityDrop;

        // Scale and opacity fade
        const currentSize = Math.max(0, particle.size * (1 - eased * 0.85));
        const alpha = Math.max(0, 1 - progress);
        const currentRotation = particle.rotation + particle.rotationSpeed * eased;

        ctx.save();
        ctx.globalAlpha = alpha;

        if (glow > 0) {
          ctx.shadowBlur = glow * 14;
          ctx.shadowColor = particle.color;
        }

        ctx.fillStyle = particle.color;
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = sparkWidth;

        if (shape === 'star') {
          const innerRadius = currentSize * 0.28;
          drawSparkleStar(ctx, posX, posY, currentSize, innerRadius, currentRotation);
          ctx.fill();
        } else if (shape === 'dot' || shape === 'circle') {
          ctx.beginPath();
          ctx.arc(posX, posY, currentSize / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (shape === 'square') {
          ctx.translate(posX, posY);
          ctx.rotate(currentRotation);
          ctx.fillRect(-currentSize / 2, -currentSize / 2, currentSize, currentSize);
        } else if (shape === 'streak') {
          const trailLength = currentSize * 1.8;
          const tailX = posX - Math.cos(particle.angle) * trailLength;
          const tailY = posY - Math.sin(particle.angle) * trailLength;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(posX, posY);
          ctx.stroke();
        } else {
          // 'line' shape
          const lineHalf = currentSize / 2;
          const x1 = posX - Math.cos(particle.angle) * lineHalf;
          const y1 = posY - Math.sin(particle.angle) * lineHalf;
          const x2 = posX + Math.cos(particle.angle) * lineHalf;
          const y2 = posY + Math.sin(particle.angle) * lineHalf;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        ctx.restore();
        return true;
      });

      // Continue render loop if particles/bursts remain, otherwise stop to conserve battery & GPU
      if (particlesRef.current.length > 0 || burstsRef.current.length > 0) {
        animFrameIdRef.current = requestAnimationFrame((time) => {
          animateRef.current?.(time);
        });
      } else {
        animFrameIdRef.current = null;
        ctx.clearRect(0, 0, width, height);
      }
    },
    [duration, easing, extraScale, glow, gravity, ring, shape, sparkRadius, sparkWidth]
  );

  useEffect(() => {
    animateRef.current = animate;
  }, [animate]);

  // Trigger spark generation at (clientX, clientY)
  const spawnSparks = useCallback(
    (clientX: number, clientY: number) => {
      if (disabled) return;
      if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const now = performance.now();
      // Deduplicate rapid touch/pointer events within 40ms
      if (now - lastTriggerTimeRef.current < 40) return;
      lastTriggerTimeRef.current = now;

      const colors = Array.isArray(sparkColor) ? sparkColor : [sparkColor];
      const primaryColor = colors[0] || '#D4AF37';

      // Record burst origin if ring is active
      if (ring) {
        burstsRef.current.push({
          x: clientX,
          y: clientY,
          color: primaryColor,
          startTime: now,
        });
      }

      const newParticles: SparkParticle[] = [];
      const spreadRad = (Math.min(360, Math.max(1, spread)) * Math.PI) / 180;
      const baseDirectionRad = ((direction - 90) * Math.PI) / 180; // 0 degrees points straight upward
      const startAngle = spread >= 360 ? 0 : baseDirectionRad - spreadRad / 2;

      for (let i = 0; i < sparkCount; i++) {
        let angle: number;
        if (spread >= 360) {
          angle = (i * 2 * Math.PI) / sparkCount;
        } else {
          const step = sparkCount > 1 ? spreadRad / (sparkCount - 1) : 0;
          angle = startAngle + i * step;
        }

        // Apply randomness jitter
        if (randomness > 0) {
          const jitterAngle = (Math.random() - 0.5) * randomness * (Math.PI / 2.5);
          angle += jitterAngle;
        }

        const distRandomness = 1 + (Math.random() - 0.5) * randomness * 0.6;
        const maxDist = sparkRadius * extraScale * Math.max(0.4, distRandomness);

        const sizeRandomness = 1 + (Math.random() - 0.5) * randomness * 0.5;
        const size = sparkSize * Math.max(0.4, sizeRandomness);

        const color = colors[Math.floor(Math.random() * colors.length)];
        const rotation = Math.random() * Math.PI * 2;
        const rotationSpeed = (Math.random() - 0.5) * (Math.PI * 2.5);

        newParticles.push({
          originX: clientX,
          originY: clientY,
          angle,
          maxDist,
          size,
          color,
          rotation,
          rotationSpeed,
          startTime: now,
        });
      }

      particlesRef.current.push(...newParticles);

      // Start animation loop if not running
      if (!animFrameIdRef.current) {
        animFrameIdRef.current = requestAnimationFrame(animate);
      }
    },
    [animate, direction, disabled, extraScale, randomness, ring, sparkColor, sparkCount, sparkRadius, sparkSize, spread]
  );

  // Global window pointer listener so sparkles trigger ONLY when clicking buttons
  useEffect(() => {
    const handleGlobalPointer = (e: PointerEvent) => {
      // Trigger on left-click (0) or touch/pen contact
      if (e.button === 0 || e.pointerType === 'touch') {
        if (onlyButtons) {
          const target = e.target as HTMLElement | null;
          if (!target) return;

          // 1. Native button, role="button", submit/reset inputs, or explicit spark triggers
          const buttonElement = target.closest(
            'button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"], [data-spark], [data-button]'
          );

          if (!buttonElement) {
            // 2. Also accept anchor links explicitly styled as CTA buttons (e.g. "Shop Now")
            const link = target.closest('a');
            if (link) {
              const cls = link.className;
              const isCtaButton =
                typeof cls === 'string' &&
                (/\bbtn\b/.test(cls) || (cls.includes('bg-') && (cls.includes('rounded') || cls.includes('px-'))));
              if (!isCtaButton) return;
            } else {
              return;
            }
          }
        }
        spawnSparks(e.clientX, e.clientY);
      }
    };

    window.addEventListener('pointerdown', handleGlobalPointer, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handleGlobalPointer);
    };
  }, [onlyButtons, spawnSparks]);

  const canvasZIndex = layer === 'back' ? '-z-10' : 'z-50';

  return (
    <div className={`relative w-full ${className}`} style={style}>
      <canvas
        ref={canvasRef}
        className={`pointer-events-none fixed inset-0 ${canvasZIndex} w-full h-full overflow-hidden`}
        aria-hidden="true"
      />
      {children}
    </div>
  );
};

export default ClickSpark;
