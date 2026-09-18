import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/components/ui/ToastContainer";

export const metadata: Metadata = {
  title: "Eden's Shop | Haute Horlogerie, Fine Leather & Maison",
  description:
    "Eden's Shop is Kenya's premier luxury boutique offering Swiss automatic chronometers, Tuscan full-grain leather luggage, haute perfumery, and fine jewelry. Seamless M-Pesa and Paystack checkout.",
  keywords: [
    "luxury shopping",
    "Eden's Shop",
    "Swiss watches Kenya",
    "leather bags Nairobi",
    "M-Pesa luxury checkout",
    "niche perfumes Kenya",
    "fine jewelry",
  ],
  openGraph: {
    title: "Eden's Shop | Timeless Refinement & Curated Luxury",
    description: "Discover handcrafted horology, bespoke leather, and rare extraits.",
    type: "website",
    locale: "en_KE",
    siteName: "Eden's Shop",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-[#241813]">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
