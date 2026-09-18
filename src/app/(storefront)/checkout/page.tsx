"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart.store";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/stores/toast.store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  ArrowRight,
  Sparkles,
  Phone,
} from "lucide-react";

interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  cost: number;
  estimatedDays?: string;
  minOrderForFree?: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    appliedCoupon,
    getSubtotal,
    getDiscountAmount,
    shippingCost,
    setShippingMethod,
    selectedShippingMethodId,
  } = useCartStore();

  const [isMounted, setIsMounted] = useState(false);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [isLoadingShipping, setIsLoadingShipping] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("Nairobi");
  const [postalCode, setPostalCode] = useState("00100");
  const [country, setCountry] = useState("Kenya");
  const [notes, setNotes] = useState("");

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const grandTotal = Math.max(0, subtotal - discount + shippingCost);

  // Load active shipping methods
  useEffect(() => {
    async function loadShippingMethods() {
      try {
        const res = await fetch("/api/shipping-methods");
        const data = await res.json();
        if (data.success && data.methods.length > 0) {
          setShippingMethods(data.methods);

          // Select first method by default if none selected
          if (!selectedShippingMethodId) {
            const first = data.methods[0];
            const cost =
              first.minOrderForFree && subtotal >= first.minOrderForFree
                ? 0
                : first.cost;
            setShippingMethod(first.id, cost);
          }
        }
      } catch (e) {
        console.error("Failed to load shipping methods:", e);
      } finally {
        setIsLoadingShipping(false);
      }
    }

    loadShippingMethods();
  }, [selectedShippingMethodId, setShippingMethod, subtotal]);

  // Handle shipping method change
  const handleSelectShipping = (method: ShippingMethod) => {
    const cost =
      method.minOrderForFree && subtotal >= method.minOrderForFree
        ? 0
        : method.cost;
    setShippingMethod(method.id, cost);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      toast.warning("Please fill in your name, email, and phone number.");
      return;
    }

    // Phone number validation for Kenya / M-Pesa format
    const cleanPhone = customerPhone.replace(/\s+/g, "");
    if (cleanPhone.length < 9) {
      toast.warning("Please provide a valid Safaricom phone number for M-Pesa payment.");
      return;
    }

    if (!streetAddress.trim() || !city.trim()) {
      toast.warning("Please complete your delivery address details.");
      return;
    }

    if (!selectedShippingMethodId) {
      toast.warning("Please select a courier dispatch option.");
      return;
    }

    setIsProcessing(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: cleanPhone,
        shippingAddress: {
          fullName: customerName.trim(),
          phone: cleanPhone,
          streetAddress: streetAddress.trim(),
          apartment: apartment.trim() || undefined,
          city: city.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
        },
        shippingMethodId: selectedShippingMethodId,
        couponCode: appliedCoupon?.code || null,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId || null,
          quantity: i.quantity,
        })),
        notes: notes.trim() || undefined,
      };

      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!result.success) {
        toast.error(result.message || "Checkout initialization failed.");
        setIsProcessing(false);
        return;
      }

      toast.success("Order registered. Connecting to Paystack payment gateway...");

      // Redirect customer to Paystack authorization URL
      if (result.data?.authorizationUrl) {
        window.location.href = result.data.authorizationUrl;
      } else {
        toast.error("Failed to receive payment authorization URL.");
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error("Payment initialization error:", err);
      toast.error("A network interruption occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-pulse">
        <div className="h-8 w-56 bg-[#E5DDCF] rounded mb-8" />
        <div className="h-96 bg-[#F2ECE1] rounded-2xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <EmptyState
          icon={ShoppingBag}
          title="No Creations in Your Shopping Bag"
          description="Your bag is empty. Please select your desired creations from our vault before proceeding to checkout."
          actionLabel="Return to Catalog"
          actionHref="/shop"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF2E6] border border-[#DFC8A8] text-[#A6875C] text-xs uppercase tracking-[0.2em] font-medium mb-3">
          <Lock className="w-3.5 h-3.5" />
          <span>Encrypted Luxury Checkout</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#241813]">
          Finalize Consignment
        </h1>
        <p className="text-xs text-[#96867B] uppercase tracking-wider mt-1">
          Paystack Gateway | M-Pesa & International Cards Accepted
        </p>
      </div>

      <form onSubmit={handlePay}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT: Checkout Information Stages (7 cols) */}
          <div className="lg:col-span-7 space-y-10">
            {/* Step 1: Patron Contact Details */}
            <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#F0EAE1]">
                <div className="w-7 h-7 rounded-full bg-[#241813] text-[#FAF8F5] text-xs font-semibold flex items-center justify-center">
                  1
                </div>
                <h3 className="font-serif text-lg font-medium text-[#241813]">
                  Patron Contact Information
                </h3>
              </div>

              <div className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="e.g. Alexander Vance"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email Address (for order tracking)"
                    type="email"
                    placeholder="alexander@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                  />

                  <div>
                    <Input
                      label="Phone Number (Safaricom M-Pesa)"
                      type="tel"
                      placeholder="0712 345 678 or +254..."
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                    />
                    <p className="text-[11px] text-[#96867B] mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#A6875C]" />
                      Used for M-Pesa push prompt and private delivery driver contact
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Address */}
            <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#F0EAE1]">
                <div className="w-7 h-7 rounded-full bg-[#241813] text-[#FAF8F5] text-xs font-semibold flex items-center justify-center">
                  2
                </div>
                <h3 className="font-serif text-lg font-medium text-[#241813]">
                  Destination & Delivery Address
                </h3>
              </div>

              <div className="space-y-4">
                <Input
                  label="Street Address / Residence"
                  placeholder="e.g. Peponi Road, Villa 8"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  required
                />

                <Input
                  label="Apartment, Suite, or Estate Gate (Optional)"
                  placeholder="e.g. Penthouse 4B / Nyari Gate 2"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-[#63534B] mb-1.5">
                      City / County
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-11 px-3 bg-white border border-[#E5DDCF] rounded-lg text-sm text-[#241813] focus:outline-none focus:border-[#C5A880]"
                    >
                      <option value="Nairobi">Nairobi</option>
                      <option value="Mombasa">Mombasa</option>
                      <option value="Kisumu">Kisumu</option>
                      <option value="Nakuru">Nakuru</option>
                      <option value="Eldoret">Eldoret</option>
                      <option value="Naivasha">Naivasha</option>
                      <option value="Malindi">Malindi</option>
                      <option value="Other">Other Kenya County</option>
                    </select>
                  </div>

                  <Input
                    label="Postal Code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />

                  <Input
                    label="Country"
                    value={country}
                    readOnly
                    className="bg-[#FAF8F5] cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#63534B] mb-1.5">
                    Concierge Dispatch Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Please ring private security intercom upon arrival..."
                    className="w-full p-3 bg-white border border-[#E5DDCF] rounded-lg text-xs text-[#241813] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Courier Selection */}
            <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#F0EAE1]">
                <div className="w-7 h-7 rounded-full bg-[#241813] text-[#FAF8F5] text-xs font-semibold flex items-center justify-center">
                  3
                </div>
                <h3 className="font-serif text-lg font-medium text-[#241813]">
                  Select Courier Method
                </h3>
              </div>

              {isLoadingShipping ? (
                <div className="text-xs text-[#96867B] py-4">
                  Calculating available courier services...
                </div>
              ) : (
                <div className="space-y-3">
                  {shippingMethods.map((method) => {
                    const isSelected = selectedShippingMethodId === method.id;
                    const isFree =
                      method.minOrderForFree && subtotal >= method.minOrderForFree;
                    const displayCost = isFree ? 0 : method.cost;

                    return (
                      <div
                        key={method.id}
                        onClick={() => handleSelectShipping(method)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-[#241813] bg-[#F4EFE6]"
                            : "border-[#E5DDCF] hover:border-[#A6875C] bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            checked={isSelected}
                            readOnly
                            className="w-4 h-4 accent-[#241813]"
                          />
                          <div>
                            <div className="text-sm font-semibold text-[#241813]">
                              {method.name}
                            </div>
                            <div className="text-xs text-[#96867B] mt-0.5">
                              {method.description} • {method.estimatedDays}
                            </div>
                          </div>
                        </div>

                        <div className="text-sm font-bold text-[#241813]">
                          {displayCost === 0 ? (
                            <span className="text-emerald-700 uppercase text-xs">
                              Complimentary
                            </span>
                          ) : (
                            formatPrice(displayCost)
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Authoritative Order Summary & Paystack Action (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 sm:p-8 shadow-md sticky top-28 space-y-6">
              <h3 className="font-serif text-xl font-medium text-[#241813] pb-4 border-b border-[#F0EAE1]">
                Consignment Overview
              </h3>

              {/* Items Mini List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-[#F0EAE1]">
                {items.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                    <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-[#FAF8F5] border border-[#E5DDCF] shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover object-center"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-[#241813] truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-[#96867B]">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-[#241813]">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-[#F0EAE1] text-xs">
                <div className="flex justify-between text-[#63534B]">
                  <span>Creations Subtotal</span>
                  <span className="font-semibold text-[#241813]">{formatPrice(subtotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Privilege Code ({appliedCoupon.code})</span>
                    <span className="font-semibold">-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#63534B]">
                  <span>Courier Dispatch</span>
                  <span className="font-semibold text-[#241813]">
                    {shippingCost === 0 ? "Complimentary" : formatPrice(shippingCost)}
                  </span>
                </div>

                <div className="pt-4 border-t border-[#F0EAE1] flex justify-between items-baseline">
                  <span className="font-serif text-base font-semibold text-[#241813]">
                    Authoritative Total
                  </span>
                  <span className="font-serif text-2xl font-bold text-[#241813]">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Payment Gateway Explanation (Rule 7: Internal Locus of Control) */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DDCF] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#241813]">
                  <CreditCard className="w-4 h-4 text-[#A6875C]" />
                  <span>Paystack Gateway Routing</span>
                </div>
                <p className="text-[11px] text-[#63534B] leading-relaxed">
                  Upon clicking below, you will be transferred to Paystack&apos;s PCI-DSS Level 1 certified portal. Select <strong>M-Pesa</strong> to enter your phone PIN, or pay with Visa / Mastercard.
                </p>
              </div>

              {/* Submit Pay Button */}
              <Button
                type="submit"
                variant="gold"
                size="lg"
                isLoading={isProcessing}
                className="w-full h-14 uppercase tracking-wider text-xs font-bold shadow-md"
              >
                {isProcessing ? (
                  "Securing Authorization..."
                ) : (
                  <>
                    <span>Pay {formatPrice(grandTotal)} with M-Pesa / Card</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-3 text-[11px] text-[#96867B]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero Storage of Card PINs • Direct M-Pesa STK Push</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
