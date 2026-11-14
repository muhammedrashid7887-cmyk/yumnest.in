/**
 * Recipes & Vlogs Video Types & Data
 * Real videos are loaded strictly from the database via the API.
 */

export interface CookingMediaItem {
  id: string;
  image: string;
  alt: string;
  title: string;
  titleEnglish?: string;
  titleMalayalam?: string;
  duration?: string;
  category?: string;
  shortDescription?: string;
  platform: 'youtube' | 'instagram' | 'native';
  url: string;
  externalId: string;
  youtubeId?: string;
  nativeVideoUrl?: string;
  isNative?: boolean;
  thumbnailUrl: string;
  recipeDetails?: {
    prepTime?: string;
    cookTime?: string;
    servings?: string;
    ingredients?: string[];
    instructions?: string[];
  };
}

/**
 * Empty by default. Only administrator-published videos from MongoDB are displayed.
 */
export const DEFAULT_COOKING_MEDIA: CookingMediaItem[] = [];
