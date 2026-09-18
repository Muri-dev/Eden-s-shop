import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Search, ShoppingBag, ArrowRight } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { status, search } = await searchParams;

  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { customerEmail: { contains: search } },
      { customerName: { contains: search } },
      { paymentReference: { contains: search } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  });

  const tabs = [
    { label: "All Orders", status: "" },
    { label: "Paid", status: "PAID" },
    { label: "Processing", status: "PROCESSING" },
    { label: "Shipped", status: "SHIPPED" },
    { label: "Delivered", status: "DELIVERED" },
    { label: "Pending", status: "PENDING" },
    { label: "Cancelled", status: "CANCELLED" },
  ];

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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DDCF]">
        <div>
          <h1 className="font-serif text-3xl font-light text-[#241813]">
            Consignments & Orders
          </h1>
          <p className="text-xs text-[#63534B] mt-1">
            Fulfill client acquisitions, update tracking numbers, and view transaction records ({orders.length} found)
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-[#E5DDCF] pb-2">
          {tabs.map((tab) => {
            const isActive = (status || "") === tab.status;
            return (
              <Link
                key={tab.label}
                href={tab.status ? `/admin/orders?status=${tab.status}` : "/admin/orders"}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "bg-[#241813] text-[#FAF7F2]"
                    : "text-[#63534B] hover:bg-[#E5DDCF]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div className="bg-white border border-[#E5DDCF] rounded-2xl p-4 flex gap-4 shadow-xs">
          <form className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#96867B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="search"
                defaultValue={search || ""}
                placeholder="Search order number, customer name, email, or Paystack reference..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-[#E5DDCF] rounded-xl focus:outline-hidden focus:border-[#A6875C] bg-[#FAF7F2]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#241813] text-[#FAF7F2] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#3A2920] transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E5DDCF] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E5DDCF] text-[#96867B] uppercase tracking-wider">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EFE6]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#96867B]">
                    No consignments matched your current search or status criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#241813]">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#241813] block">{order.customerName}</span>
                      <span className="text-[11px] text-[#96867B]">{order.customerEmail}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#63534B]">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-[#63534B]">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} items
                    </td>
                    <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#241813]">
                      {formatPrice(order.grandTotal)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={statusBadge(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={statusBadge(order.status)}>
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#A6875C] hover:text-[#241813] transition-colors"
                      >
                        Inspect
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
