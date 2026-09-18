"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "@/stores/toast.store";
import { ArrowLeft, Plus, Trash2, Package } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  initialData?: any;
  categories: CategoryOption[];
  isEditing?: boolean;
}

export function ProductForm({ initialData, categories, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : "");
  const [compareAtPrice, setCompareAtPrice] = useState(initialData?.compareAtPrice ? String(initialData.compareAtPrice) : "");
  const [costPrice, setCostPrice] = useState(initialData?.costPrice ? String(initialData.costPrice) : "");
  const [stock, setStock] = useState(initialData?.stock !== undefined ? String(initialData.stock) : "10");
  const [lowStockThreshold, setLowStockThreshold] = useState(initialData?.lowStockThreshold !== undefined ? String(initialData.lowStockThreshold) : "3");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || (categories[0]?.id || ""));
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || "");
  const [status, setStatus] = useState(initialData?.status || "ACTIVE");
  const [isFeatured, setIsFeatured] = useState(Boolean(initialData?.isFeatured));
  const [isBestSeller, setIsBestSeller] = useState(Boolean(initialData?.isBestSeller));
  const [isNewArrival, setIsNewArrival] = useState(initialData?.isNewArrival !== undefined ? Boolean(initialData.isNewArrival) : true);

  // Auto generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !slug || !sku || !price || !categoryId) {
      toast.warning("Please fill in title, slug, sku, price, and category.");
      return;
    }

    setIsLoading(true);
    try {
      const url = isEditing ? `/api/admin/products/${initialData.id}` : "/api/admin/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          sku,
          shortDescription,
          description,
          price: parseFloat(price),
          compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
          costPrice: costPrice ? parseFloat(costPrice) : null,
          stock: parseInt(stock),
          lowStockThreshold: parseInt(lowStockThreshold),
          categoryId,
          thumbnail,
          images: thumbnail ? [thumbnail] : [],
          status,
          isFeatured,
          isBestSeller,
          isNewArrival,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isEditing ? "Creation updated successfully." : "New creation added to atelier catalog.");
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to save creation.");
      }
    } catch {
      toast.error("Network communication error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between pb-4 border-b border-[#E5DDCF]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-white border border-[#E5DDCF] hover:bg-[#FAF7F2] text-[#96867B] hover:text-[#241813] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#241813]">
              {isEditing ? `Edit: ${initialData.title}` : "New High-Jewelry / Luxury Creation"}
            </h1>
            <p className="text-xs text-[#63534B]">
              {isEditing ? "Modify attributes and catalog details" : "Register a master piece into the luxury vault"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button type="button" variant="ghost" size="sm">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {isEditing ? "Save Changes" : "Publish Creation"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-medium text-[#241813] pb-2 border-b border-[#E5DDCF]">
              General Details
            </h3>

            <Input
              label="Creation Title"
              placeholder="e.g. The Elysian Emerald Solitaire Ring"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="URL Slug"
                placeholder="elysian-emerald-solitaire-ring"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
              <Input
                label="SKU Identifier"
                placeholder="EDN-JWL-010"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#63534B]">
                Short Description (Subtitle)
              </label>
              <input
                type="text"
                placeholder="A breathtaking 3.5 carat Zambian emerald encased in solid platinum."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E5DDCF] rounded-xl focus:outline-hidden focus:border-[#A6875C] bg-[#FAF7F2]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#63534B]">
                Full Description & Provenance
              </label>
              <textarea
                rows={5}
                placeholder="Detail craftsmanship, heritage gemstones, gold karatage, and care..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#E5DDCF] rounded-xl focus:outline-hidden focus:border-[#A6875C] bg-[#FAF7F2]"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-medium text-[#241813] pb-2 border-b border-[#E5DDCF]">
              Valuation & Atelier Stock
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Retail Price (KES)"
                type="number"
                placeholder="250000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <Input
                label="Compare at Price (KES)"
                type="number"
                placeholder="280000"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
              />
              <Input
                label="Cost Price (KES)"
                type="number"
                placeholder="160000"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Input
                label="Available Units in Atelier"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
              <Input
                label="Low Stock Alert Threshold"
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Status, Category, Image */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-medium text-[#241813] pb-2 border-b border-[#E5DDCF]">
              Organization
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#63534B]">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E5DDCF] rounded-xl focus:outline-hidden focus:border-[#A6875C] bg-[#FAF7F2]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#63534B]">
                Visibility Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E5DDCF] rounded-xl focus:outline-hidden focus:border-[#A6875C] bg-[#FAF7F2]"
              >
                <option value="ACTIVE">Active (Public)</option>
                <option value="DRAFT">Draft (Hidden)</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="pt-2 space-y-2 border-t border-[#E5DDCF]">
              <label className="flex items-center gap-2 text-xs text-[#241813] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-[#DFC8A8] text-[#A6875C] focus:ring-[#A6875C]"
                />
                <span>Featured Collection</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-[#241813] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="rounded border-[#DFC8A8] text-[#A6875C] focus:ring-[#A6875C]"
                />
                <span>Bestseller Highlight</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-[#241813] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="rounded border-[#DFC8A8] text-[#A6875C] focus:ring-[#A6875C]"
                />
                <span>New Arrival Ribbon</span>
              </label>
            </div>
          </div>

          {/* Media Imagery */}
          <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-medium text-[#241813] pb-2 border-b border-[#E5DDCF]">
              Primary Imagery
            </h3>

            <Input
              label="Thumbnail Image URL"
              placeholder="https://images.unsplash.com/..."
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
            />

            {thumbnail ? (
              <div className="relative aspect-square rounded-xl overflow-hidden border border-[#E5DDCF] bg-[#FAF7F2]">
                <img
                  src={thumbnail}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square rounded-xl border-2 border-dashed border-[#E5DDCF] flex flex-col items-center justify-center text-[#96867B] bg-[#FAF7F2]">
                <Package className="w-8 h-8 mb-2" />
                <span className="text-[11px]">Enter image URL to view preview</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
