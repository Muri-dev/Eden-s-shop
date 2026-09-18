"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { XCircle, ArrowRight, RefreshCcw } from "lucide-react";

function FailedContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "Your payment could not be completed.";
  const reference = searchParams.get("reference") || "";

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <div className="w-20 h-20 rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center mb-8">
        <XCircle className="w-10 h-10 text-rose-600" />
      </div>

      <h1 className="font-serif text-3xl sm:text-4xl text-[#241813] font-medium mb-3">
        Payment Was Not Completed
      </h1>

      <p className="text-sm text-[#63534B] max-w-lg mb-2 leading-relaxed">
        {message}
      </p>
      <p className="text-xs text-[#96867B] mb-8">
        Your shopping bag items have been preserved. No charges have been applied.
        {reference && <span className="block mt-1">Reference: {reference}</span>}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link href="/checkout">
          <Button variant="primary" size="lg">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Retry Checkout
          </Button>
        </Link>
        <Link href="/cart">
          <Button variant="secondary" size="lg">
            Return to Bag
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <FailedContent />
    </Suspense>
  );
}
