import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InventoryTable } from "@/components/admin/InventoryTable";
import { Boxes, AlertTriangle, CheckCircle2 } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    filter?: string;
  }>;
}

export default async function AdminInventoryPage({ searchParams }: PageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { filter } = await searchParams;

  const where: any = {
    status: { not: "ARCHIVED" },
  };

  if (filter === "out_of_stock") {
    where.stock = 0;
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { stock: "asc" },
    select: {
      id: true,
      name: true,
      sku: true,
      price: true,
      stock: true,
      lowStockThreshold: true,
      status: true,
      images: { orderBy: { order: "asc" } },
      category: { select: { name: true } },
    },
  });

  const formatted = products.map((p) => ({
    id: p.id,
    title: p.name,
    sku: p.sku,
    thumbnail: p.images.find((i) => i.isThumbnail)?.url || p.images[0]?.url || null,
    price: p.price,
    stock: p.stock,
    lowStockThreshold: p.lowStockThreshold,
    status: p.status,
    category: p.category,
  }));

  const lowStockCount = formatted.filter((p) => p.stock <= p.lowStockThreshold && p.stock > 0).length;
  const outOfStockCount = formatted.filter((p) => p.stock === 0).length;

  let displayed = formatted;
  if (filter === "low_stock") {
    displayed = formatted.filter((p) => p.stock <= p.lowStockThreshold);
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DDCF]">
        <div>
          <h1 className="font-serif text-3xl font-light text-[#241813]">
            Atelier Inventory & Reserves
          </h1>
          <p className="text-xs text-[#63534B] mt-1">
            Audit luxury reserves, reorder stock, and manage low threshold alerts in real-time.
          </p>
        </div>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/inventory"
          className={`p-4 rounded-xl border transition-all ${
            !filter ? "bg-white border-[#A6875C] shadow-xs" : "bg-[#FAF7F2] border-[#E5DDCF]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#96867B]">
              Total Tracked Pieces
            </span>
            <Boxes className="w-4 h-4 text-[#A6875C]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#241813] mt-2">
            {products.length}
          </div>
        </Link>

        <Link
          href="/admin/inventory?filter=low_stock"
          className={`p-4 rounded-xl border transition-all ${
            filter === "low_stock" ? "bg-white border-amber-500 shadow-xs" : "bg-amber-50/50 border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-amber-900">
              Low Stock Alert
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-amber-900 mt-2">
            {lowStockCount}
          </div>
        </Link>

        <Link
          href="/admin/inventory?filter=out_of_stock"
          className={`p-4 rounded-xl border transition-all ${
            filter === "out_of_stock" ? "bg-white border-rose-500 shadow-xs" : "bg-rose-50/50 border-rose-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-rose-900">
              Depleted (Out of Stock)
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-rose-900 mt-2">
            {outOfStockCount}
          </div>
        </Link>
      </div>

      {/* Inventory Table */}
      <InventoryTable products={displayed} />
    </div>
  );
}
