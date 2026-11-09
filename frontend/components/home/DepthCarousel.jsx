'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import './DepthCarousel.css';

const DEFAULT_ITEMS = [
  {
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
    alt: 'Crispy Broasted Chicken',
    title: 'Restaurant-Style Crispy Broasted Chicken',
    titleMalayalam: 'റെസ്റ്റോറന്റ് സ്റ്റൈൽ ക്രിസ്പി ബ്രോസ്റ്റഡ് ചിക്കൻ',
    duration: '12:45',
    category: 'Broast Special',
    shortDescription: 'Master the iconic crispy craggy coating and juicy tenderness with Yumnest Broast Masala.',
  },
  {
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
    alt: 'Signature Alfaham Chicken',
    title: 'Signature Alfaham Chicken Masala & Grilling',
    titleMalayalam: 'സ്പെഷ്യൽ അൽഫാഹം ചിക്കൻ റെസിപ്പി',
    duration: '15:20',
    category: 'Signature Rubs',
    shortDescription: 'Smoky charcoal-grilled Alfaham with lemon, crushed garlic, and heritage Arabic spices.',
  },
  {
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    alt: 'Authentic Thalassery Dum Biryani',
    title: 'Authentic Thalassery Dum Biryani with Heritage Spices',
    titleMalayalam: 'ഒറിജിനൽ തലശ്ശേരി ദം ബിരിയാണി ഉണ്ടാക്കുന്ന വിധം',
    duration: '18:10',
    category: 'Heritage Recipes',
    shortDescription: 'Fragrant Kaima rice cooked on slow dum with Tellicherry black pepper and green cardamom.',
  },
  {
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    alt: 'Coastal King Fish Tawa Fry',
    title: 'Coastal King Fish Tawa Fry with Roasted Spices',
    titleMalayalam: 'നാടൻ നെയ്മീൻ തവ ഫ്രൈ സ്പെഷ്യൽ മസാല കൂട്ട്',
    duration: '09:30',
    category: 'Seafood Specials',
    shortDescription: 'Fiery and zesty coastal fish fry marinated with Kashmiri chilli and roasted coconut oil.',
  },
];

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const normalizeItem = it => (typeof it === 'string' ? { image: it, alt: '' } : it);

