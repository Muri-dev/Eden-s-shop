import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { AdminOrderUpdater } from "@/components/admin/AdminOrderUpdater";
import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  CreditCard,
  User,
} from "lucide-react";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, images: true, sku: true },
          },
          variant: {
            select: { id: true, name: true, sku: true },
          },
        },
      },
      payments: { orderBy: { createdAt: "desc" } },
      user: { select: { id: true, name: true, email: true, phone: true } },
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

  const statusBadge = (s: string) => {
    const map: Record<string, "success" | "warning" | "danger" | "gold" | "default"> = {
      PAID: "success",
      DELIVERED: "success",
      PROCESSING: "gold",
      SHIPPED: "gold",
      PENDING: "warning",
      PAYMENT_PENDING: "warning",
      CANCELLED: "danger",
      FAILED: "danger",
    };
    return map[s] || "default";
  };

  const primaryPayment = order.payments[0];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5DDCF]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl bg-white border border-[#E5DDCF] hover:bg-[#FAF7F2] text-[#96867B] hover:text-[#241813] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#241813]">
                Order {order.orderNumber}
              </h1>
              <Badge variant={statusBadge(order.status)}>
                {order.status.replace(/_/g, " ")}
              </Badge>
            </div>
            <p className="text-xs text-[#96867B] mt-0.5">
              Registered {formatDate(order.createdAt)} • Ref: {primaryPayment?.reference || "None"}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs uppercase tracking-wider text-[#96867B] block">Total Settled</span>
          <span className="font-serif text-2xl font-bold text-[#A6875C]">
            {formatPrice(order.grandTotal)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Line Items & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Items */}
          <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs">
            <h2 className="font-serif text-lg font-medium text-[#241813] mb-4 pb-3 border-b border-[#E5DDCF] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#A6875C]" />
              Consignment Items ({order.items.length})
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
                          className="w-14 h-14 object-cover rounded-lg border border-[#E5DDCF]"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-[#FAF7F2] rounded-lg border border-[#E5DDCF] flex items-center justify-center text-[#96867B]">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-sm text-[#241813]">{item.productName}</h4>
                        <p className="font-mono text-[11px] text-[#96867B]">SKU: {item.sku}</p>
                        {item.variantName && (
                          <p className="text-xs text-[#96867B]">Variant: {item.variantName}</p>
                        )}
                        <p className="text-xs text-[#63534B] mt-0.5">
                          {formatPrice(item.priceAtPurchase)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-serif font-bold text-sm text-[#241813]">
                      {formatPrice(item.subtotal)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Ledger */}
            <div className="mt-6 pt-4 border-t border-[#E5DDCF] space-y-2 text-xs">
              <div className="flex justify-between text-[#63534B]">
                <span>Items Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#63534B]">
                <span>Shipping Cost</span>
                <span>{order.shippingCost > 0 ? formatPrice(order.shippingCost) : "Complimentary"}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Privilege Discount</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-[#E5DDCF] pt-2 flex justify-between font-serif font-bold text-base text-[#241813]">
                <span>Grand Total</span>
                <span className="text-[#A6875C]">{formatPrice(order.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs">
              <h2 className="font-serif text-lg font-medium text-[#241813] mb-3 pb-2 border-b border-[#E5DDCF] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#A6875C]" />
                Atelier Notes & Instructions
              </h2>
              <p className="text-xs text-[#63534B] leading-relaxed whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Right 1 Col: Controls, Patron, Shipping */}
        <div className="space-y-6">
          {/* Order Actions */}
          <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs">
            <h3 className="font-serif text-lg font-medium text-[#241813] pb-3 border-b border-[#E5DDCF] mb-4">
              Atelier Management
            </h3>
            <AdminOrderUpdater
              orderId={order.id}
              initialStatus={order.status}
              initialPaymentStatus={order.paymentStatus}
              initialInternalNotes={order.notes}
            />
          </div>

          {/* Customer Details */}
          <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs">
            <h3 className="font-serif text-lg font-medium text-[#241813] pb-3 border-b border-[#E5DDCF] mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#A6875C]" />
              Patron Profile
            </h3>
            <div className="text-xs space-y-1 text-[#63534B]">
              <p className="font-semibold text-sm text-[#241813]">{order.customerName}</p>
              <p>{order.customerEmail}</p>
              {order.customerPhone && <p>{order.customerPhone}</p>}
            </div>
          </div>

          {/* Shipping Destination */}
          {shippingAddress && (
            <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs">
              <h3 className="font-serif text-lg font-medium text-[#241813] pb-3 border-b border-[#E5DDCF] mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#A6875C]" />
                Delivery Address
              </h3>
              <div className="text-xs space-y-1 text-[#63534B]">
                <p className="font-semibold text-[#241813]">{shippingAddress.fullName || shippingAddress.name}</p>
                <p>{shippingAddress.addressLine1 || shippingAddress.streetAddress}</p>
                {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                <p>
                  {shippingAddress.city}, {shippingAddress.country || "Kenya"}
                </p>
                <p className="pt-2 text-[11px] text-[#96867B]">Tel: {shippingAddress.phone}</p>
              </div>
            </div>
          )}

          {/* Payment Snapshot */}
          <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs">
            <h3 className="font-serif text-lg font-medium text-[#241813] pb-3 border-b border-[#E5DDCF] mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#A6875C]" />
              Payment Records
            </h3>
            <div className="text-xs space-y-2 text-[#63534B]">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="font-semibold text-[#241813]">{primaryPayment?.channel || "PAYSTACK"}</span>
              </div>
              <div className="flex justify-between">
                <span>Reference</span>
                <span className="font-mono text-[11px] text-[#241813]">{primaryPayment?.reference || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <Badge variant={statusBadge(order.paymentStatus)}>{order.paymentStatus}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
