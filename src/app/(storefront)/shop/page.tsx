import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShoppingBag, SlidersHorizontal, X } from "lucide-react";

export const metadata: Metadata = {
  title: "Shop All Collections | Eden's Shop",
  description:
    "Browse our full range of luxury timepieces, fine leather goods, haute perfumery, and artisanal jewelry. Filter by category, brand, and price. Free delivery on select orders.",
  openGraph: {
    title: "Shop All Collections | Eden's Shop",
    description: "Explore handcrafted luxury from Eden's curated vault.",
  },
};

export const revalidate = 0;

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    q?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const { category, brand, sort, minPrice, maxPrice, inStock, q } = params;

  // Build Prisma where query
  const where: any = {
    status: "PUBLISHED",
  };

  if (category) {
    where.category = { slug: category };
  }

  if (brand) {
    where.brand = { slug: brand };
  }

  if (inStock === "true") {
    where.stock = { gt: 0 };
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { tags: { contains: q } },
      { sku: { contains: q } },
    ];
  }

  // Sorting
  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") {
    orderBy = { price: "asc" };
  } else if (sort === "price-desc") {
    orderBy = { price: "desc" };
  } else if (sort === "bestselling") {
    orderBy = { isBestSeller: "desc" };
  } else if (sort === "newest") {
    orderBy = { createdAt: "desc" };
  }

  // Fetch products, categories, and brands in parallel
  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        brand: true,
        images: { orderBy: { order: "asc" } },
      },
    }),
    prisma.category.findMany({
      where: { isVisible: true },
      orderBy: { order: "asc" },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const activeFiltersCount = [category, brand, sort, minPrice, maxPrice, inStock, q].filter(
    Boolean
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header & Breadcrumbs */}
      <div className="mb-10 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-[#96867B] uppercase tracking-wider mb-2">
          <Link href="/" className="hover:text-[#241813]">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#241813] font-medium">All Collections</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#241813] font-light">
          The Vault Collection
        </h1>
        <p className="text-sm text-[#63534B] mt-1 max-w-xl">
          Impeccable horology, Tuscan leather, and bespoke extraits crafted without compromise.
        </p>
      </div>

      {/* Main Shop Layout: Filters Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR FILTERS (Desktop) */}
        <aside className="hidden lg:block space-y-8 pr-4 border-r border-[#E5DDCF]">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5DDCF]">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#241813]">
              Refine Vault
            </span>
            {activeFiltersCount > 0 && (
              <Link
                href="/shop"
                className="text-xs text-[#A6875C] hover:underline flex items-center gap-1"
              >
                <span>Reset All</span>
                <X className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#63534B] mb-3">
              Discipline / Category
            </h4>
            <div className="space-y-2 text-sm">
              <Link
                href="/shop"
                className={`block py-1 transition-colors ${
                  !category ? "text-[#A6875C] font-semibold" : "text-[#241813] hover:text-[#A6875C]"
                }`}
              >
                All Disciplines
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop?category=${c.slug}${sort ? `&sort=${sort}` : ""}`}
                  className={`block py-1 transition-colors ${
                    category === c.slug
                      ? "text-[#A6875C] font-semibold"
                      : "text-[#241813] hover:text-[#A6875C]"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Brands / Maisons */}
          <div className="pt-6 border-t border-[#E5DDCF]">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#63534B] mb-3">
              Maison / Brand
            </h4>
            <div className="space-y-2 text-sm">
              {brands.map((b) => (
                <Link
                  key={b.id}
                  href={`/shop?brand=${b.slug}${category ? `&category=${category}` : ""}${
                    sort ? `&sort=${sort}` : ""
                  }`}
                  className={`block py-1 transition-colors ${
                    brand === b.slug
                      ? "text-[#A6875C] font-semibold"
                      : "text-[#241813] hover:text-[#A6875C]"
                  }`}
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="pt-6 border-t border-[#E5DDCF]">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#63534B] mb-3">
              Stock Status
            </h4>
            <Link
              href={`/shop?inStock=${inStock === "true" ? "false" : "true"}${
                category ? `&category=${category}` : ""
              }`}
              className="flex items-center gap-2 text-sm text-[#241813] hover:text-[#A6875C]"
            >
              <input
                type="checkbox"
                checked={inStock === "true"}
                readOnly
                className="w-4 h-4 rounded border-[#E5DDCF] accent-[#241813]"
              />
              <span>In Stock Only</span>
            </Link>
          </div>
        </aside>

        {/* PRODUCTS AREA */}
        <div className="lg:col-span-3">
          {/* Top Bar: Results Count & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#E5DDCF] gap-4">
            <div className="text-xs uppercase tracking-wider text-[#96867B] font-medium">
              Showing <span className="text-[#241813] font-semibold">{products.length}</span>{" "}
              {products.length === 1 ? "Creation" : "Creations"}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-[#63534B] font-semibold">
                Sort By:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { label: "Newest", value: "newest" },
                  { label: "Price: Low to High", value: "price-asc" },
                  { label: "Price: High to Low", value: "price-desc" },
                  { label: "Best Sellers", value: "bestselling" },
                ].map((s) => (
                  <Link
                    key={s.value}
                    href={`/shop?sort=${s.value}${category ? `&category=${category}` : ""}${
                      brand ? `&brand=${brand}` : ""
                    }`}
                    className={`px-3 py-1.5 rounded-lg border transition-colors ${
                      sort === s.value
                        ? "bg-[#241813] text-[#FAF8F5] border-[#241813]"
                        : "bg-white text-[#63534B] border-[#E5DDCF] hover:border-[#A6875C]"
                    }`}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs text-[#96867B] uppercase tracking-wider">
                Active Filters:
              </span>
              {category && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F4EFE6] border border-[#E5DDCF] text-xs text-[#241813] rounded-full">
                  Category: {category}
                  <Link href={`/shop${sort ? `?sort=${sort}` : ""}`}>
                    <X className="w-3 h-3 text-[#96867B] hover:text-[#241813]" />
                  </Link>
                </span>
              )}
              {brand && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F4EFE6] border border-[#E5DDCF] text-xs text-[#241813] rounded-full">
                  Brand: {brand}
                  <Link href={`/shop${category ? `?category=${category}` : ""}`}>
                    <X className="w-3 h-3 text-[#96867B] hover:text-[#241813]" />
                  </Link>
                </span>
              )}
              {q && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F4EFE6] border border-[#E5DDCF] text-xs text-[#241813] rounded-full">
                  Search: &ldquo;{q}&rdquo;
                  <Link href="/shop">
                    <X className="w-3 h-3 text-[#96867B] hover:text-[#241813]" />
                  </Link>
                </span>
              )}
            </div>
          )}

          {/* Product Grid or Empty State */}
          {products.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No Creations Match Your Selection"
              description="We could not find any creations matching your specific filter criteria in our vault. Try resetting filters to explore our full catalogue."
              actionLabel="Clear All Filters"
              actionHref="/shop"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
