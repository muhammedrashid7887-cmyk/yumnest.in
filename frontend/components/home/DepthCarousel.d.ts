import type { ReactNode } from 'react';

export interface DepthCarouselItem {
  id?: string;
  image: string;
  alt?: string;
  title?: string;
  titleMalayalam?: string;
  duration?: string;
  category?: string;
  shortDescription?: string;
  youtubeId?: string;
  url?: string;
  platform?: 'youtube' | 'instagram';
  [key: string]: unknown;
}

export interface DepthCarouselProps {
  items?: DepthCarouselItem[];
  cardWidth?: number;
  cardHeight?: number;
  radius?: number;
  tint?: string;
  depth?: number;
  spread?: number;
  tilt?: number;
  tiltDirection?: 'right' | 'left';
  perspective?: number;
  visibleCards?: number;
  falloff?: number;
  blur?: number;
  duration?: number;
  ease?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  onChange?: (index: number, item: DepthCarouselItem) => void;
  onItemClick?: (item: DepthCarouselItem, index: number) => void;
  renderCard?: (item: DepthCarouselItem, index: number, isFocused: boolean) => ReactNode;
  className?: string;
}

declare const DepthCarousel: React.FC<DepthCarouselProps>;
export default DepthCarousel;

