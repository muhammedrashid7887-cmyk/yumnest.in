/**
 * Centralized Site SEO Configuration for Yum Nest
 * Built according to Next.js App Router and E-commerce SEO guidelines.
 */

export const SITE_SEO = {
  brandName: 'Yum Nest',
  brandLegalName: 'Yumnest Spices & Foods',
  siteUrl: 'https://yumnest.in',
  siteDomain: 'yumnest.in',
  founder: {
    name: 'Chef Faseeha Thanseel',
    role: 'Founder & Culinary Consultant',
    awards: [
      'Malabar Adukkala Title Winner (2018)',
      'Business Kerala Award (2024)',
    ],
  },
  developers: 'Designed & Developed by Adhil EK and Muhammed Rashid PS',
  defaultTitle: 'Yum Nest | Premium Kerala Spices, Authentic Broast & Alfaham Masalas',
  titleTemplate: '%s | Yum Nest',
  defaultDescription:
    'Experience Yum Nest authentic Kerala spices and foods. Restaurant-style crispy broast masala powder, authentic Alfaham grill mix, single-estate Tellicherry black pepper, Idukki bold green cardamom, and 100% roasted copra coconut oil.',
  defaultKeywords: [
    'Yum Nest',
    'Yum Nest Kerala',
    'Chef Faseeha Thanseel',
    'Broast Masala Powder',
    'Broast Masala Powder Kerala',
    'Buy Broast Masala Powder Online',
    'Alfaham Masala',
    'Alfa Powder',
    'Alfa Powder Kerala',
    'Kerala Masala Powder',
    'Idukki Green Cardamom',
    'Tellicherry Black Pepper',
    'Kashmiri Red Chilli Powder',
    'Roasted Copra Coconut Oil',
    'Shawaya Barbecue Masala Mix',
    'Kerala Spices Online',
  ],
  social: {
    instagram: 'https://instagram.com/yum_nest',
    facebook: 'https://facebook.com/yumnest',
    linkedin: 'https://linkedin.com/company/yumnest',
    twitter: 'https://x.com/yumnest',
  },
  contact: {
    addressCountry: 'IN',
    addressRegion: 'Kerala',
    addressLocality: 'Kochi',
    postalCode: '682005',
    streetAddress: 'Thoppumpady, Kochi – 5, Ernakulam, Kerala, India',
    telephone: '+91 70122 68934',
    email: 'yumnest2000@gmail.com',
  },
  defaultOgImage: {
    url: 'https://yumnest.in/assets/yummnext-og-logo.png',
    width: 1200,
    height: 630,
    alt: 'Yum Nest - Authentic Kerala Spices and Foods',
  },
} as const;
