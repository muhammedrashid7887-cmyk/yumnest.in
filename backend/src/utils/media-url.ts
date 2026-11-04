/**
 * Media URL parsing, validation, and ID extraction utilities
 * for YouTube Videos and Instagram Reels.
 */

export interface ParsedYouTubeMedia {
  platform: "youtube";
  externalId: string;
  normalizedUrl: string;
  embedUrl: string;
  defaultThumbnailUrl: string;
}

export interface ParsedInstagramMedia {
  platform: "instagram";
  externalId: string;
  normalizedUrl: string;
  embedUrl: string;
  defaultThumbnailUrl: string;
}

export type ParsedMediaResult = ParsedYouTubeMedia | ParsedInstagramMedia;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

const INSTAGRAM_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
]);

export function parseYouTubeUrl(rawUrl: string): ParsedYouTubeMedia | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;

  try {
    const urlObj = new URL(rawUrl.trim());
    if (!["http:", "https:"].includes(urlObj.protocol)) return null;

    const hostname = urlObj.hostname.toLowerCase();
    if (!YOUTUBE_HOSTS.has(hostname)) return null;

    let videoId: string | null = null;

    if (hostname === "youtu.be") {
      // Path: /VIDEO_ID
      const parts = urlObj.pathname.split("/").filter(Boolean);
      if (parts.length > 0 && /^[a-zA-Z0-9_-]{11}$/.test(parts[0])) {
        videoId = parts[0];
      }
    } else {
      // Paths: /watch?v=VIDEO_ID, /shorts/VIDEO_ID, /embed/VIDEO_ID
      if (urlObj.pathname === "/watch") {
        const v = urlObj.searchParams.get("v");
        if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
          videoId = v;
        }
      } else if (urlObj.pathname.startsWith("/shorts/")) {
        const parts = urlObj.pathname.split("/").filter(Boolean);
        if (parts.length >= 2 && /^[a-zA-Z0-9_-]{11}$/.test(parts[1])) {
          videoId = parts[1];
        }
      } else if (urlObj.pathname.startsWith("/embed/")) {
        const parts = urlObj.pathname.split("/").filter(Boolean);
        if (parts.length >= 2 && /^[a-zA-Z0-9_-]{11}$/.test(parts[1])) {
          videoId = parts[1];
        }
      }
    }

    if (!videoId) {
      // Fallback regex match on entire URL
      const match = rawUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
      if (match && match[1]) {
        videoId = match[1];
      }
    }

    if (!videoId) return null;

    return {
      platform: "youtube",
      externalId: videoId,
      normalizedUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      defaultThumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  } catch {
    return null;
  }
}

export function parseInstagramUrl(rawUrl: string): ParsedInstagramMedia | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;

  try {
    const urlObj = new URL(rawUrl.trim());
    if (!["http:", "https:"].includes(urlObj.protocol)) return null;

    const hostname = urlObj.hostname.toLowerCase();
    if (!INSTAGRAM_HOSTS.has(hostname)) return null;

    let reelId: string | null = null;
    const parts = urlObj.pathname.split("/").filter(Boolean);

    // Matches /reel/REEL_ID or /p/POST_ID
    if (parts.length >= 2 && (parts[0] === "reel" || parts[0] === "p")) {
      const candidate = parts[1];
      if (/^[a-zA-Z0-9_-]+$/.test(candidate)) {
        reelId = candidate;
      }
    }

    if (!reelId) {
      const match = rawUrl.match(/instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/i);
      if (match && match[1]) {
        reelId = match[1];
      }
    }

    if (!reelId) return null;

    return {
      platform: "instagram",
      externalId: reelId,
      normalizedUrl: `https://www.instagram.com/reel/${reelId}/`,
      embedUrl: `https://www.instagram.com/reel/${reelId}/embed`,
      defaultThumbnailUrl: "/assets/instagram-reel-placeholder.png",
    };
  } catch {
    return null;
  }
}

export function parseAndValidateMediaUrl(
  platform: "youtube" | "instagram",
  url: string
): ParsedMediaResult | null {
  if (platform === "youtube") {
    return parseYouTubeUrl(url);
  }
  if (platform === "instagram") {
    return parseInstagramUrl(url);
  }
  return null;
}

