import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Package, ArrowLeft, ArrowRight } from "lucide-react";

export const revalidate = 0;

export default async function AccountOrdersPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: { select: { name: true, slug: true, images: true } },
        },
      },
    },
  });

  const statusBadge = (status: string) => {
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
    return map[status] || "default";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/account"
          className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#96867B] hover:text-[#241813] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="border-b border-[#E5DDCF] pb-6 mb-8">
        <h1 className="font-serif text-3xl font-light text-[#241813]">Consignment History</h1>
        <p className="text-sm text-[#63534B] mt-1">
          Review your previous acquisitions, current shipments, and order receipts.
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No Consignments Yet"
          description="You haven't placed any orders yet. Discover our curated collections and place your first order."
          icon={Package}
          actionLabel="Explore Collections"
          actionHref="/shop"
        />
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-[#E5DDCF] rounded-2xl overflow-hidden shadow-xs hover:border-[#A6875C] transition-all"
            >
              <div className="p-6 bg-[#FAF7F2] border-b border-[#E5DDCF] flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-[#96867B] block text-[11px] uppercase tracking-wider">Order No.</span>
                    <span className="font-mono font-bold text-[#241813]">{order.orderNumber}</span>
                  </div>
                  <div>
                    <span className="text-[#96867B] block text-[11px] uppercase tracking-wider">Date</span>
                    <span className="text-[#241813] font-medium">{formatDate(order.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-[#96867B] block text-[11px] uppercase tracking-wider">Total</span>
                    <span className="font-serif font-bold text-[#241813]">{formatPrice(order.grandTotal)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={statusBadge(order.status)}>
                    {order.status.replace(/_/g, " ")}
                  </Badge>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#A6875C] hover:text-[#241813] transition-colors ml-2"
                  >
                    View Details
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>

              <div className="p-6 divide-y divide-[#F0ECE1]">
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
                          <h4 className="font-medium text-sm text-[#241813]">{item.productName}</h4>
                          {item.variantName && (
                            <p className="text-xs text-[#96867B]">Variant: {item.variantName}</p>
                          )}
                          <p className="text-xs text-[#63534B]">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right font-serif font-medium text-sm text-[#241813]">
                        {formatPrice(item.subtotal)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
