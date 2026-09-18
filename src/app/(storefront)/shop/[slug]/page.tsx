import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductDetailClient } from "@/components/storefront/ProductDetailClient";
import { ProductCard } from "@/components/storefront/ProductCard";

export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: true, category: true, brand: true },
  });

  if (!product) {
    return { title: "Product Not Found | Eden's Shop" };
  }

  const imageUrl = product.images[0]?.url;

  return {
    title: `${product.name} | Eden's Shop Luxury Store`,
    description: product.shortDescription || product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description.slice(0, 160),
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      brand: true,
      images: { orderBy: { order: "asc" } },
      variants: { orderBy: { price: "asc" } },
      specifications: { orderBy: { order: "asc" } },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!product || product.status !== "PUBLISHED") {
    notFound();
  }

  // Fetch Related Creations from the same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: "PUBLISHED",
    },
    include: {
      category: true,
      brand: true,
      images: { orderBy: { order: "asc" } },
    },
    take: 4,
  });

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : undefined;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://edenshop.com";
  const productUrl = `${baseUrl}/shop/${product.slug}`;
  const imageUrl = product.images[0]?.url;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description.slice(0, 300),
    image: product.images.map((img) => img.url),
    sku: product.sku,
    url: productUrl,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand.name }
      : undefined,
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      priceCurrency: "KES",
      price: product.discountPrice || product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: productUrl,
      seller: { "@type": "Organization", name: "Eden's Shop" },
    },
    ...(avgRating !== undefined && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: product.reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${baseUrl}/shop` },
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: product.category.name,
              item: `${baseUrl}/shop?category=${product.category.slug}`,
            },
          ]
        : []),
      { "@type": "ListItem", position: product.category ? 4 : 3, name: product.name },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[#96867B] uppercase tracking-wider mb-8 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-[#241813]">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#241813]">
          Shop
        </Link>
        <span>/</span>
        <Link
          href={`/shop?category=${product.category?.slug}`}
          className="hover:text-[#241813]"
        >
          {product.category?.name}
        </Link>
        <span>/</span>
        <span className="text-[#241813] font-medium truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main Interactive Product Section */}
      <ProductDetailClient product={product as any} />

      {/* Related Creations (The Vault Recommendations) */}
      {relatedProducts.length > 0 && (
        <section className="mt-24 pt-16 border-t border-[#E5DDCF]">
          <div className="text-center max-w-md mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#A6875C] block mb-2">
              Harmonious Complements
            </span>
            <h2 className="font-serif text-3xl font-light text-[#241813]">
              Related Atelier Creations
            </h2>
            <div className="w-10 h-0.5 bg-[#C5A880] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
