import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Sparkles, Tag, Gift, ShieldCheck } from "lucide-react";

export const revalidate = 0;

export default async function OffersPage() {
  const [discountedProducts, coupons] = await Promise.all([
    prisma.product.findMany({
      where: {
        discountPrice: { not: null },
        status: "PUBLISHED",
      },
      include: {
        category: true,
        brand: true,
        images: true,
      },
    }),
    prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: { discountValue: "desc" },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF2E6] border border-[#DFC8A8] text-[#A6875C] text-xs uppercase tracking-[0.2em] font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Privileges</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-[#241813] mb-4">
          Patron Offers & Privileges
        </h1>
        <p className="text-sm text-[#63534B] leading-relaxed">
          Exclusive seasonal courtesies, promotional codes, and complimentary concierge privileges available for our esteemed patrons.
        </p>
      </div>

      {/* Active Privilege Codes */}
      <div className="mb-20">
        <h2 className="font-serif text-2xl font-light text-[#241813] mb-6">
          Active Privilege Codes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white border-2 border-dashed border-[#C5A880] rounded-2xl p-6 relative overflow-hidden shadow-xs"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDCF] text-[#A6875C]">
                  <Tag className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold tracking-widest bg-[#241813] text-[#FAF8F5] px-3 py-1 rounded-lg">
                  {coupon.code}
                </span>
              </div>

              <h3 className="font-serif text-xl font-medium text-[#241813] mb-1">
                {coupon.discountType === "PERCENTAGE"
                  ? `${coupon.discountValue}% Privileged Saving`
                  : `KSh ${new Intl.NumberFormat("en-KE").format(coupon.discountValue)} Off`}
              </h3>

              <p className="text-xs text-[#63534B] mb-4">{coupon.description}</p>

              <div className="pt-3 border-t border-[#F0EAE1] text-[11px] text-[#96867B] flex justify-between items-center">
                <span>
                  {coupon.minOrderValue
                    ? `Min Order: KSh ${new Intl.NumberFormat("en-KE").format(coupon.minOrderValue)}`
                    : "No minimum required"}
                </span>
                <span className="text-emerald-700 font-semibold uppercase">Verified Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promotional Creations Grid */}
      <div>
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E5DDCF]">
          <h2 className="font-serif text-2xl font-light text-[#241813]">
            Privilege-Priced Creations
          </h2>
          <span className="text-xs uppercase tracking-wider text-[#96867B]">
            {discountedProducts.length} Items Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {discountedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
