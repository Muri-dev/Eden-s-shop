import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CustomersManager } from "@/components/admin/CustomersManager";

export const revalidate = 0;

export default async function AdminCustomersPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const customers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        where: { status: { notIn: ["CANCELLED", "FAILED"] } },
        select: { grandTotal: true },
      },
      _count: { select: { orders: true } },
    },
  });

  const formatted = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    status: c.status,
    createdAt: c.createdAt,
    totalOrders: c._count.orders,
    totalSpent: c.orders.reduce((sum, o) => sum + o.grandTotal, 0),
  }));

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E5DDCF]">
        <h1 className="font-serif text-3xl font-light text-[#241813]">
          Patron Directory & Client Registry
        </h1>
        <p className="text-xs text-[#63534B] mt-1">
          Review VIP patrons, lifetime acquisition values, and account status controls ({formatted.length} registered)
        </p>
      </div>

      <CustomersManager initialCustomers={formatted} />
    </div>
  );
}
