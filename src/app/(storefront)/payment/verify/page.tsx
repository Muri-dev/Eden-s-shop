"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart.store";
import { Loader2, ShieldCheck } from "lucide-react";

function PaymentVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCartStore();

  const reference = searchParams.get("reference");
  const [statusMessage, setStatusMessage] = useState(
    "Communicating with Paystack and verifying your payment..."
  );

  useEffect(() => {
    if (!reference) {
      router.replace("/payment/failed?message=Missing+transaction+reference");
      return;
    }

    let isSubscribed = true;

    async function checkVerification() {
      try {
        const res = await fetch(`/api/payments/verify?reference=${encodeURIComponent(reference!)}`);
        const json = await res.json();

        if (!isSubscribed) return;

        if (json.success && json.data?.status === "SUCCESSFUL") {
          clearCart(); // Clear local shopping bag
          router.replace(
            `/payment/success?orderNumber=${encodeURIComponent(
              json.data.orderNumber
            )}&reference=${encodeURIComponent(reference!)}`
          );
        } else if (json.data?.status === "FAILED") {
          router.replace(
            `/payment/failed?reference=${encodeURIComponent(reference!)}&message=${encodeURIComponent(
              json.data.message || "Payment declined."
            )}`
          );
        } else {
          // Still pending
          router.replace(`/payment/pending?reference=${encodeURIComponent(reference!)}`);
        }
      } catch (err) {
        console.error("Verification poll error:", err);
        setStatusMessage("Network verification delay. Re-attempting verification...");
        setTimeout(() => {
          if (isSubscribed) checkVerification();
        }, 3000);
      }
    }

    checkVerification();

    return () => {
      isSubscribed = false;
    };
  }, [reference, clearCart, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <div className="w-16 h-16 rounded-full bg-[#FAF2E6] border border-[#DFC8A8] flex items-center justify-center mb-6 text-[#A6875C]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>

      <h1 className="font-serif text-2xl sm:text-3xl text-[#241813] font-medium mb-3">
        Authenticating Consignment
      </h1>

      <p className="text-sm text-[#63534B] max-w-md mb-8 leading-relaxed">
        {statusMessage}
      </p>

      <div className="inline-flex items-center gap-2 text-xs text-[#96867B] bg-[#FAF8F5] px-4 py-2 rounded-full border border-[#E5DDCF]">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Do not close or reload this window</span>
      </div>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#A6875C]" />
        </div>
      }
    >
      <PaymentVerifyContent />
    </Suspense>
  );
}
