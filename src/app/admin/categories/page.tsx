import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E5DDCF]">
        <h1 className="font-serif text-3xl font-light text-[#241813]">
          Collections & Categories
        </h1>
        <p className="text-xs text-[#63534B] mt-1">
          Organize storefront navigation, fine jewelry taxonomies, and featured showcases.
        </p>
      </div>

      <CategoriesManager initialCategories={categories} />
    </div>
  );
}
