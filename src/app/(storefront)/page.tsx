import React from "react";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles, Shield, Clock, Award, Star } from "lucide-react";

export const revalidate = 0; // Dynamic data for real-time stock and sales

export default async function HomePage() {
  // Fetch dynamic storefront data
  const [
    featuredProducts,
    newArrivals,
    bestSellers,
    categories,
    flashSale,
    siteSettingsList,
  ] = await Promise.all([
    prisma.product.findMany({
      where: { isFeatured: true, status: "PUBLISHED" },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { order: "asc" } },
      },
      take: 4,
    }),
    prisma.product.findMany({
      where: { isNewArrival: true, status: "PUBLISHED" },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { order: "asc" } },
      },
      take: 4,
    }),
    prisma.product.findMany({
      where: { isBestSeller: true, status: "PUBLISHED" },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { order: "asc" } },
      },
      take: 4,
    }),
    prisma.category.findMany({
      where: { isVisible: true, isFeatured: true },
      orderBy: { order: "asc" },
    }),
    prisma.flashSale.findFirst({
      where: { isActive: true },
      include: {
        products: {
          include: {
            product: {
              include: {
                category: true,
                brand: true,
                images: true,
              },
            },
          },
        },
      },
    }),
    prisma.siteSetting.findMany(),
  ]);

  // Convert settings array into a lookup map
  const settings: Record<string, string> = {};
  siteSettingsList.forEach((s) => {
    settings[s.key] = s.value;
  });

  const heroTitle =
    settings["hero_title"] || "The Pinnacle of Craftsmanship & Modern Elegance";
  const heroSubtitle =
    settings["hero_subtitle"] ||
    "Explore exceptional horology, handcrafted leather goods, and rare artisanal perfumes curated for the discerning patron.";

  return (
    <div className="flex flex-col w-full">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center bg-[#241813] text-[#FAF8F5] overflow-hidden">
        {/* Background Image with Warm Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2000&auto=format&fit=crop"
            alt="Eden Luxury Horology"
            fill
            priority
            className="object-cover object-center opacity-40 mix-blend-luminosity scale-105 transform hover:scale-100 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#170F0B] via-[#241813]/60 to-[#170F0B]/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F5]/10 backdrop-blur-md border border-[#C5A880]/30 text-[#DFC8A8] text-xs uppercase tracking-[0.25em] font-medium mb-6 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Maison de Haute Horlogerie & Cuir</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-[#FAF8F5] mb-6 leading-[1.1] max-w-3xl">
            {heroTitle}
          </h1>

          <p className="text-base sm:text-lg text-[#ECE5D8] max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            {heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/shop" className="w-full sm:w-auto">
              <Button
                variant="gold"
                size="lg"
                className="w-full sm:w-auto min-w-[200px]"
              >
                Explore The Vault
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/shop?sort=newest" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto min-w-[200px] bg-transparent text-[#FAF8F5] border-[#FAF8F5]/30 hover:bg-[#FAF8F5]/10"
              >
                View New Arrivals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. FLASH SALE SECTION (If Active) */}
      {flashSale && flashSale.products.length > 0 && (
        <section className="w-full bg-[#FAF2E6] border-y border-[#DFC8A8] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#A6875C] block mb-1">
                  Limited Privilege Window
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#241813]">
                  {flashSale.title}
                </h2>
                <p className="text-sm text-[#63534B] mt-1 max-w-xl">
                  {flashSale.description}
                </p>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-[#DFC8A8] shadow-xs">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#63534B]">
                  Closes in:
                </span>
                <CountdownTimer endDate={flashSale.endDate} />
              </div>
            </div>

            {/* Flash Sale Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashSale.products.map((item) => (
                <ProductCard
                  key={item.id}
                  product={{
                    ...item.product,
                    isFlashSale: true,
                    flashSalePrice: item.salePrice,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. FEATURED COLLECTIONS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#A6875C] block mb-2">
            Curated Categories
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#241813]">
            Signature Disciplines
          </h2>
          <div className="w-12 h-0.5 bg-[#C5A880] mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className={`group relative h-80 rounded-2xl overflow-hidden shadow-xs border border-[#E5DDCF] ${
                idx === 0 ? "sm:col-span-2 lg:col-span-2" : ""
              }`}
            >
              <Image
                src={
                  cat.image ||
                  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop"
                }
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#170F0B]/80 via-[#170F0B]/30 to-transparent" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-[#FAF8F5]">
                <span className="text-xs tracking-widest uppercase text-[#C5A880] font-medium mb-1">
                  Collection
                </span>
                <h3 className="font-serif text-2xl font-medium mb-2 group-hover:text-[#DFC8A8] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#ECE5D8] max-w-md line-clamp-2 mb-4 font-light">
                  {cat.description}
                </p>
                <div className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] group-hover:text-[#C5A880] transition-colors">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS (The Vault) */}
      <section className="w-full bg-[#FAF8F5] border-t border-[#E5DDCF] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#A6875C] block mb-2">
                Hand-Selected
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#241813]">
                The Featured Vault
              </h2>
            </div>
            <Link
              href="/shop"
              className="mt-4 sm:mt-0 inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#241813] hover:text-[#A6875C] transition-colors"
            >
              <span>View All 8 Creations</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. BRAND HERITAGE & PROPOSITION */}
      <section className="w-full bg-[#241813] text-[#FAF8F5] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#C5A880] block mb-3">
              The Eden Philosophy
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light mb-6 leading-tight">
              Crafted for Those Who Value Permanence
            </h2>
            <p className="text-sm sm:text-base text-[#ECE5D8] font-light leading-relaxed mb-6">
              Eden was established on a single austere conviction: that true luxury lies in restraint, impeccable material provenance, and devotion to artisanal craft. Every watch movement is hand-finished, every leather hide vegetable-tanned in Santa Croce, and every perfume essence aged in Grasse.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#3D2B22]">
              <div>
                <div className="text-2xl font-serif text-[#C5A880] mb-1">100%</div>
                <div className="text-xs uppercase tracking-wider text-[#96867B]">
                  Certified Provenance
                </div>
              </div>
              <div>
                <div className="text-2xl font-serif text-[#C5A880] mb-1">4-Hour</div>
                <div className="text-xs uppercase tracking-wider text-[#96867B]">
                  Nairobi Concierge Delivery
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-96 lg:h-[460px] rounded-2xl overflow-hidden border border-[#3D2B22] shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop"
              alt="Craftsmanship in Atelier"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* 6. NEW ARRIVALS & BEST SELLERS TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#A6875C] block mb-2">
              Fresh From The Ateliers
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#241813]">
              New Arrivals & Best Sellers
            </h2>
          </div>
          <Link
            href="/shop?sort=bestselling"
            className="mt-4 sm:mt-0 inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#241813] hover:text-[#A6875C]"
          >
            <span>Explore Best Sellers</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. PATRON TESTIMONIALS */}
      <section className="w-full bg-[#FAF2E6]/50 border-t border-[#E5DDCF] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#A6875C] block mb-2">
            Client Impressions
          </span>
          <h2 className="font-serif text-3xl font-light text-[#241813] mb-12">
            Echoes from Our Discerning Patrons
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-white p-8 rounded-2xl border border-[#E5DDCF] shadow-xs">
              <div className="flex text-[#C5A880] mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-[#241813] italic mb-6 leading-relaxed">
                &ldquo;The Grand Sovereign arrived in an immaculate lacquered walnut presentation case. The M-Pesa checkout was instant, and Eden&apos;s private driver delivered to Karen within three hours.&rdquo;
              </p>
              <div>
                <p className="text-xs font-semibold text-[#241813] uppercase tracking-wider">
                  Hon. James Kariuki
                </p>
                <p className="text-[11px] text-[#96867B]">Horology Collector, Nairobi</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#E5DDCF] shadow-xs">
              <div className="flex text-[#C5A880] mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-[#241813] italic mb-6 leading-relaxed">
                &ldquo;The Savoy Holdall weekender has already accompanied me on trips to Milan and Kigali. The leather smells divine and is already gathering an extraordinary, rich patina.&rdquo;
              </p>
              <div>
                <p className="text-xs font-semibold text-[#241813] uppercase tracking-wider">
                  Elena de Souza
                </p>
                <p className="text-[11px] text-[#96867B]">Architect & Designer, Mombasa</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
