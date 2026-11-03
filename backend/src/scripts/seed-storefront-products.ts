/**
 * Seed & Migration Script for Yumnest Storefront Catalogue
 * Migrates all mock products and categories into MongoDB as the Single Source of Truth.
 * Idempotent: Can be run multiple times safely without creating duplicates.
 */

import { connectToDatabase, disconnectFromDatabase } from "../config/database";
import { loadEnvironment } from "../config/env";
import { CategoryModel } from "../models/category.model";
import { ProductModel } from "../models/product.model";

interface MockVariant {
  id: string;
  weight: string;
  price: number;
  salePrice?: number;
  stock: number;
}

interface MockProduct {
  id: string;
  name: string;
  malayalamName?: string;
  subtitle?: string;
  category: string;
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
  variants: MockVariant[];
  rating: number;
  reviewCount: number;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  discountPercentage?: number;
  inStock: boolean;
  isFeatured?: boolean;
  badge?: string;
}

const SEED_CATEGORIES = [
  {
    name: "Broast Powder",
    slug: "broast-powder",
    malayalamName: "ബ്രോസ്റ്റ് പൗഡർ",
    description: "Signature crispy Kerala broast masala coatings & spice rubs",
    image: {
      url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80",
    },
    displayOrder: 1,
    isActive: true,
  },
  {
    name: "Masala Powders",
    slug: "masala-powders",
    malayalamName: "ശുദ്ധമായ മസാലപ്പൊടികൾ",
    description: "Freshly stone-ground bold spices from Wayanad and Idukki hills",
    image: {
      url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
    },
    displayOrder: 2,
    isActive: true,
  },
  {
    name: "Spice Blends",
    slug: "spice-blends",
    malayalamName: "പരമ്പരാഗത കൂട്ട് മസാലകൾ",
    description: "Authentic Kerala slow-roasted curried spice formulations",
    image: {
      url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=400&q=80",
    },
    displayOrder: 3,
    isActive: true,
  },
  {
    name: "Coconut Oil",
    slug: "coconut-oil",
    malayalamName: "ശുദ്ധമായ വെളിച്ചെണ്ണ",
    description: "100% pure cold-pressed roasted Kerala copra oil",
    image: {
      url: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=400&q=80",
    },
    displayOrder: 4,
    isActive: true,
  },
  {
    name: "Special Mixes",
    slug: "special-mixes",
    malayalamName: "ഷവായ & അൽഫഹം മിക്സുകൾ",
    description: "Authentic Gulf & Kerala barbecue rubs: Shawaya, Alfaham, Mandhi",
    image: {
      url: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=400&q=80",
    },
    displayOrder: 5,
    isActive: true,
  },
  {
    name: "Combo Packs",
    slug: "combo-packs",
    malayalamName: "ഫാമിലി കോംബോ പാക്കുകൾ",
    description: "Curated value gift packs and everyday kitchen essentials bundles",
    image: {
      url: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=400&q=80",
    },
    displayOrder: 6,
    isActive: true,
  },
];

