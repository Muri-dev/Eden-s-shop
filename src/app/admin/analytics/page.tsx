import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Users,
  Award,
  CreditCard,
  Smartphone,
} from "lucide-react";

export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [orders, totalCustomers, totalProducts] = await Promise.all([
    prisma.order.findMany({
      where: { status: { notIn: ["CANCELLED", "FAILED"] } },
      include: {
        items: true,
        payments: { select: { channel: true }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
  ]);

  const totalRevenue = orders.reduce((s, o) => s + o.grandTotal, 0);
  const totalOrders = orders.length;
  const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Top products by revenue
  const productMap: Record<string, { name: string; units: number; revenue: number }> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productMap[item.productId]) {
        productMap[item.productId] = {
          name: item.productName,
          units: 0,
          revenue: 0,
        };
      }
      productMap[item.productId].units += item.quantity;
      productMap[item.productId].revenue += item.subtotal;
    });
  });

  const topProducts = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Payment channel breakdown using payments relation
  const mpesaOrders = orders.filter((o) => {
    const ch = o.payments[0]?.channel?.toLowerCase() || "";
    return ch.includes("mpesa") || ch.includes("mobile");
  });
  const cardOrders = orders.filter((o) => {
    const ch = o.payments[0]?.channel?.toLowerCase() || "";
    return ch.includes("card");
  });

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-[#E5DDCF]">
        <h1 className="font-serif text-3xl font-light text-[#241813]">
          Executive Analytics &amp; Fiscal Report
        </h1>
        <p className="text-xs text-[#63534B] mt-1">
          In-depth financial tracking, high-jewelry sales velocity, and client acquisition metrics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#96867B]">
              Gross Settled Sales
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#241813] mt-3">
            {formatPrice(totalRevenue)}
          </div>
          <div className="text-xs text-emerald-700 mt-2 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Paystack-verified transactions</span>
          </div>
        </div>

        <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#96867B]">
              Average Order Value (AOV)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#A6875C] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#241813] mt-3">
            {formatPrice(aov)}
          </div>
          <div className="text-xs text-[#63534B] mt-2">Per confirmed consignment</div>
        </div>

        <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#96867B]">
              Successful Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#241813] mt-3">
            {totalOrders}
          </div>
          <div className="text-xs text-[#63534B] mt-2">Paid &amp; dispatched</div>
        </div>

        <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#96867B]">
              Registered Patrons
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#241813] mt-3">
            {totalCustomers}
          </div>
          <div className="text-xs text-[#63534B] mt-2">Client base registry</div>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Pieces */}
        <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs">
          <h3 className="font-serif text-lg font-medium text-[#241813] pb-3 border-b border-[#E5DDCF] mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#A6875C]" />
            Flagship Creations (By Revenue)
          </h3>

          {topProducts.length === 0 ? (
            <p className="text-xs text-[#96867B] py-6 text-center">
              No sales recorded for creations yet.
            </p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#FAF7F2] border border-[#DFC8A8] flex items-center justify-center font-bold text-[#A6875C]">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-[#241813] block line-clamp-1">
                        {p.name}
                      </span>
                      <span className="text-[11px] text-[#96867B]">{p.units} units consigned</span>
                    </div>
                  </div>
                  <div className="text-right font-serif font-bold text-[#241813]">
                    {formatPrice(p.revenue)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Channels Breakdown */}
        <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs">
          <h3 className="font-serif text-lg font-medium text-[#241813] pb-3 border-b border-[#E5DDCF] mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#A6875C]" />
            Settlement Channels
          </h3>

          <div className="space-y-6">
            <div className="p-4 bg-[#FAF7F2] border border-[#E5DDCF] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#241813]">M-Pesa Mobile Money</h4>
                  <p className="text-xs text-[#96867B]">Safaricom STK &amp; Paybill</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-serif font-bold text-sm text-[#241813]">
                  {mpesaOrders.length} orders
                </span>
                <span className="block text-[11px] text-emerald-700 font-semibold">
                  {totalOrders > 0 ? `${Math.round((mpesaOrders.length / totalOrders) * 100)}%` : "0%"} share
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#FAF7F2] border border-[#E5DDCF] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#241813]">Credit / Debit Cards</h4>
                  <p className="text-xs text-[#96867B]">Visa, Mastercard, 3D-Secure</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-serif font-bold text-sm text-[#241813]">
                  {cardOrders.length} orders
                </span>
                <span className="block text-[11px] text-blue-700 font-semibold">
                  {totalOrders > 0 ? `${Math.round((cardOrders.length / totalOrders) * 100)}%` : "0%"} share
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
