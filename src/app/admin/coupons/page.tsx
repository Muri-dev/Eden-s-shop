import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CouponsManager } from "@/components/admin/CouponsManager";

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E5DDCF]">
        <h1 className="font-serif text-3xl font-light text-[#241813]">
          Privilege Vouchers & Promotions
        </h1>
        <p className="text-xs text-[#63534B] mt-1">
          Issue discount codes, percentage vouchers, and minimum purchase threshold rules.
        </p>
      </div>

      <CouponsManager initialCoupons={coupons} />
    </div>
  );
}
