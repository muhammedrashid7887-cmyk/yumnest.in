import { Product, CategoryItem, Recipe, Award, CustomerReview, SiteSettings } from '@/types';

export const SITE_SETTINGS: SiteSettings = {
  brandName: 'Yumnest',
  tagline: 'Foods • Pure Spices',
  announcementBarText: 'NO MSG  |  NO PRESERVATIVES  |  NO ADDED COLOURS  |  100% NATURAL  |  ALL INDIA DELIVERY',
  whatsappNumber: '+917012268934',
  supportPhone: '+91 70122 68934',
  supportEmail: 'care@yumnest.in',
  address: 'Yumnest Spices & Foods, Spice Valley Industrial Park, Aluva, Ernakulam, Kerala 683101',
  freeShippingThreshold: 499,
  standardShippingFee: 40,
  instagramUrl: 'https://www.instagram.com/faseehathanseel?cplk=NWNiZTdhY2p3dWd6',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61563693034178',
  linkedinUrl: 'https://www.linkedin.com/in/yumnestgroup-yumnestgroup-368bab434?utm_source=share_via&utm_content=profile&utm_medium=member_android',
  xUrl: 'https://x.com/yumnestgroup?s=20',
  youtubeUrl: 'https://youtube.com/@yumnest',
};

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-all',
    name: 'All Products',
    malayalamName: 'എല്ലാ ഉൽപ്പന്നങ്ങളും',
    description: 'Explore our complete collection of single-estate spices & blends',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
    featured: true,
  },
  {
    id: 'cat-broast',
    name: 'Broast Powder',
    malayalamName: 'ബ്രോസ്റ്റ് പൗഡർ',
    description: 'Signature crispy Kerala broast masala coatings & spice rubs',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80',
    featured: true,
  },
  {
    id: 'cat-masala',
    name: 'Masala Powders',
    malayalamName: 'ശുദ്ധമായ മസാലപ്പൊടികൾ',
    description: 'Freshly stone-ground bold spices from Wayanad and Idukki hills',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80',
    featured: true,
  },
  {
    id: 'cat-blends',
    name: 'Spice Blends',
    malayalamName: 'പരമ്പരാഗത കൂട്ട് മസാലകൾ',
    description: 'Authentic Kerala slow-roasted curried spice formulations',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=400&q=80',
    featured: true,
  },
  {
    id: 'cat-oil',
    name: 'Coconut Oil',
    malayalamName: 'ശുദ്ധമായ വെളിച്ചെണ്ണ',
    description: '100% pure cold-pressed roasted Kerala copra oil',
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=400&q=80',
    featured: true,
  },
  {
    id: 'cat-special',
    name: 'Special Mixes',
    malayalamName: 'ഷവായ & അൽഫഹം മിക്സുകൾ',
    description: 'Authentic Gulf & Kerala barbecue rubs: Shawaya, Alfaham, Mandhi',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=400&q=80',
    featured: true,
  },
  {
    id: 'cat-combos',
    name: 'Combo Packs',
    malayalamName: 'ഫാമിലി കോംബോ പാക്കുകൾ',
    description: 'Curated value gift packs and everyday kitchen essentials bundles',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=400&q=80',
    featured: true,
  },
];

export const PRODUCTS: Product[] = [];

