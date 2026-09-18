import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  User as UserIcon,
  Package,
  Heart,
  MapPin,
  ShoppingBag,
  LogOut,
  ArrowRight,
} from "lucide-react";

export const revalidate = 0;

export default async function AccountPage() {
  const session = await getCustomerSession();

  if (!session) {
    redirect("/login");
  }

  const [user, recentOrders, wishlistCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        addresses: { where: { isDefault: true }, take: 1 },
        _count: { select: { orders: true } },
      },
    }),
    prisma.order.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { items: true },
    }),
    prisma.wishlist
      .findUnique({ where: { userId: session.userId }, include: { _count: { select: { items: true } } } })
      .then((w) => w?._count?.items || 0),
  ]);

  if (!user) {
    redirect("/login");
  }

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-10 border-b border-[#E5DDCF]">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#241813]">
            Patron Dashboard
          </h1>
          <p className="text-sm text-[#63534B] mt-1">
            Welcome back, <span className="font-semibold text-[#241813]">{user.name}</span>
          </p>
        </div>

        <form action="/api/auth/logout" method="POST" className="mt-4 sm:mt-0">
          <Button type="submit" variant="ghost" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </form>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-white border border-[#E5DDCF] rounded-xl p-5 text-center">
          <Package className="w-6 h-6 mx-auto text-[#A6875C] mb-2" />
          <div className="font-serif text-2xl font-medium text-[#241813]">{user._count.orders}</div>
          <div className="text-xs uppercase tracking-wider text-[#96867B] mt-1">Orders</div>
        </div>
        <div className="bg-white border border-[#E5DDCF] rounded-xl p-5 text-center">
          <Heart className="w-6 h-6 mx-auto text-[#A6875C] mb-2" />
          <div className="font-serif text-2xl font-medium text-[#241813]">{wishlistCount}</div>
          <div className="text-xs uppercase tracking-wider text-[#96867B] mt-1">Wishlist</div>
        </div>
        <div className="bg-white border border-[#E5DDCF] rounded-xl p-5 text-center">
          <MapPin className="w-6 h-6 mx-auto text-[#A6875C] mb-2" />
          <div className="font-serif text-2xl font-medium text-[#241813]">
            {user.addresses.length > 0 ? "Saved" : "None"}
          </div>
          <div className="text-xs uppercase tracking-wider text-[#96867B] mt-1">Address</div>
        </div>
        <div className="bg-white border border-[#E5DDCF] rounded-xl p-5 text-center">
          <UserIcon className="w-6 h-6 mx-auto text-[#A6875C] mb-2" />
          <div className="text-xs font-semibold text-[#241813] truncate">{user.email}</div>
          <div className="text-xs uppercase tracking-wider text-[#96867B] mt-1">Email</div>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <Link
          href="/account/orders"
          className="group bg-white border border-[#E5DDCF] rounded-2xl p-6 hover:border-[#A6875C] transition-all shadow-xs"
        >
          <Package className="w-8 h-8 text-[#A6875C] mb-4" />
          <h3 className="font-serif text-lg text-[#241813] mb-1 group-hover:text-[#A6875C] transition-colors">
            Order History
          </h3>
          <p className="text-xs text-[#96867B]">View and track all your consignments</p>
        </Link>

        <Link
          href="/account/wishlist"
          className="group bg-white border border-[#E5DDCF] rounded-2xl p-6 hover:border-[#A6875C] transition-all shadow-xs"
        >
          <Heart className="w-8 h-8 text-[#A6875C] mb-4" />
          <h3 className="font-serif text-lg text-[#241813] mb-1 group-hover:text-[#A6875C] transition-colors">
            Saved Wishlist
          </h3>
          <p className="text-xs text-[#96867B]">Your private selection of saved creations</p>
        </Link>

        <Link
          href="/shop"
          className="group bg-white border border-[#E5DDCF] rounded-2xl p-6 hover:border-[#A6875C] transition-all shadow-xs"
        >
          <ShoppingBag className="w-8 h-8 text-[#A6875C] mb-4" />
          <h3 className="font-serif text-lg text-[#241813] mb-1 group-hover:text-[#A6875C] transition-colors">
            Continue Shopping
          </h3>
          <p className="text-xs text-[#96867B]">Explore our latest vault selections</p>
        </Link>
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-light text-[#241813]">Recent Consignments</h2>
            <Link
              href="/account/orders"
              className="text-xs uppercase tracking-wider font-semibold text-[#A6875C] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block bg-white border border-[#E5DDCF] rounded-xl p-5 hover:border-[#A6875C] transition-all shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono font-bold text-sm text-[#241813]">
                        {order.orderNumber}
                      </span>
                      <Badge variant={statusBadge(order.status)}>{order.status.replace(/_/g, " ")}</Badge>
                    </div>
                    <p className="text-xs text-[#96867B]">
                      {formatDate(order.createdAt)} • {order.items.length} item{order.items.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-lg font-semibold text-[#241813]">
                      {formatPrice(order.grandTotal)}
                    </div>
                    <Badge variant={statusBadge(order.paymentStatus)} className="mt-1">
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