const SEED_PRODUCTS: MockProduct[] = [
  {
    id: "broast-masala-powder",
    name: "Broast Masala Powder",
    malayalamName: "ബ്രോസ്റ്റ് മസാല പൊടി",
    category: "Broast Powder",
    shortDescription: "Signature crispy broast coating with aromatic spices for restaurant-style crunch at home.",
    description: "Our Broast Masala Powder is a mastercrafted blend of Kashmiri chillies, white pepper, aromatic garlic, and natural herbs. Formulated specifically to yield signature golden craggy flakes that seal juicy chicken inside.",
    ingredients: ["Kashmiri Chilli", "White Pepper", "Garlic Powder", "Onion Flakes", "Dry Ginger", "Coriander", "Nutmeg", "Mace", "Rock Salt"],
    howToUse: "Marinate 1kg cleaned chicken pieces with 4 tbsp Broast Masala, ginger-garlic paste, and buttermilk for 2 hours. Dredge in seasoned flour, dip in ice water, dredge again, and fry at 170°C for 12-14 minutes.",
    nutrition: {
      calories: "320 kcal / 100g",
      protein: "11.8g",
      fat: "4.2g",
      carbs: "58.4g",
    },
    primaryImage: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80",
    ],
    variants: [
      { id: "v-b1", weight: "100g", price: 165, salePrice: 140, stock: 85 },
      { id: "v-b2", weight: "250g", price: 375, salePrice: 320, stock: 50 },
      { id: "v-b3", weight: "500g", price: 720, salePrice: 599, stock: 30 },
      { id: "v-b4", weight: "1kg", price: 1350, salePrice: 1150, stock: 20 },
    ],
    rating: 4.8,
    reviewCount: 65,
    isBestSeller: true,
    isOnSale: true,
    discountPercentage: 15,
    inStock: true,
    isFeatured: true,
    badge: "Best Seller",
  },
  {
    id: "green-cardamom",
    name: "Idukki Bold Green Cardamom (8mm+)",
    malayalamName: "ഇടുക്കി ഏലയ്ക്ക",
    category: "Spice Blends",
    shortDescription: "Extra bold sun-dried 8mm+ green cardamom pods from the misty high-ranges of Idukki.",
    description: "Hand-picked from certified estate vines at high altitude. Natural green hue, intense aromatic oils, and bursting with sweet floral fragrance.",
    ingredients: ["100% Whole Green Cardamom (8mm+)"],
    howToUse: "Crush gently to release seeds for royal biryanis, payasam, chai, and desserts.",
    nutrition: {
      calories: "311 kcal / 100g",
      protein: "10.8g",
      fat: "6.7g",
      carbs: "68.5g",
    },
    primaryImage: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80"],
    variants: [
      { id: "v-c1", weight: "100g", price: 350, salePrice: 320, stock: 40 },
      { id: "v-c2", weight: "250g", price: 820, salePrice: 750, stock: 25 },
      { id: "v-c3", weight: "500g", price: 1600, salePrice: 1450, stock: 15 },
    ],
    rating: 4.9,
    reviewCount: 42,
    isBestSeller: true,
    isOnSale: true,
    discountPercentage: 9,
    inStock: true,
    isFeatured: true,
    badge: "Single Estate",
  },
  {
    id: "tellicherry-black-pepper",
    name: "Tellicherry Black Pepper (TGSEB)",
    malayalamName: "തലശ്ശേരി കുരുമുളക്",
    category: "Masala Powders",
    shortDescription: "The king of spices. Bold, pungent, sun-dried Malabar black peppercorns.",
    description: "Tellicherry Garbled Special Extra Bold (TGSEB) represents the top 10% largest peppercorn harvest. Grown on the Western Ghats slopes, sun-cured naturally with high piperine content.",
    ingredients: ["100% Tellicherry Black Peppercorns"],
    howToUse: "Crush fresh onto steaks, chicken roasts, egg bullseye, and Kerala nadan curries.",
    nutrition: {
      calories: "255 kcal / 100g",
      protein: "10.4g",
      fat: "3.3g",
      carbs: "64.0g",
    },
    primaryImage: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80"],
    variants: [
      { id: "v-p1", weight: "100g", price: 195, salePrice: 175, stock: 60 },
      { id: "v-p2", weight: "250g", price: 460, salePrice: 420, stock: 35 },
      { id: "v-p3", weight: "500g", price: 890, salePrice: 799, stock: 20 },
    ],
    rating: 4.8,
    reviewCount: 51,
    isBestSeller: false,
    isOnSale: true,
    discountPercentage: 10,
    inStock: true,
    isFeatured: true,
    badge: "Heritage Harvest",
  },
  {
    id: "kerala-pure-coconut-oil",
    name: "Pure Roasted Copra Coconut Oil",
    malayalamName: "ശുദ്ധമായ വറുത്ത വെളിച്ചെണ്ണ",
    category: "Coconut Oil",
    shortDescription: "100% natural cold-pressed oil made from sun-cured roasted Kerala coconut copra.",
    description: "Cold-pressed using heritage methods with zero sulfur, no bleaching, and no mineral additives. Imparts the authentic smoky coconut aroma essential for Kerala traditional cooking.",
    ingredients: ["100% Roasted Kerala Coconut Copra"],
    howToUse: "Ideal for tempering nadan curries, fish fries, banana chips, and avial.",
    nutrition: {
      calories: "862 kcal / 100ml",
      protein: "0g",
      fat: "100g",
      carbs: "0g",
    },
    primaryImage: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80"],
    variants: [
      { id: "v-o1", weight: "500ml", price: 260, salePrice: 235, stock: 45 },
      { id: "v-o2", weight: "1L", price: 490, salePrice: 450, stock: 30 },
      { id: "v-o3", weight: "5L", price: 2300, salePrice: 2150, stock: 10 },
    ],
    rating: 4.9,
    reviewCount: 88,
    isBestSeller: true,
    isOnSale: true,
    discountPercentage: 8,
    inStock: true,
    isFeatured: true,
    badge: "Cold-Pressed",
  },
  {
    id: "shawaya-masala-mix",
    name: "Shawaya Barbecue Masala Mix",
    malayalamName: "ഷവായ മസാല മിക്സ്",
    category: "Special Mixes",
    shortDescription: "Authentic Gulf-style charbroiled Shawaya marinade with sumac and roasted cumin.",
    description: "A savory Arabian blend of dried Persian lemons, sumac, coriander, garlic, and slow-roasted cumin. Imparts that smoky restaurant-style crust to whole chicken roasted in oven or grill.",
    ingredients: ["Persian Dry Lemon", "Sumac", "Roasted Cumin", "Garlic", "Black Pepper", "Cardamom", "Paprika", "Sea Salt"],
    howToUse: "Rub whole chicken with olive oil, yogurt, garlic paste, and 3 tbsp Shawaya mix. Grill or bake at 200°C for 45 minutes.",
    nutrition: {
      calories: "280 kcal / 100g",
      protein: "9.2g",
      fat: "3.8g",
      carbs: "52.1g",
    },
    primaryImage: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80"],
    variants: [
      { id: "v-s1", weight: "100g", price: 175, salePrice: 150, stock: 55 },
      { id: "v-s2", weight: "250g", price: 390, salePrice: 340, stock: 35 },
    ],
    rating: 4.7,
    reviewCount: 38,
    isBestSeller: false,
    isOnSale: true,
    discountPercentage: 14,
    inStock: true,
    isFeatured: true,
    badge: "Arabian Style",
  },
  {
    id: "kashmiri-chilli-powder",
    name: "Pure Kashmiri Red Chilli Powder",
    malayalamName: "കാശ്മീരി മുളകുപൊടി",
    category: "Masala Powders",
    shortDescription: "Vibrant natural ruby red colour with mild gentle heat and sweet aroma.",
    description: "100% pure deseeded stemless Kashmiri chillies stone-milled at low temperatures to retain natural essential oils and radiant ruby hue without added artificial colours.",
    ingredients: ["100% Pure Kashmiri Dried Chillies"],
    howToUse: "Add to gravies, marinades, and tandoori preparations for unmatched natural red luster.",
    nutrition: {
      calories: "282 kcal / 100g",
      protein: "12.0g",
      fat: "14.2g",
      carbs: "56.6g",
    },
    primaryImage: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80"],
    variants: [
      { id: "v-k1", weight: "250g", price: 210, salePrice: 185, stock: 70 },
      { id: "v-k2", weight: "500g", price: 395, salePrice: 350, stock: 45 },
      { id: "v-k3", weight: "1kg", price: 760, salePrice: 680, stock: 25 },
    ],
    rating: 4.8,
    reviewCount: 74,
    isBestSeller: true,
    isOnSale: true,
    discountPercentage: 12,
    inStock: true,
    isFeatured: true,
    badge: "100% Natural Colour",
  },
  {
    id: "wayanad-golden-turmeric",
    name: "Wayanad Pure Golden Turmeric Powder (5%+ Curcumin)",
    malayalamName: "വയനാടൻ മഞ്ഞൾപ്പൊടി",
    category: "Masala Powders",
    shortDescription: "High-potency golden turmeric ground from heritage Wayanad rhizomes with superior natural curcumin.",
    description: "Sourced directly from organic certified tribal farming collectives in Wayanad hills. Slowly solar-dried and cold-milled to retain over 5% active curcumin, giving it an unmistakable deep golden hue, earthy aroma, and medicinal potency.",
    ingredients: ["100% Pure Wayanad Turmeric Rhizomes"],
    howToUse: "Essential for traditional Kerala curries, golden milk (haldi doodh), fish fries, and vegetable thorans.",
    nutrition: {
      calories: "349 kcal / 100g",
      protein: "7.8g",
      fat: "9.9g",
      carbs: "64.9g",
    },
    primaryImage: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80"],
    variants: [
      { id: "v-t1", weight: "100g", price: 95, salePrice: 85, stock: 90 },
      { id: "v-t2", weight: "250g", price: 220, salePrice: 195, stock: 65 },
      { id: "v-t3", weight: "500g", price: 410, salePrice: 360, stock: 40 },
    ],
    rating: 4.9,
    reviewCount: 56,
    isBestSeller: false,
    isOnSale: true,
    discountPercentage: 11,
    inStock: true,
    isFeatured: true,
    badge: "High Curcumin",
  },
  {
    id: "kerala-spice-box-combo",
    name: "Kerala Heritage 4-in-1 Spice Gift Box",
    malayalamName: "കേരള പൈതൃക സ്പൈസ് കോംബോ",
    category: "Combo Packs",
    shortDescription: "Curated gift hamper featuring Tellicherry Black Pepper, Idukki Cardamom, Broast Masala & Roasted Coconut Oil.",
    description: "The ultimate culinary gift from God’s Own Country. Includes vacuum-sealed packs of 8mm+ Idukki Green Cardamom (100g), Tellicherry TGSEB Black Pepper (100g), Signature Broast Masala (100g), and Pure Cold-Pressed Roasted Coconut Oil (500ml), packaged in a handcrafted eco-friendly presentation box.",
    ingredients: ["Whole Cardamom (100g)", "Tellicherry Pepper (100g)", "Broast Masala (100g)", "Pure Coconut Oil (500ml)"],
    howToUse: "Perfect for gifting food lovers, housewarming celebrations, or setting up an authentic Kerala pantry.",
    nutrition: {
      calories: "Multiple Products",
      protein: "Standard Natural",
      fat: "Pure Healthy Fats",
      carbs: "Natural Spices",
    },
    primaryImage: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
    ],
    variants: [
      { id: "v-combo-std", weight: "Standard Box", price: 1150, salePrice: 949, stock: 35 },
      { id: "v-combo-deluxe", weight: "Deluxe Family Box", price: 1950, salePrice: 1699, stock: 20 },
    ],
    rating: 5.0,
    reviewCount: 31,
    isBestSeller: true,
    isOnSale: true,
    discountPercentage: 17,
    inStock: true,
    isFeatured: true,

  },
];