export const RECIPES: Recipe[] = [
  {
    id: 'crispy-broasted-chicken',
    title: 'Kerala Golden Broasted Chicken',
    slug: 'kerala-golden-broasted-chicken',
    duration: '25 mins',
    category: 'Broast Recipes',
    thumbnailUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
    shortDescription: 'Master the iconic crispy craggy coating and juicy tenderness right in your home kitchen.',
    prepTime: '2 hrs marination',
    cookTime: '15 mins',
    servings: '4 persons',
    ingredients: ['1kg Chicken pieces', '4 tbsp Yumnest Broast Masala', '1 cup Buttermilk', '2 cups Flour', 'Cold water'],
    instructions: [
      'Marinate chicken pieces in buttermilk, garlic paste, and Yumnest Broast Masala for 2 hours.',
      'Dredge seasoned chicken in refined flour, shake off excess.',
      'Quick dip in cold water for 1 second, then dredge again firmly in flour for flakes.',
      'Deep fry in hot oil at 170°C for 12-14 minutes until golden and thoroughly cooked.',
    ],
  },
  {
    id: 'malabar-dum-biryani',
    title: 'Authentic Thalassery Dum Biryani',
    slug: 'authentic-thalassery-dum-biryani',
    duration: '45 mins',
    category: 'Heritage Recipes',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    shortDescription: 'Fragrant Kaima rice cooked on slow dum with Tellicherry black pepper and fresh green cardamom.',
    prepTime: '30 mins',
    cookTime: '45 mins',
    servings: '6 persons',
    ingredients: ['500g Kaima Rice', '750g Mutton/Chicken', 'Yumnest Bold Cardamom', 'Yumnest Black Pepper', 'Pure Ghee'],
    instructions: [
      'Sauté sliced onions in ghee until golden brown, set half aside for garnish.',
      'Cook chicken with ground spices, green chillies, ginger-garlic paste, and yogurt.',
      'Parboil Kaima rice with whole cardamom, cloves, and cinnamon.',
      'Layer meat and rice in a heavy pot, seal with foil or dough, and dum cook on low heat for 25 minutes.',
    ],
  },
  {
    id: 'coastal-tawa-fish-fry',
    title: 'Neymeen (King Fish) Tawa Fry',
    slug: 'neymeen-tawa-fish-fry',
    duration: '20 mins',
    category: 'Seafood Specials',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
    shortDescription: 'Fiery and zesty coastal fish fry marinated with Kashmiri chilli, crushed pepper, and roasted coconut oil.',
    prepTime: '20 mins marination',
    cookTime: '10 mins',
    servings: '3 persons',
    ingredients: ['500g Kingfish steaks', '2 tbsp Kashmiri Chilli Powder', '1 tsp Turmeric', '1 tsp Crushed Pepper', 'Yumnest Roasted Coconut Oil'],
    instructions: [
      'Make a thick paste with chilli powder, turmeric, pepper, lemon juice, salt, and ginger paste.',
      'Coat fish steaks evenly and rest for 20 minutes.',
      'Shallow fry on an iron tawa in pure roasted coconut oil with fresh curry leaves until crisp on both sides.',
    ],
  },
];

/* 
 * NOTE: The following customer reviews and awards are provided as 
 * representative prototype sample data for UI demonstration purposes,
 * in compliance with the PRD guidelines.
 */
export const SAMPLE_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    name: 'Fathima Nisham',
    location: 'Kochi, Kerala',
    role: 'Home Cook & Food Blogger',
    comment: 'The Broast Masala gave my chicken the exact craggy flaky texture we get at high-end broast diners! My kids loved every single bite.',
    rating: 5,
    dish: 'Signature Broast Powder',
    isSample: true,
  },
  {
    id: 'rev-2',
    name: 'Chef Rajesh Nair',
    location: 'Kozhikode, Kerala',
    role: 'Executive Chef',
    comment: 'The bold aroma of the Idukki green cardamom and Tellicherry pepper is extraordinary. Fresh single-origin quality makes all the difference in curries.',
    rating: 5,
    dish: 'Idukki Bold Cardamom',
    isSample: true,
  },
  {
    id: 'rev-3',
    name: 'Ananya Sreekumar',
    location: 'Bengaluru, Karnataka',
    role: 'Culinary Enthusiast',
    comment: 'Finally a roasted coconut oil that truly smells like traditional mill-pressed oil without chemical aftertastes. Prompt delivery to Bangalore too!',
    rating: 5,
    dish: 'Pure Roasted Coconut Oil',
    isSample: true,
  },
];

export const SAMPLE_AWARDS: Award[] = [
  {
    id: 'aw-1',
    title: 'Best Regional Spice Innovation',
    organization: 'Kerala Culinary Guild',
    year: '2025',
    description: 'Recognized for authentic preservative-free heritage recipe formulation.',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80',
    isSample: true,
  },
  {
    id: 'aw-2',
    title: 'Pure Food Excellence Citation',
    organization: 'Southern Food Producers Federation',
    year: '2024',
    description: 'Acknowledged for 100% natural cold-processing standards and farmer partnerships.',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
    isSample: true,
  },
];
