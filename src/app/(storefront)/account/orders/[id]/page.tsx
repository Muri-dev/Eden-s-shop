import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import {
  Package,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: session.userId,
    },
    include: {
      items: {
        include: {
          product: { select: { name: true, slug: true, images: true } },
        },
      },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) {
    notFound();
  }

  let shippingAddress: any = null;
  try {
    if (order.shippingAddressJson) {
      shippingAddress = JSON.parse(order.shippingAddressJson);
    }
  } catch (e) {
    // fallback
  }

  const stages = [
    { key: "PENDING", label: "Order Placed" },
    { key: "PAID", label: "Payment Confirmed" },
    { key: "PROCESSING", label: "In Atelier" },
    { key: "SHIPPED", label: "Dispatched" },
    { key: "DELIVERED", label: "Delivered" },
  ];

  const getStageIndex = (status: string) => {
    switch (status) {
      case "PENDING":
      case "PAYMENT_PENDING":
        return 0;
      case "PAID":
        return 1;
      case "PROCESSING":
        return 2;
      case "SHIPPED":
        return 3;
      case "DELIVERED":
        return 4;
      case "CANCELLED":
      case "REFUNDED":
      case "FAILED":
        return -1;
      default:
        return 0;
    }
  };

  const currentStageIndex = getStageIndex(order.status);
  const isCancelled = ["CANCELLED", "REFUNDED", "FAILED"].includes(order.status);
  const primaryPayment = order.payments[0];

  const statusBadgeVariant = (s: string) => {
    const map: Record<string, "success" | "warning" | "danger" | "gold" | "default"> = {
      PAID: "success", DELIVERED: "success", PROCESSING: "gold", SHIPPED: "gold",
      PENDING: "warning", PAYMENT_PENDING: "warning", CANCELLED: "danger", FAILED: "danger",
      SUCCESSFUL: "success",
    };
    return map[s] || "default";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between gap-4 mb-8">
        <Link
          href="/account/orders"
          className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#96867B] hover:text-[#241813] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Consignments
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DDCF] pb-6 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-serif text-2xl sm:text-3xl text-[#241813] font-medium">
                Consignment {order.orderNumber}
              </h1>
              <Badge variant={statusBadgeVariant(order.status)}>
                {order.status.replace(/_/g, " ")}
              </Badge>
            </div>
            <p className="text-xs text-[#96867B]">
              Registered on {formatDate(order.createdAt)} • Reference: {primaryPayment?.reference || "N/A"}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs uppercase tracking-wider text-[#96867B] block">Grand Total</span>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#A6875C]">
              {formatPrice(order.grandTotal)}
            </span>
          </div>
        </div>

        {/* Tracking Progress Stepper */}
        {!isCancelled ? (
          <div className="py-4">
            <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#E5DDCF] -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-0.5 bg-[#A6875C] -translate-y-1/2 z-0 transition-all duration-500"
                style={{
                  width: `${(Math.max(0, currentStageIndex) / (stages.length - 1)) * 100}%`,
                }}
              />

              {stages.map((stage, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div key={stage.key} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? "bg-[#241813] text-[#F3E8D6] border-2 border-[#A6875C]"
                          : "bg-white text-[#96867B] border-2 border-[#E5DDCF]"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4 text-[#DFC8A8]" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] mt-2 font-medium tracking-wide uppercase text-center ${
                        isCurrent ? "text-[#241813] font-bold" : "text-[#96867B]"
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center text-rose-800 text-sm font-medium">
            This order has been {order.status.toLowerCase()}.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs">
            <h2 className="font-serif text-xl font-medium text-[#241813] mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#A6875C]" />
              Consigned Treasures ({order.items.length})
            </h2>

            <div className="divide-y divide-[#F0ECE1]">
              {order.items.map((item) => {
                const thumbnail = item.product?.images?.[0]?.url || item.imageAtPurchase;
                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded-lg border border-[#E5DDCF]"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-[#FAF7F2] rounded-lg border border-[#E5DDCF] flex items-center justify-center text-[#96867B]">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        {item.product?.slug ? (
                          <Link
                            href={`/shop/${item.product.slug}`}
                            className="font-medium text-sm text-[#241813] hover:text-[#A6875C] transition-colors"
                          >
                            {item.productName}
                          </Link>
                        ) : (
                          <h4 className="font-medium text-sm text-[#241813]">{item.productName}</h4>
                        )}
                        {item.variantName && (
                          <p className="text-xs text-[#96867B] mt-0.5">Variant: {item.variantName}</p>
                        )}
                        <p className="text-xs text-[#63534B] mt-1">
                          {formatPrice(item.priceAtPurchase)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-serif font-semibold text-sm text-[#241813]">
                      {formatPrice(item.subtotal)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Summaries & Addresses */}
        <div className="space-y-8">
          {/* Order Summary */}
          <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs">
            <h3 className="font-serif text-lg font-medium text-[#241813] mb-4 pb-3 border-b border-[#E5DDCF]">
              Financial Ledger
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between text-[#63534B]">
                <span>Items Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#63534B]">
                <span>Concierge Delivery</span>
                <span>{order.shippingCost > 0 ? formatPrice(order.shippingCost) : "Complimentary"}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Privilege Discount</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-[#E5DDCF] pt-3 flex justify-between font-serif font-bold text-base text-[#241813]">
                <span>Total Settled</span>
                <span className="text-[#A6875C]">{formatPrice(order.grandTotal)}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5DDCF] text-xs text-[#96867B] space-y-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#A6875C]" />
                <span>Channel: {primaryPayment?.channel || "PAYSTACK"}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Status: {order.paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          {shippingAddress && (
            <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs">
              <h3 className="font-serif text-lg font-medium text-[#241813] mb-4 pb-3 border-b border-[#E5DDCF] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#A6875C]" />
                Destination Registry
              </h3>

              <div className="text-xs sm:text-sm text-[#63534B] space-y-1">
                <p className="font-semibold text-[#241813]">{shippingAddress.fullName || shippingAddress.name}</p>
                <p>{shippingAddress.addressLine1 || shippingAddress.streetAddress}</p>
                {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                <p>
                  {shippingAddress.city}, {shippingAddress.country || "Kenya"}
                </p>
                <p className="pt-2 text-xs text-[#96867B]">Contact: {shippingAddress.phone}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
