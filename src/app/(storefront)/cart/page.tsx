"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/stores/cart.store";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/stores/toast.store";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Sparkles,
  Tag,
  ShieldCheck,
} from "lucide-react";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscountAmount,
    getGrandTotal,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const grandTotal = getGrandTotal();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) {
      toast.warning("Please enter a privilege code.");
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });

      const data = await res.json();
      if (data.success) {
        applyCoupon(data.coupon);
        toast.success(data.message || "Privilege applied successfully.");
        setCouponInput("");
      } else {
        toast.error(data.message || "Invalid or ineligible privilege code.");
      }
    } catch {
      toast.error("Unable to validate privilege code at this moment.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-pulse">
        <div className="h-8 w-48 bg-[#E5DDCF] rounded mb-8" />
        <div className="h-64 bg-[#F2ECE1] rounded-2xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Bag is Empty"
          description="You have not yet selected any creations from our vault. Explore our Swiss horology, fine Tuscan leather goods, and haute perfumes."
          actionLabel="Explore The Vault"
          actionHref="/shop"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#E5DDCF]">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#241813]">
            Shopping Bag
          </h1>
          <p className="text-xs uppercase tracking-wider text-[#96867B] mt-1">
            {items.length} {items.length === 1 ? "Unique Creation" : "Unique Creations"} Selected
          </p>
        </div>

        <button
          onClick={() => {
            clearCart();
            toast.info("Shopping bag emptied.");
          }}
          className="text-xs text-[#96867B] hover:text-rose-600 transition-colors uppercase tracking-wider cursor-pointer"
        >
          Clear Bag
        </button>
      </div>

      {/* Main Grid: Bag Items List (8 cols) & Order Summary (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Bag Items List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="divide-y divide-[#F0EAE1]">
            {items.map((item) => {
              const lineTotal = item.price * item.quantity;

              return (
                <div key={item.id} className="py-6 flex gap-4 sm:gap-6 items-start">
                  {/* Item Image */}
                  <Link
                    href={`/shop/${item.slug}`}
                    className="relative w-24 sm:w-28 aspect-[4/5] rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#E5DDCF] shrink-0"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover object-center"
                    />
                  </Link>

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col justify-between min-h-24 sm:min-h-28">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/shop/${item.slug}`}
                          className="font-serif text-base sm:text-lg text-[#241813] hover:text-[#A6875C] transition-colors"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => {
                            removeItem(item.id);
                            toast.info(`${item.name} removed from bag.`);
                          }}
                          className="text-[#96867B] hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Variant details if any */}
                      {(item.variantName || item.size || item.color) && (
                        <p className="text-xs text-[#96867B] mt-1">
                          Specification: {item.variantName || `${item.size || ""} ${item.color || ""}`.trim()}
                        </p>
                      )}

                      <div className="text-xs text-[#63534B] mt-1">
                        Unit Price: {formatPrice(item.price)}
                      </div>
                    </div>

                    {/* Quantity & Subtotal Row */}
                    <div className="flex justify-between items-center mt-4">
                      {/* +/- Selector */}
                      <div className="flex items-center border border-[#E5DDCF] bg-white rounded-lg h-9 px-1.5">
                        <button
                          type="button"
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-[#241813] hover:text-[#A6875C] disabled:opacity-30 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-[#241813]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={item.quantity >= item.stockLimit}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-[#241813] hover:text-[#A6875C] disabled:opacity-30 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Subtotal */}
                      <div className="text-base font-semibold text-[#241813]">
                        {formatPrice(lineTotal)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional notes or perks */}
          <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E5DDCF] flex items-center gap-3 text-xs text-[#63534B]">
            <ShieldCheck className="w-5 h-5 text-[#A6875C] shrink-0" />
            <span>
              All orders are hand-packaged with individually certified seals and protected by Eden&apos;s White-Glove transit insurance.
            </span>
          </div>
        </div>

        {/* Right: Order Summary Box (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 sticky top-28">
            <h3 className="font-serif text-xl font-medium text-[#241813] pb-4 border-b border-[#F0EAE1]">
              Order Summary
            </h3>

            {/* Subtotal / Discount / Total */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[#63534B]">
                <span>Bag Subtotal</span>
                <span className="font-semibold text-[#241813]">{formatPrice(subtotal)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Privilege ({appliedCoupon.code})</span>
                  </div>
                  <span className="font-semibold">-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#63534B]">
                <span>Concierge Delivery</span>
                <span className="text-xs text-[#96867B] font-medium">Calculated at Checkout</span>
              </div>

              <div className="pt-4 border-t border-[#F0EAE1] flex justify-between items-baseline">
                <span className="font-serif text-lg text-[#241813] font-medium">
                  Estimated Total
                </span>
                <span className="font-serif text-2xl font-semibold text-[#241813]">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {/* Privilege Coupon Form */}
            <div className="pt-4 border-t border-[#F0EAE1]">
              <label
                htmlFor="coupon-code-input"
                className="text-xs uppercase tracking-wider font-semibold text-[#63534B] block mb-2"
              >
                Privilege or Gift Code
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">{appliedCoupon.code} Applied</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-rose-600 hover:underline uppercase font-bold text-[10px] cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    id="coupon-code-input"
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="e.g. EDENLUXURY20"
                    className="flex-1 h-10 px-3 uppercase text-xs tracking-wider bg-[#FAF8F5] border border-[#E5DDCF] rounded-lg focus:outline-none focus:border-[#C5A880]"
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    isLoading={isApplyingCoupon}
                  >
                    Apply
                  </Button>
                </form>
              )}
            </div>

            {/* Checkout Action Button */}
            <Link href="/checkout" className="block">
              <Button
                variant="primary"
                size="lg"
                className="w-full h-13 uppercase tracking-wider text-xs font-bold"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <p className="text-[11px] text-center text-[#96867B]">
              Secured with 256-bit SSL encryption. Safaricom M-Pesa & Paystack ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
