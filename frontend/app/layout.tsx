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

export const metadata: Metadata = {
  title: "Yumnest | Foods & Pure Spices | Authentic Kerala Spices & Broast Masala",
  description:
    "Experience Yumnest premium food and authentic Kerala spices. Single-estate Tellicherry black pepper, Idukki bold green cardamom, signature crispy broast masala, and pure cold-pressed roasted coconut oil.",
  keywords: [
    "Yumnest",
    "Kerala Spices",
    "Broast Masala Powder",
    "Tellicherry Black Pepper",
    "Idukki Cardamom",
    "Pure Coconut Oil",
    "Kerala Food Products",
  ],
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
