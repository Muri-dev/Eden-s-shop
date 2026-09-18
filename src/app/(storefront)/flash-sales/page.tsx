import React from "react";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Sparkles, Clock, Zap } from "lucide-react";

export const revalidate = 0;

export default async function FlashSalesPage() {
  const activeFlashSales = await prisma.flashSale.findMany({
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
  });

  if (activeFlashSales.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <EmptyState
          icon={Clock}
          title="No Active Flash Sales At This Moment"
          description="Our artisans release flash sales periodically for exclusive limited editions. Please subscribe to our Gazette to be notified prior to the next window."
          actionLabel="Explore Regular Catalog"
          actionHref="/shop"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {activeFlashSales.map((sale) => (
        <div key={sale.id} className="space-y-8 mb-16">
          {/* Sale Banner & Countdown Header */}
          <div className="relative rounded-3xl overflow-hidden bg-[#241813] text-[#FAF8F5] p-8 sm:p-12 border border-[#3D2B22] shadow-xl">
            {sale.bannerImage && (
              <div className="absolute inset-0 z-0">
                <Image
                  src={sale.bannerImage}
                  alt={sale.title}
                  fill
                  className="object-cover object-center opacity-30 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#170F0B] via-[#241813]/80 to-transparent" />
              </div>
            )}

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/40 text-[#DFC8A8] text-xs uppercase tracking-[0.2em] font-semibold mb-4">
                <Zap className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Limited Allocation Event</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-light mb-4">
                {sale.title}
              </h1>

              <p className="text-sm text-[#ECE5D8] font-light mb-8 leading-relaxed">
                {sale.description}
              </p>

              <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
                <span className="text-xs uppercase tracking-wider text-[#DFC8A8] font-semibold">
                  Window Closes In:
                </span>
                <CountdownTimer endDate={sale.endDate} />
              </div>
            </div>
          </div>

          {/* Flash Sale Products */}
          <div>
            <h3 className="font-serif text-2xl font-light text-[#241813] mb-6">
              Exclusive Flash Sale Creations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sale.products.map((item) => (
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
        </div>
      ))}
    </div>
  );
}
