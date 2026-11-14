import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { SocketProvider } from "@/context/SocketContext";
import { CartDrawer } from "@/components/common/CartDrawer";
import { WishlistDrawer } from "@/components/common/WishlistDrawer";
import { CartToast } from "@/components/common/CartToast";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["600", "700", "800"],
});

import { SITE_SEO } from "@/config/site-seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/seo/schemas";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_SEO.siteUrl),
  title: {
    default: "Yum Nest | Premium Kerala Spices, Authentic Broast & Alfaham Masalas",
    template: "%s | Yum Nest",
  },
  description:
    "Experience Yum Nest authentic Kerala spices and foods. Restaurant-style crispy broast masala powder, authentic Alfaham grill mix, single-estate Tellicherry black pepper, Idukki bold green cardamom, and 100% roasted copra coconut oil.",
  keywords: Array.from(SITE_SEO.defaultKeywords),
  alternates: {
    canonical: SITE_SEO.siteUrl,
  },
  openGraph: {
    title: "Yum Nest | Authentic Kerala Spices, Broast & Alfaham Masalas",
    description:
      "Handcrafted pure spices, crispy broast masala powder, and cold-pressed coconut oil from Kerala. Formulated by award-winning Chef Faseeha Thanseel.",
    url: SITE_SEO.siteUrl,
    siteName: SITE_SEO.brandName,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: SITE_SEO.defaultOgImage.url,
        width: 1200,
        height: 630,
        alt: "Yum Nest - Authentic Kerala Spices and Foods",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yum Nest | Pure Kerala Spices & Foods",
    description:
      "Handcrafted pure spices, crispy broast masala powder, and cold-pressed coconut oil from Kerala.",
    images: [SITE_SEO.defaultOgImage.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

import { ScrollReveal } from "@/components/common/ScrollReveal";
import { ClickSpark } from "@/components/ui/ClickSpark";
import { IntroLoader } from "@/components/common/IntroLoader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${jakarta.variable} ${playfair.variable} scroll-smooth`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('yn_intro_completed')==='true'){document.documentElement.classList.add('yn-intro-done');}}catch(e){}`,
          }}
        />
        <JsonLd data={[getOrganizationSchema(), getWebSiteSchema()]} />
      </head>
      <body
        className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#1C1917] font-sans antialiased selection:bg-[#0F5638]/15 selection:text-[#0F5638]"
        suppressHydrationWarning
      >
        <IntroLoader />
        <SocketProvider>
          <CartProvider>
            <WishlistProvider>
              <ClickSpark
                sparkColor="#D4AF37"
                sparkSize={12}
                sparkRadius={35}
                sparkCount={8}
                sparkWidth={2}
                duration={450}
                easing="ease-out"
                extraScale={1}
                shape="line"
                randomness={0.3}
                gravity={0}
                spread={360}
                direction={0}
                glow={0.3}
                ring={false}
                layer="front"
                onlyButtons={true}
              >
                {children}
              </ClickSpark>
              <CartDrawer />
              <WishlistDrawer />
              <CartToast />
              <ScrollReveal />
            </WishlistProvider>
          </CartProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
