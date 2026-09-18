import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import {
  Package,
  PlusCircle,
  Search,
  Edit,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    status?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { search, category, status } = await searchParams;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
    ];
  }
  if (category) {
    where.categoryId = category;
  }
  if (status) {
    where.status = status;
  } else {
    where.status = { not: "ARCHIVED" };
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        variants: { select: { id: true, name: true, stock: true } },
        images: { orderBy: { order: "asc" } },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const formatted = products.map((p) => ({
    ...p,
    title: p.name,
    thumbnail: p.images.find((i) => i.isThumbnail)?.url || p.images[0]?.url || "",
  }));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DDCF]">
        <div>
          <h1 className="font-serif text-3xl font-light text-[#241813]">
            Product Catalog
          </h1>
          <p className="text-xs text-[#63534B] mt-1">
            Manage your fine jewelry, horology, and couture collections ({formatted.length} listed)
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A6875C] hover:bg-[#8C6D43] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Creation
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-[#E5DDCF] rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-xs">
        <form className="flex-1 min-w-[240px] flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#96867B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="Search by name, SKU..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-[#E5DDCF] rounded-xl focus:outline-hidden focus:border-[#A6875C] bg-[#FAF7F2]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#241813] text-[#FAF7F2] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#3A2920] transition-colors cursor-pointer"
          >
            Filter
          </button>
        </form>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              !status && !category ? "bg-[#241813] text-white" : "bg-[#FAF7F2] text-[#63534B] hover:bg-[#E5DDCF]"
            }`}
          >
            All Active
          </Link>
          <Link
            href="/admin/inventory?filter=low_stock"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Low Stock Alerts
          </Link>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E5DDCF] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E5DDCF] text-[#96867B] uppercase tracking-wider">
                <th className="py-3 px-4">Creation</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EFE6]">
              {formatted.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF7F2] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {p.thumbnail ? (
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          className="w-12 h-12 object-cover rounded-lg border border-[#E5DDCF]"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-[#FAF7F2] rounded-lg border border-[#E5DDCF] flex items-center justify-center text-[#96867B]">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-sm text-[#241813] block line-clamp-1">
                          {p.title}
                        </span>
                        {p.variants.length > 0 && (
                          <span className="text-[10px] text-[#96867B]">
                            {p.variants.length} variant{p.variants.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#63534B]">
                    {p.category?.name || "Unassigned"}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#96867B]">{p.sku}</td>
                  <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#241813]">
                    {formatPrice(p.price)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        p.stock === 0
                          ? "bg-rose-100 text-rose-800"
                          : p.stock <= p.lowStockThreshold
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-50 text-emerald-800"
                      }`}
                    >
                      {p.stock === 0 ? "Out of Stock" : `${p.stock} in atelier`}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={p.status === "PUBLISHED" ? "success" : "default"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/shop/${p.slug}`}
                        target="_blank"
                        className="p-1.5 text-[#96867B] hover:text-[#241813] transition-colors"
                        title="View Live Store Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#DFC8A8] text-[#241813] hover:bg-[#DFC8A8] text-xs font-semibold transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