async function seedStorefrontProducts() {
  console.log("\n=======================================================");
  console.log("   YUMNEST MIGRATION: SEED STOREFRONT PRODUCTS TO MONGO");
  console.log("=======================================================\n");

  const env = loadEnvironment();
  await connectToDatabase(env.MONGODB_URI);

  try {
    // 1. Seed Categories
    console.log(`[1/2] Seeding ${SEED_CATEGORIES.length} Categories...`);
    const categoryMap = new Map<string, string>(); // Name -> Category ObjectId

    for (const catData of SEED_CATEGORIES) {
      const category = await CategoryModel.findOneAndUpdate(
        { slug: catData.slug },
        {
          $set: {
            name: catData.name,
            malayalamName: catData.malayalamName,
            description: catData.description,
            image: catData.image,
            displayOrder: catData.displayOrder,
            isActive: catData.isActive,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      categoryMap.set(catData.name, category._id.toString());
      console.log(`  ✓ Category: ${category.name} (${category.slug}) -> ID: ${category._id}`);
    }

    // 2. Seed Products
    console.log(`\n[2/2] Seeding ${SEED_PRODUCTS.length} Products...`);
    let seededCount = 0;

    for (const prodData of SEED_PRODUCTS) {
      const catId = categoryMap.get(prodData.category);
      if (!catId) {
        console.warn(`  ⚠️ Category not found for product "${prodData.name}": "${prodData.category}"`);
        continue;
      }

      // Map variants into schema format with unique SKUs
      const skuPrefix = prodData.id.replace(/-/g, "").slice(0, 6).toUpperCase();
      const variants = prodData.variants.map((v, idx) => {
        const cleanWeight = v.weight.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        return {
          variantName: v.weight,
          sku: `YN-${skuPrefix}-${cleanWeight || idx + 1}`,
          price: v.salePrice ?? v.price,
          compareAtPrice: v.salePrice ? v.price : undefined,
          stockQuantity: v.stock,
          unit: v.weight.includes("ml") || v.weight.includes("L") ? "ml" : v.weight.includes("Box") ? "box" : "g",
          isActive: true,
        };
      });

      const images = prodData.images.map((url, idx) => ({
        url,
        sortOrder: idx,
        altText: `${prodData.name} image ${idx + 1}`,
      }));

      const product = await ProductModel.findOneAndUpdate(
        { slug: prodData.id },
        {
          $set: {
            name: prodData.name,
            malayalamName: prodData.malayalamName,
            subtitle: prodData.subtitle,
            shortDescription: prodData.shortDescription,
            description: prodData.description,
            category: catId,
            images,
            variants,
            ingredients: prodData.ingredients,
            howToUse: prodData.howToUse,
            nutrition: prodData.nutrition,
            rating: prodData.rating,
            reviewCount: prodData.reviewCount,
            isBestSeller: prodData.isBestSeller ?? false,
            isOnSale: prodData.isOnSale ?? false,
            discountPercentage: prodData.discountPercentage,
            badge: prodData.badge,
            tags: [prodData.category.toLowerCase(), "spices", "kerala"],
            isActive: true,
            isFeatured: prodData.isFeatured ?? true,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      seededCount++;
      console.log(`  ✓ Product [${seededCount}/${SEED_PRODUCTS.length}]: ${product.name} (slug: ${product.slug}) -> ID: ${product._id}`);
    }

    // 3. Verification Count
    const totalCategoriesInDb = await CategoryModel.countDocuments();
    const totalProductsInDb = await ProductModel.countDocuments();

    console.log("\n=======================================================");
    console.log("   MIGRATION VERIFICATION AUDIT");
    console.log("=======================================================");
    console.log(`Expected Categories: ${SEED_CATEGORIES.length} | In MongoDB: ${totalCategoriesInDb}`);
    console.log(`Expected Products:   ${SEED_PRODUCTS.length}   | In MongoDB: ${totalProductsInDb}`);
    console.log("=======================================================\n");

  } catch (err) {
    console.error("Migration error:", err);
    throw err;
  } finally {
    await disconnectFromDatabase();
  }
}

void seedStorefrontProducts();

