"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/stores/cart.store";
import { useWishlistStore } from "@/stores/wishlist.store";
import { toast } from "@/stores/toast.store";
import { Badge } from "@/components/ui/Badge";
import { RatingStars } from "@/components/ui/RatingStars";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number | null;
    isFlashSale?: boolean;
    flashSalePrice?: number | null;
    stock: number;
    category?: { name: string; slug: string } | null;
    brand?: { name: string } | null;
    images?: Array<{ url: string; altText?: string | null }>;
    rating?: number;
    reviewCount?: number;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const isFavorited = isInWishlist(product.id);
  const imageUrl =
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=600&auto=format&fit=crop";

  // Effective price considering flash sale or discount
  const effectivePrice = product.isFlashSale && product.flashSalePrice
    ? product.flashSalePrice
    : product.discountPrice || product.price;

  const hasDiscount = effectivePrice < product.price;
  const discountPercent = hasDiscount
    ? calculateDiscountPercentage(product.price, effectivePrice)
    : 0;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("This item is currently out of stock.");
      return;
    }

    const res = addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: effectivePrice,
      originalPrice: product.price,
      image: imageUrl,
      quantity: 1,
      stockLimit: product.stock,
    });

    if (res.success) {
      toast.success(`${product.name} added to your shopping bag.`);
    } else {
      toast.warning(res.message);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const added = toggleWishlist({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: effectivePrice,
      discountPrice: hasDiscount ? product.price : null,
      image: imageUrl,
      inStock: !isOutOfStock,
    });

    if (added) {
      toast.success("Saved to your wishlist.");
    } else {
      toast.info("Removed from your wishlist.");
    }
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-xl overflow-hidden border border-[#E5DDCF] hover:border-[#C5A880] transition-all duration-300 hover:shadow-md">
      {/* Badges Container */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.isFlashSale && (
          <Badge variant="gold" className="shadow-sm">
            Flash Sale
          </Badge>
        )}
        {hasDiscount && !product.isFlashSale && (
          <Badge variant="danger" className="shadow-sm">
            -{discountPercent}%
          </Badge>
        )}
        {product.isNewArrival && (
          <Badge variant="default" className="bg-white/90 backdrop-blur-sm">
            New
          </Badge>
        )}
        {product.isBestSeller && (
          <Badge variant="default" className="bg-[#241813] text-[#FAF8F5]">
            Best Seller
          </Badge>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        aria-label="Add to wishlist"
        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-[#E5DDCF] flex items-center justify-center text-[#241813] hover:text-rose-600 hover:scale-105 transition-all shadow-sm cursor-pointer"
      >
        <Heart
          className={`w-4 h-4 ${
            isFavorited ? "fill-rose-600 text-rose-600" : "text-[#241813]"
          }`}
        />
      </button>

      {/* Product Image */}
      <Link
        href={`/shop/${product.slug}`}
        className="relative block w-full aspect-[4/5] bg-[#FAF8F5] overflow-hidden"
      >
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Quick Action Overlay on Hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 justify-center">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className="flex-1 h-9 bg-white/95 hover:bg-white text-[#241813] text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {isOutOfStock ? "Out of Stock" : "Quick Add"}
          </button>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category / Brand */}
        <div className="text-[11px] uppercase tracking-wider font-semibold text-[#A6875C] mb-1">
          {product.brand?.name || product.category?.name || "Eden Exclusive"}
        </div>

        {/* Title */}
        <Link href={`/shop/${product.slug}`} className="group-hover:text-[#A6875C] transition-colors">
          <h3 className="text-sm font-medium text-[#241813] line-clamp-2 mb-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mb-2.5 flex items-center">
          <RatingStars
            rating={product.rating || 5}
            reviewCount={product.reviewCount || 1}
            size="sm"
            showText
          />
        </div>

        {/* Pricing & Availability */}
        <div className="mt-auto pt-2 border-t border-[#F0EAE1] flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-[#241813]">
              {formatPrice(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#96867B] line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {isOutOfStock ? (
            <span className="text-[11px] font-semibold text-rose-600 uppercase">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="text-[11px] font-medium text-amber-600">
              Only {product.stock} left
            </span>
          ) : (
            <span className="text-[11px] text-emerald-700 font-medium">
              In Stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
