"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Clock, RefreshCcw, ArrowRight } from "lucide-react";

function PendingContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || "";

  const handleRefresh = () => {
    if (reference) {
      window.location.href = `/payment/verify?reference=${encodeURIComponent(reference)}`;
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mb-8">
        <Clock className="w-10 h-10 text-amber-600" />
      </div>

      <h1 className="font-serif text-3xl sm:text-4xl text-[#241813] font-medium mb-3">
        Payment Processing
      </h1>

      <p className="text-sm text-[#63534B] max-w-lg mb-2 leading-relaxed">
        Your M-Pesa or card payment is still being processed by Paystack. This may take a moment
        as Safaricom authorizes the mobile money transfer.
      </p>
      <p className="text-xs text-[#96867B] mb-8">
        Please check your phone for the M-Pesa PIN prompt if you selected mobile money.
        {reference && <span className="block mt-1">Reference: {reference}</span>}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Button variant="primary" size="lg" onClick={handleRefresh}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Re-Check Payment Status
        </Button>
        <Link href="/account/orders">
          <Button variant="secondary" size="lg">
            View My Orders
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <PendingContent />
    </Suspense>
  );
}
