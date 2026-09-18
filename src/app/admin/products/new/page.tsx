import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export const revalidate = 0;

export default async function NewProductPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="py-2">
      <ProductForm categories={categories} isEditing={false} />
    </div>
  );
}
