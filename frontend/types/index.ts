export type ProductCategory = string;

export interface CategoryItem {
  id: string;
  name: string;
  malayalamName?: string;
  description?: string;
  image: string;
  featured?: boolean;
}

export interface ProductVariant {
  id: string;
  _id?: string;
  weight: string; // e.g. "100g", "250g", "500g", "1kg", "500ml", "1L"
  variantName?: string;
  sku?: string;
  price: number; // in INR
  salePrice?: number;
  stock: number;
}

export interface Product {
  id: string;
  _id?: string;
  slug?: string;
  name: string;
  subtitle?: string;
  malayalamName?: string;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  ingredients: string[];
  howToUse: string;
  nutrition: {
    calories: string;
    protein: string;
    fat: string;
    carbs: string;
  };
  primaryImage: string;
  images: string[];
  variants: ProductVariant[];
  selectedVariantId?: string;
  rating: number;
  reviewCount: number;
  isBestSeller?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
  discountPercentage?: number;
  inStock: boolean;
  isFeatured?: boolean;
  badge?: string;
  tags?: string[];
}

export interface Recipe {
  id: string;
  title: string;
  slug: string;
  duration: string; // e.g. "14 mins"
  category: string;
  thumbnailUrl: string;
  videoUrl?: string;
  shortDescription: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  ingredients: string[];
  instructions: string[];
}

export interface Award {
  id: string;
  title: string;
  organization: string;
  year: string;
  description: string;
  imageUrl: string;
  isSample: boolean;
}

export interface CustomerReview {
  id: string;
  name: string;
  location: string;
  role: string;
  comment: string;
  rating: number;
  dish: string;
  isSample: boolean;
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  announcementBarText: string;
  whatsappNumber: string;
  supportPhone: string;
  supportEmail: string;
  address: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  instagramUrl: string;
  youtubeUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  xUrl: string;
}
