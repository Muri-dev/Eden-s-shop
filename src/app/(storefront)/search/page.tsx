import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search } from "lucide-react";

export const revalidate = 0;

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const products = query
    ? await prisma.product.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
            { sku: { contains: query } },
            { tags: { contains: query } },
            { brand: { name: { contains: query } } },
            { category: { name: { contains: query } } },
          ],
        },
        include: {
          category: true,
          brand: true,
          images: { orderBy: { order: "asc" } },
        },
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Search Header */}
      <div className="max-w-2xl mx-auto text-center mb-12">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#A6875C] block mb-2">
          Vault Search
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#241813] mb-6">
          {query ? `Results for “${query}”` : "Search Our Vault"}
        </h1>

        <form action="/search" method="GET" className="relative flex items-center max-w-xl mx-auto">
          <Search className="absolute left-4 w-5 h-5 text-[#96867B]" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search watches, leather goods, perfumes, jewelry..."
            className="w-full h-12 pl-12 pr-24 bg-white border border-[#E5DDCF] rounded-full text-sm text-[#241813] placeholder-[#96867B] focus:outline-none focus:border-[#C5A880] shadow-xs"
          />
          <button
            type="submit"
            className="absolute right-2 px-5 py-2 bg-[#241813] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#3D2B22] transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      {query ? (
        products.length > 0 ? (
          <div>
            <p className="text-xs uppercase tracking-wider text-[#96867B] font-semibold mb-6 pb-3 border-b border-[#E5DDCF]">
              Found {products.length} {products.length === 1 ? "Creation" : "Creations"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title={`No Creations Found for “${query}”`}
            description="We could not find any matching items in our vault. Try adjusting your query or exploring our standard curated categories."
            actionLabel="View All Creations"
            actionHref="/shop"
          />
        )
      ) : (
        <div className="text-center text-xs text-[#96867B] mt-8">
          Enter a keyword above to search our Swiss horology, fine Tuscan leather, or haute perfumes.
        </div>
      )}
    </div>
  );
}
