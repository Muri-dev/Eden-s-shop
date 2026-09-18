import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [
    orders,
    totalOrdersCount,
    totalProductsCount,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.findMany({
      where: { status: { notIn: ["CANCELLED", "FAILED"] } },
      select: { grandTotal: true },
    }),
    prisma.order.count(),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
    prisma.product.findMany({
      where: {
        stock: { lte: 5 },
        status: "PUBLISHED",
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        lowStockThreshold: true,
        price: true,
      },
      take: 5,
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    }),
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);

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
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DDCF]">
        <div>
          <h1 className="font-serif text-3xl font-light text-[#241813]">
            Executive Overview
          </h1>
          <p className="text-xs text-[#63534B] mt-1">
            Logged in as <span className="font-semibold text-[#241813]">{session.name}</span> ({session.role})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A6875C] hover:bg-[#8C6D43] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Product
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#DFC8A8] text-[#241813] hover:bg-[#FAF7F2] text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#96867B]">
              Gross Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#241813] mt-3">
            {formatPrice(totalRevenue)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Settled across verified orders</span>
          </div>
        </div>

        <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#96867B]">
              Total Consignments
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#A6875C] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#241813] mt-3">
            {totalOrdersCount}
          </div>
          <div className="text-xs text-[#63534B] mt-2">All-time order volume</div>
        </div>

        <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#96867B]">
              Active Catalog
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#241813] mt-3">
            {totalProductsCount}
          </div>
          <div className="text-xs text-[#63534B] mt-2">Fine jewelry & couture pieces</div>
        </div>

        <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#96867B]">
              Stock Alerts
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#241813] mt-3">
            {lowStockProducts.length}
          </div>
          <div className="text-xs text-rose-600 mt-2 font-medium">Pieces requiring atelier restock</div>
        </div>
      </div>

      {/* Main Content: Recent Orders & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Orders Table */}
        <div className="lg:col-span-2 bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#E5DDCF]">
            <h2 className="font-serif text-xl font-medium text-[#241813] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#A6875C]" />
              Recent Consignments
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs uppercase tracking-wider font-semibold text-[#A6875C] hover:text-[#241813] flex items-center gap-1 transition-colors"
            >
              All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5DDCF] text-[#96867B] uppercase tracking-wider">
                  <th className="py-3 px-2">Order #</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Total</th>
                  <th className="py-3 px-2">Payment</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EFE6]">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3 px-2 font-mono font-bold text-[#241813]">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-medium text-[#241813] block">{order.customerName}</span>
                      <span className="text-[11px] text-[#96867B]">{order.customerEmail}</span>
                    </td>
                    <td className="py-3 px-2 font-serif font-semibold text-[#241813]">
                      {formatPrice(order.grandTotal)}
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant={statusBadge(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant={statusBadge(order.status)}>
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-xs font-semibold text-[#A6875C] hover:underline"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Low Stock Alerts & Quick Insights */}
        <div className="space-y-6">
          {/* Low Stock Widget */}
          <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5DDCF]">
              <h3 className="font-serif text-lg font-medium text-[#241813] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Atelier Low Stock
              </h3>
              <Link
                href="/admin/inventory"
                className="text-[11px] uppercase font-bold text-[#A6875C] hover:underline"
              >
                Inventory
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-emerald-700 font-medium py-4 text-center">
                All inventory levels currently within safe reserve thresholds.
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-[#FAF7F2] border border-[#E5DDCF] rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#241813] block line-clamp-1">{p.name}</span>
                      <span className="text-[10px] text-[#96867B]">SKU: {p.sku}</span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          p.stock === 0
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {p.stock} left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Nav Card */}
          <div className="bg-gradient-to-br from-[#241813] to-[#1A120E] text-[#FAF7F2] rounded-2xl p-6 shadow-md border border-[#3A2920]">
            <div className="flex items-center gap-2 text-[#DFC8A8] text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Production Platform</span>
            </div>
            <h4 className="font-serif text-lg font-medium mb-1">
              Eden&apos;s Store Admin
            </h4>
            <p className="text-xs text-[#A8988C] mb-4 leading-relaxed">
              Full control over products, orders, live inventory adjustments, discount codes, customer moderation, and sales reports.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/analytics"
                className="px-3 py-1.5 rounded-lg bg-[#3A2920] hover:bg-[#4A352A] text-xs font-medium text-[#FAF7F2] transition-colors"
              >
                Analytics Report
              </Link>
              <Link
                href="/admin/coupons"
                className="px-3 py-1.5 rounded-lg bg-[#3A2920] hover:bg-[#4A352A] text-xs font-medium text-[#FAF7F2] transition-colors"
              >
                Manage Coupons
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