const DepthCarousel = ({
  items = DEFAULT_ITEMS,
  cardWidth = 340,
  cardHeight = 440,
  radius = 18,
  tint = '#0A2219',
  depth = 220,
  spread = 90,
  tilt = 22,
  tiltDirection = 'right',
  perspective = 1400,
  visibleCards = 4,
  falloff = 0.2,
  blur = 6,
  duration = 700,
  ease = 'power3.out',
  autoplay = false,
  autoplayDelay = 3200,
  loop = false,
  showControls = true,
  showIndicators = true,
  onChange,
  onItemClick,
  renderCard,
  className = '',
}) => {
  const data = useMemo(() => (Array.isArray(items) ? items : []).map(normalizeItem), [items]);
  const count = data.length;

  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const overlayRefs = useRef([]);

  const posRef = useRef(0);
  const focusRef = useRef(0);
  const tweenRef = useRef(null);
  const scaleRef = useRef(1);
  const cfgRef = useRef({});
  const onChangeRef = useRef(onChange);
  const onItemClickRef = useRef(onItemClick);

  const dragRef = useRef(null);
  const wheelTimerRef = useRef(null);
  const autoTimerRef = useRef(null);
  const reducedRef = useRef(false);

  const [active, setActive] = useState(0);

  useEffect(() => {
    onChangeRef.current = onChange;
    onItemClickRef.current = onItemClick;
    cfgRef.current = {
      count,
      depth,
      spread,
      tilt,
      tiltDirection,
      visibleCards,
      falloff,
      blur,
      duration,
      ease,
      loop,
      cardWidth,
      autoplayDelay,
    };
  });

  const layout = useCallback(pos => {
    const cfg = cfgRef.current;
    const n = cfg.count;
    if (!n) return;
    const dir = cfg.tiltDirection === 'left' ? -1 : 1;
    const sc = scaleRef.current;

    for (let i = 0; i < n; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;

      let d = i - pos;
      if (cfg.loop && n > 1) {
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
      }

      const back = Math.max(0, d);
      const az = Math.abs(d);
      const shown = az <= cfg.visibleCards + 0.5;

      const tz = -cfg.depth * d;
      const tx = dir * cfg.spread * d;
      const ry = dir * cfg.tilt * clamp(d, 0, 1);

      // Symmetrical fading on both left and right sides
      const distFromCenter = Math.abs(d);
      let opacity = 1;
      if (distFromCenter > 0) {
        opacity = Math.max(0, 1 - (distFromCenter / (cfg.visibleCards + 0.4)) * 0.75);
      }
      if (!shown) opacity = 0;

      const brightness = Math.max(0.2, 1 - back * cfg.falloff);
      const blurPx = cfg.blur > 0 ? Math.min(cfg.blur, (back / Math.max(1, cfg.visibleCards)) * cfg.blur) : 0;
      const zi = Math.round(2000 - d * 20);

      el.style.transform = `translate(-50%, -50%) scale(${sc}) translateX(${tx.toFixed(2)}px) translateZ(${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg)`;
      el.style.opacity = opacity.toFixed(3);
      el.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`;
      el.style.zIndex = String(zi);
      el.style.pointerEvents = shown && opacity > 0.05 ? 'auto' : 'none';

      const ov = overlayRefs.current[i];
      if (ov) ov.style.opacity = clamp(back * cfg.falloff * 1.25, 0, 0.75).toFixed(3);
    }
  }, []);

  const notify = useCallback(
    idx => {
      setActive(idx);
      onChangeRef.current?.(idx, data[idx]);
    },
    [data]
  );

  const tweenTo = useCallback(
    (target, animate) => {
      tweenRef.current?.kill();
      const cfg = cfgRef.current;
      const proxy = { p: posRef.current };
      const dur = animate && !reducedRef.current ? cfg.duration / 1000 : 0;
      tweenRef.current = gsap.to(proxy, {
        p: target,
        duration: dur,
        ease: cfg.ease,
        onUpdate: () => {
          posRef.current = proxy.p;
          layout(proxy.p);
        },
        onComplete: () => {
          const n = cfg.count;
          if (cfg.loop && n > 0) {
            posRef.current = ((posRef.current % n) + n) % n;
          } else {
            posRef.current = clamp(posRef.current, 0, Math.max(0, n - 1));
          }
          layout(posRef.current);
        },
      });
    },
    [layout]
  );

  const setFocus = useCallback(
    (rawIndex, animate = true) => {
      const cfg = cfgRef.current;
      const n = cfg.count;
      if (!n) return;
      const idx = cfg.loop ? ((rawIndex % n) + n) % n : clamp(rawIndex, 0, n - 1);
      let delta = idx - posRef.current;
      if (cfg.loop && n > 1) {
        delta = ((delta % n) + n) % n;
        if (delta > n / 2) delta -= n;
      }
      tweenTo(posRef.current + delta, animate);
      if (idx !== focusRef.current) {
        focusRef.current = idx;
        notify(idx);
      }
    },
    [tweenTo, notify]
  );

  const navigateBy = useCallback(step => setFocus(focusRef.current + step, true), [setFocus]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      const cfg = cfgRef.current;
      const needed = cfg.cardWidth + Math.abs(cfg.spread) * 1.2 + 40;
      scaleRef.current = clamp(w / needed, 0.78, 1.05);
      layout(posRef.current);
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [layout]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = e => {
      const cfg = cfgRef.current;
      if (cfg.count < 2) return;
      const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const delta = e.deltaMode === 1 ? raw * 24 : raw;

      // Allow natural page scrolling when at the boundaries (non-looping)
      if (!cfg.loop) {
        if (delta > 0 && focusRef.current >= cfg.count - 1) return;
        if (delta < 0 && focusRef.current <= 0) return;
      }

      e.preventDefault();
      tweenRef.current?.kill();
      const step = clamp(delta / (cfg.cardWidth * 0.9), -0.6, 0.6);
      posRef.current += step;
      if (!cfg.loop) {
        posRef.current = clamp(posRef.current, -0.2, cfg.count - 1 + 0.2);
      }
      layout(posRef.current);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => setFocus(Math.round(posRef.current), true), 130);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [layout, setFocus]);

  const onPointerDown = useCallback(e => {
    const cfg = cfgRef.current;
    if (cfg.count < 2) return;
    tweenRef.current?.kill();
    dragRef.current = {
      x: e.clientX,
      startPos: posRef.current,
      lastX: e.clientX,
      lastT: performance.now(),
      v: 0,
      moved: false,
      id: e.pointerId,
    };
  }, []);

  const onPointerMove = useCallback(
    e => {
      const drag = dragRef.current;
      if (!drag) return;
      const cfg = cfgRef.current;
      const stepPx = Math.max(cfg.cardWidth * 0.55 * scaleRef.current, 40);
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 4) {
        drag.moved = true;
        try {
          rootRef.current?.setPointerCapture(drag.id);
        } catch {}
      }
      if (!drag.moved) return;
      const now = performance.now();
      const dt = Math.max(now - drag.lastT, 1);
      drag.v = (e.clientX - drag.lastX) / dt;
      drag.lastX = e.clientX;
      drag.lastT = now;
      let nextPos = drag.startPos - dx / stepPx;
      if (!cfg.loop) {
        nextPos = clamp(nextPos, -0.3, cfg.count - 1 + 0.3);
      }
      posRef.current = nextPos;
      layout(posRef.current);
    },
    [layout]
  );

  const onPointerEnd = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    if (!drag.moved) return;
    const cfg = cfgRef.current;
    const stepPx = Math.max(cfg.cardWidth * 0.55 * scaleRef.current, 40);
    const projected = posRef.current - (drag.v * 180) / stepPx;
    setFocus(Math.round(projected), true);
  }, [setFocus]);

  const onKeyDown = useCallback(
    e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateBy(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateBy(1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setFocus(0, true);
      } else if (e.key === 'End') {
        e.preventDefault();
        setFocus(count - 1, true);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (data[focusRef.current]) {
          onItemClickRef.current?.(data[focusRef.current], focusRef.current);
        }
      }
    },
    [navigateBy, setFocus, count, data]
  );

  const onCardClick = useCallback(
    (index) => {
      if (dragRef.current?.moved) return;
      if (focusRef.current === index) {
        // If clicking the focused card, activate action
        onItemClickRef.current?.(data[index], index);
      } else {
        setFocus(index, true);
      }
    },
    [setFocus, data]
  );

  useEffect(() => {
    reducedRef.current = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!autoplay || reducedRef.current || count < 2) return;
    const root = rootRef.current;
    let hovered = false;
    let focused = false;
    const stop = () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    };
    const start = () => {
      stop();
      autoTimerRef.current = window.setInterval(
        () => {
          if (!hovered && !focused) navigateBy(1);
        },
        Math.max(cfgRef.current.autoplayDelay, 600)
      );
    };
    const onEnter = () => {
      hovered = true;
    };
    const onLeave = () => {
      hovered = false;
    };
    const onFocusIn = () => {
      focused = true;
    };
    const onFocusOut = () => {
      focused = false;
    };
    root?.addEventListener('mouseenter', onEnter);
    root?.addEventListener('mouseleave', onLeave);
    root?.addEventListener('focusin', onFocusIn);
    root?.addEventListener('focusout', onFocusOut);
    start();
    return () => {
      stop();
      root?.removeEventListener('mouseenter', onEnter);
      root?.removeEventListener('mouseleave', onLeave);
      root?.removeEventListener('focusin', onFocusIn);
      root?.removeEventListener('focusout', onFocusOut);
    };
  }, [autoplay, autoplayDelay, count, navigateBy]);

  useEffect(() => {
    layout(posRef.current);
  }, [layout, depth, spread, tilt, tiltDirection, visibleCards, falloff, blur, cardWidth, cardHeight, radius, count]);

  useEffect(
    () => () => {
      tweenRef.current?.kill();
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    },
    []
  );

  const isAtStart = !loop && active === 0;
  const isAtEnd = !loop && active === count - 1;

  return (
    <div
      ref={rootRef}
      className={`depth-carousel ${className}`.trim()}
      style={{ '--dc-perspective': `${perspective}px` }}
      role="group"
      aria-roledescription="carousel"
      aria-label="Cooking Videos & Recipes Depth Carousel"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={onKeyDown}
    >
      <div className="depth-carousel__stage" ref={stageRef}>
        {data.map((item, i) => {
          const isFocused = active === i;
          return (
            <div
              key={item.id || i}
              className={`depth-carousel__card ${isFocused ? 'depth-carousel__card--focused' : ''}`}
              ref={el => (cardRefs.current[i] = el)}
              style={{ width: cardWidth, height: cardHeight, borderRadius: radius }}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!isFocused}
              onClick={() => onCardClick(i)}
            >
              {renderCard ? (
                renderCard(item, i, isFocused)
              ) : (
                <div className="depth-carousel__content">
                  {/* Media Thumbnail Container */}
                  <div className="depth-carousel__media">
                    <img
                      className="depth-carousel__img"
                      src={item.image}
                      alt={item.alt || item.title || ''}
                      draggable={false}
                      loading="lazy"
                    />
                    <div className="depth-carousel__media-overlay" />

                    {/* Top Badges */}
                    <div className="depth-carousel__badges">
                      {item.category && (
                        <span className="depth-carousel__badge-cat">
                          {item.category}
                        </span>
                      )}
                      {item.duration && (
                        <span className="depth-carousel__badge-time">
                          {item.duration}
                        </span>
                      )}
                    </div>

                    {/* Center Play Button Overlay */}
                    <div className="depth-carousel__play-btn">
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Card Editorial Info Footer */}
                  <div className="depth-carousel__info">
                    {item.titleMalayalam && (
                      <p className="depth-carousel__title-ml" title={item.titleMalayalam}>
                        {item.titleMalayalam}
                      </p>
                    )}
                    <h3 className="depth-carousel__title-en" title={item.title || item.alt}>
                      {item.title || item.alt}
                    </h3>

                    {item.shortDescription && (
                      <p className="depth-carousel__desc" title={item.shortDescription}>
                        {item.shortDescription}
                      </p>
                    )}

                    <div className="depth-carousel__action">
                      <span className="depth-carousel__action-text">
                        <span>Watch Recipe Video</span>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Depth Tint Layer for Perspective Layering */}
              <span
                className="depth-carousel__tint"
                ref={el => (overlayRefs.current[i] = el)}
                style={{ background: tint }}
              />
            </div>
          );
        })}
      </div>

      {showControls && count > 1 && (
        <>
          <button
            type="button"
            className={`depth-carousel__arrow depth-carousel__arrow--prev ${isAtStart ? 'is-disabled' : ''}`}
            aria-label="Previous recipe video"
            disabled={isAtStart}
            onClick={(e) => {
              e.stopPropagation();
              navigateBy(-1);
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M15 5l-7 7 7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className={`depth-carousel__arrow depth-carousel__arrow--next ${isAtEnd ? 'is-disabled' : ''}`}
            aria-label="Next recipe video"
            disabled={isAtEnd}
            onClick={(e) => {
              e.stopPropagation();
              navigateBy(1);
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M9 5l7 7-7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}

      {showIndicators && count > 1 && (
        <div className="depth-carousel__dots" role="tablist" aria-label="Recipe Slides">
          {data.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`Go to recipe ${i + 1}`}
              className={`depth-carousel__dot${active === i ? ' is-active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setFocus(i, true);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DepthCarousel;

