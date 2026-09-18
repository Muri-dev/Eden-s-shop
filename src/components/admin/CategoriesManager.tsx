"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "@/stores/toast.store";
import { Plus, Layers, Trash2 } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isFeatured: boolean;
  order: number;
  _count?: { products: number };
}

interface CategoriesManagerProps {
  initialCategories: CategoryItem[];
}

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.warning("Category name and slug are required.");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description, image, isFeatured }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Category "${name}" established.`);
        setCategories((prev) => [...prev, { ...data.category, _count: { products: 0 } }]);
        setName("");
        setSlug("");
        setDescription("");
        setImage("");
        setIsFeatured(false);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to create category.");
      }
    } catch {
      toast.error("Network communication error.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Category Creation Form */}
      <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs h-fit space-y-4">
        <h3 className="font-serif text-lg font-medium text-[#241813] pb-2 border-b border-[#E5DDCF] flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#A6875C]" />
          Establish New Category
        </h3>

        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Rare Horology"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />

          <Input
            label="Slug"
            placeholder="rare-horology"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#63534B]">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Private curated collection..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#E5DDCF] rounded-xl focus:outline-hidden focus:border-[#A6875C] bg-[#FAF7F2]"
            />
          </div>

          <Input
            label="Image Banner URL"
            placeholder="https://images.unsplash.com/..."
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />

          <label className="flex items-center gap-2 text-xs text-[#241813] cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-[#DFC8A8] text-[#A6875C] focus:ring-[#A6875C]"
            />
            <span>Highlight as Featured Category</span>
          </label>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isCreating}
            className="w-full uppercase font-bold text-xs"
          >
            Create Category
          </Button>
        </form>
      </div>

      {/* Category List */}
      <div className="lg:col-span-2 bg-white border border-[#E5DDCF] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-[#FAF7F2] border-b border-[#E5DDCF]">
          <h3 className="font-serif text-lg font-medium text-[#241813] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#A6875C]" />
            Active Department Registry ({categories.length})
          </h3>
        </div>

        <div className="divide-y divide-[#F5EFE6]">
          {categories.map((cat) => (
            <div key={cat.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#FAF7F2] transition-colors">
              <div className="flex items-center gap-3">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-12 h-12 rounded-lg object-cover border border-[#E5DDCF]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-[#FAF7F2] border border-[#E5DDCF] flex items-center justify-center text-[#96867B]">
                    <Layers className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-sm text-[#241813]">{cat.name}</h4>
                  <p className="text-xs text-[#96867B] font-mono">/{cat.slug}</p>
                  {cat.description && (
                    <p className="text-xs text-[#63534B] line-clamp-1 mt-0.5">{cat.description}</p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-[#FAF7F2] text-[#A6875C] border border-[#DFC8A8]">
                  {cat._count?.products || 0} pieces
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
