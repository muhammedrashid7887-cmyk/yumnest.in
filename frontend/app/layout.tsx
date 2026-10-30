import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/common/CartDrawer";
import { CartToast } from "@/components/common/CartToast";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jakarta.variable} scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917] font-sans antialiased">
        <CartProvider>
          {children}
          <CartDrawer />
          <CartToast />
        </CartProvider>
      </body>
    </html>
  );
}
