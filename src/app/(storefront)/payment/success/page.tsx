"use client";

import React, { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Package, ArrowRight, Sparkles } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import confetti from "canvas-confetti";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "EDN-XXXX";
  const reference = searchParams.get("reference") || "";
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Clear cart once payment is confirmed
    clearCart();

    // Trigger luxury golden confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#C5A880", "#E5DDCF", "#241813", "#A6875C"],
      });
    } catch (e) {
      // Graceful fallback
    }
  }, [clearCart]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-8">
        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF2E6] border border-[#DFC8A8] text-[#A6875C] text-xs uppercase tracking-[0.2em] font-medium mb-4">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Payment Verified & Confirmed</span>
      </div>

      <h1 className="font-serif text-3xl sm:text-4xl text-[#241813] font-medium mb-3">
        Thank You, Esteemed Patron
      </h1>

      <p className="text-sm text-[#63534B] max-w-lg mb-2 leading-relaxed">
        Your consignment has been successfully registered and payment has been verified by Paystack.
        Our atelier team is preparing your order for white-glove dispatch.
      </p>

      <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 sm:p-8 max-w-md w-full mt-6 mb-8 shadow-xs">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[#96867B]">Order Number</span>
            <span className="font-mono font-bold text-[#241813]">{orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#96867B]">Payment Reference</span>
            <span className="font-mono text-xs text-[#63534B]">{reference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#96867B]">Payment Status</span>
            <span className="text-emerald-700 font-semibold uppercase text-xs">Successful</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#96867B]">Order Status</span>
            <span className="text-[#A6875C] font-semibold uppercase text-xs">Paid & Processing</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link href="/account/orders">
          <Button variant="primary" size="lg">
            <Package className="w-4 h-4 mr-2" />
            Track Your Consignment
          </Button>
        </Link>
        <Link href="/shop">
          <Button variant="secondary" size="lg">
            Continue Browsing
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <SuccessContent />
    </Suspense>
  );
}
