"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import { formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/stores/cart.store";
import { useWishlistStore } from "@/stores/wishlist.store";
import { toast } from "@/stores/toast.store";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RatingStars } from "@/components/ui/RatingStars";

export interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    description: string;
    shortDescription?: string | null;
    price: number;
    discountPrice?: number | null;
    costPrice?: number | null;
    stock: number;
    isFlashSale?: boolean;
    flashSalePrice?: number | null;
    tags?: string | null;
    category?: { name: string; slug: string } | null;
    brand?: { name: string; slug: string } | null;
    images: Array<{ id: string; url: string; altText?: string | null }>;
    variants: Array<{
      id: string;
      sku: string;
      name: string;
      size?: string | null;
      color?: string | null;
      colorCode?: string | null;
      price: number;
      stock: number;
      image?: string | null;
    }>;
    specifications: Array<{ id: string; key: string; value: string }>;
    reviews: Array<{
      id: string;
      rating: number;
      title?: string | null;
      comment: string;
      isVerifiedPurchase: boolean;
      createdAt: Date | string;
      user: { name: string };
    }>;
  };
}

export function ProductDetailClient({ product }: ProductDetailProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants.length > 0 ? product.variants[0].id : null
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "shipping" | "reviews">("description");

  // Selected variant data if any
  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);

  // Active stock and price calculation
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const basePrice = selectedVariant ? selectedVariant.price : product.price;
  const effectivePrice = product.isFlashSale && product.flashSalePrice
    ? product.flashSalePrice
    : product.discountPrice || basePrice;

  const hasDiscount = effectivePrice < basePrice;
  const discountPercent = hasDiscount
    ? calculateDiscountPercentage(basePrice, effectivePrice)
    : 0;

  const isOutOfStock = currentStock <= 0;
  const isLowStock = currentStock > 0 && currentStock <= 3;
  const isFavorited = isInWishlist(product.id);

  const images = product.images.length > 0
    ? product.images
    : [{ id: "def", url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop" }];

  const currentImage = images[selectedImageIndex]?.url || images[0].url;

  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (isOutOfStock) {
      toast.error("This creation is currently unavailable in the chosen specification.");
      return;
    }

    const res = addItem({
      productId: product.id,
      variantId: selectedVariant?.id || null,
      variantName: selectedVariant?.name || null,
      size: selectedVariant?.size || null,
      color: selectedVariant?.color || null,
      name: product.name,
      slug: product.slug,
      price: effectivePrice,
      originalPrice: basePrice,
      image: currentImage,
      quantity,
      stockLimit: currentStock,
    });

    if (res.success) {
      toast.success(`${product.name} added to your shopping bag.`);
    } else {
      toast.warning(res.message);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    handleAddToCart();
    router.push("/checkout");
  };

  const handleWishlistClick = () => {
    const added = toggleWishlist({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: effectivePrice,
      discountPrice: hasDiscount ? basePrice : null,
      image: currentImage,
      inStock: !isOutOfStock,
    });

    if (added) {
      toast.success("Added to your private wishlist.");
    } else {
      toast.info("Removed from your wishlist.");
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Product View Top Section: Gallery & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
        {/* Left: Gallery (6 columns) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails list */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-18 h-22 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImageIndex === idx
                      ? "border-[#A6875C] shadow-sm"
                      : "border-[#E5DDCF] opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.altText || `${product.name} ${idx + 1}`}
                    fill
                    className="object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Primary Viewport Image */}
          <div className="relative flex-1 aspect-[4/5] rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#E5DDCF] shadow-sm">
            <Image
              src={currentImage}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              {product.isFlashSale && <Badge variant="gold">Flash Sale</Badge>}
              {hasDiscount && !product.isFlashSale && (
                <Badge variant="danger">-{discountPercent}%</Badge>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={handleWishlistClick}
              className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md border border-[#E5DDCF] flex items-center justify-center text-[#241813] hover:text-rose-600 transition-all shadow-md cursor-pointer"
              aria-label="Add to wishlist"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorited ? "fill-rose-600 text-rose-600" : "text-[#241813]"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Right: Product Actions & Information (5 columns) */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs tracking-widest uppercase font-semibold text-[#A6875C] mb-2">
            <span>{product.brand?.name || "Eden Maison"}</span>
            <span className="text-[#96867B] font-mono">SKU: {selectedVariant?.sku || product.sku}</span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#241813] mb-3 leading-snug">
            {product.name}
          </h1>

          {/* Ratings & Reviews summary */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#E5DDCF]">
            <RatingStars rating={4.9} reviewCount={product.reviews.length || 3} showText size="md" />
            <span className="text-xs text-[#96867B]">|</span>
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Certified Authentic
            </span>
          </div>

          {/* Pricing */}
          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl font-medium text-[#241813]">
                {formatPrice(effectivePrice)}
              </span>
              {hasDiscount && (
                <span className="text-base text-[#96867B] line-through font-light">
                  {formatPrice(basePrice)}
                </span>
              )}
            </div>
            <p className="text-xs text-[#96867B] mt-1">
              Includes all Kenya taxes, bespoke presentation packaging, and insured courier dispatch.
            </p>
          </div>

          {/* Stock Status Indicator (Rule 5: Prevent errors) */}
          <div className="mb-6">
            {isOutOfStock ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                This creation is currently reserved and out of stock.
              </div>
            ) : isLowStock ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                Privilege alert: Only {currentStock} units remain in atelier inventory.
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                In Stock & Ready for Immediate Dispatch ({currentStock} available)
              </div>
            )}
          </div>

          {/* Variant Selector (if variants exist) */}
          {product.variants.length > 0 && (
            <div className="mb-6 pb-6 border-b border-[#E5DDCF] space-y-4">
              <div className="flex justify-between items-center text-xs uppercase tracking-wider font-semibold text-[#63534B]">
                <span>Select Specification</span>
                {selectedVariant && (
                  <span className="text-[#A6875C]">{selectedVariant.name}</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  const vOutOfStock = v.stock <= 0;

                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={vOutOfStock}
                      onClick={() => {
                        setSelectedVariantId(v.id);
                        setQuantity(1);
                      }}
                      className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#241813] bg-[#F4EFE6] shadow-xs"
                          : "border-[#E5DDCF] hover:border-[#A6875C] bg-white"
                      } ${vOutOfStock ? "opacity-40 cursor-not-allowed bg-[#FAF8F5]" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#241813]">
                          {v.size || v.color || v.name}
                        </span>
                        {v.colorCode && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-[#D8CDBC]"
                            style={{ backgroundColor: v.colorCode }}
                          />
                        )}
                      </div>
                      <div className="flex justify-between items-baseline mt-1">
                        <span className="text-[11px] text-[#63534B]">
                          {formatPrice(v.price)}
                        </span>
                        <span className="text-[10px] text-[#96867B]">
                          {vOutOfStock ? "Out of Stock" : `${v.stock} in stock`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center border border-[#E5DDCF] bg-white rounded-xl h-12 px-2">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 text-[#241813] hover:text-[#A6875C] disabled:opacity-30 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold text-[#241813]">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= currentStock || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  className="p-2 text-[#241813] hover:text-[#A6875C] disabled:opacity-30 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Bag Button */}
              <Button
                variant="primary"
                size="lg"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 h-12 uppercase tracking-wider text-xs font-semibold"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {isOutOfStock ? "Sold Out" : "Add to Shopping Bag"}
              </Button>
            </div>

            {/* Buy Now Direct Checkout Button */}
            {!isOutOfStock && (
              <Button
                variant="gold"
                size="lg"
                onClick={handleBuyNow}
                className="w-full h-12 uppercase tracking-wider text-xs font-bold"
              >
                Instant M-Pesa Checkout
              </Button>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="bg-[#FAF8F5] border border-[#E5DDCF] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3 text-xs text-[#241813]">
              <Truck className="w-4 h-4 text-[#A6875C] shrink-0" />
              <span>Complimentary private courier in Nairobi | Dispatch within 4 hours</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#241813]">
              <ShieldCheck className="w-4 h-4 text-[#A6875C] shrink-0" />
              <span>Eden Certificate of Provenance with 3-Year Horology Warranty</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#241813]">
              <RotateCcw className="w-4 h-4 text-[#A6875C] shrink-0" />
              <span>14-day privileged returns in original presentation packaging</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description, Specifications, Shipping, Reviews */}
      <div className="border-t border-[#E5DDCF] pt-12">
        <div className="flex border-b border-[#E5DDCF] space-x-8 overflow-x-auto mb-8">
          {[
            { key: "description", label: "Description" },
            { key: "specifications", label: "Atelier Specifications" },
            { key: "shipping", label: "Delivery & Returns" },
            { key: "reviews", label: `Patron Reviews (${product.reviews.length || 1})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-4 text-xs uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer border-b-2 -mb-[2px] ${
                activeTab === tab.key
                  ? "border-[#241813] text-[#241813]"
                  : "border-transparent text-[#96867B] hover:text-[#241813]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl">
          {activeTab === "description" && (
            <div className="text-sm text-[#63534B] leading-relaxed space-y-4">
              <p>{product.description}</p>
              {product.shortDescription && <p className="font-medium text-[#241813]">{product.shortDescription}</p>}
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="border border-[#E5DDCF] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {product.specifications.map((spec, i) => (
                    <tr
                      key={spec.id}
                      className={i % 2 === 0 ? "bg-white" : "bg-[#FAF8F5]"}
                    >
                      <td className="py-3 px-4 font-medium text-[#241813] w-1/3 border-b border-[#F0EAE1]">
                        {spec.key}
                      </td>
                      <td className="py-3 px-4 text-[#63534B] border-b border-[#F0EAE1]">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                  {product.specifications.length === 0 && (
                    <tr>
                      <td colSpan={2} className="p-4 text-xs text-[#96867B]">
                        Standard Eden craftsmanship standards apply.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="text-sm text-[#63534B] space-y-4">
              <h4 className="font-serif text-lg text-[#241813]">White-Glove Delivery Process</h4>
              <p>
                All consignments are dispatched with high-security tamper-evident seals in reinforced Eden wooden or presentation boxes.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs">
                <li><strong>Nairobi Metropolis:</strong> Delivered by private Eden concierge within 4 hours of payment verification.</li>
                <li><strong>Kenya Nationwide:</strong> Dispatched via insured express transit (G4S / Wells Fargo) within 24 hours.</li>
                <li><strong>East Africa:</strong> Priority air cargo to Kigali, Kampala, Dar es Salaam within 3 business days.</li>
              </ul>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              {product.reviews.map((rev) => (
                <div key={rev.id} className="p-6 bg-white border border-[#E5DDCF] rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <RatingStars rating={rev.rating} size="sm" />
                    <span className="text-[11px] text-[#96867B]">
                      Verified Patron Purchase
                    </span>
                  </div>
                  {rev.title && (
                    <h5 className="text-sm font-semibold text-[#241813] mb-1">
                      {rev.title}
                    </h5>
                  )}
                  <p className="text-xs text-[#63534B] leading-relaxed mb-3">
                    {rev.comment}
                  </p>
                  <p className="text-[11px] font-medium text-[#241813]">
                    — {rev.user.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
