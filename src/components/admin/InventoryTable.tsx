"use client";

import React, { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/stores/toast.store";
import { Package, RefreshCw, AlertTriangle } from "lucide-react";

interface InventoryProduct {
  id: string;
  title: string;
  sku: string;
  thumbnail: string | null;
  price: number;
  stock: number;
  lowStockThreshold: number;
  status: string;
  category: { name: string } | null;
}

interface InventoryTableProps {
  products: InventoryProduct[];
}

export function InventoryTable({ products }: InventoryTableProps) {
  const [items, setItems] = useState<InventoryProduct[]>(products);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [reason, setReason] = useState<string>("Manual restock");
  const [isUpdating, setIsUpdating] = useState(false);

  const startEdit = (p: InventoryProduct) => {
    setEditingId(p.id);
    setNewStock(p.stock);
    setReason("Restock from atelier");
  };

  const handleSave = async (productId: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          newStock,
          reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Inventory balance updated.");
        setItems((prev) =>
          prev.map((item) => (item.id === productId ? { ...item, stock: newStock } : item))
        );
        setEditingId(null);
      } else {
        toast.error(data.error || "Failed to update stock.");
      }
    } catch {
      toast.error("Network communication error.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white border border-[#E5DDCF] rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#FAF7F2] border-b border-[#E5DDCF] text-[#96867B] uppercase tracking-wider">
              <th className="py-3 px-4">Creation</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Current Stock</th>
              <th className="py-3 px-4">Alert Threshold</th>
              <th className="py-3 px-4 text-right">Adjust Reserve</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5EFE6]">
            {items.map((p) => {
              const isLow = p.stock <= p.lowStockThreshold;
              const isOut = p.stock === 0;
              const isEditing = editingId === p.id;

              return (
                <tr key={p.id} className="hover:bg-[#FAF7F2] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {p.thumbnail ? (
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          className="w-10 h-10 object-cover rounded-lg border border-[#E5DDCF]"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[#FAF7F2] rounded-lg border border-[#E5DDCF] flex items-center justify-center text-[#96867B]">
                          <Package className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-sm text-[#241813] block line-clamp-1">
                          {p.title}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#63534B]">
                    {p.category?.name || "Unassigned"}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#96867B]">{p.sku}</td>
                  <td className="py-3.5 px-4 font-serif font-semibold text-[#241813]">
                    {formatPrice(p.price)}
                  </td>
                  <td className="py-3.5 px-4">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={newStock}
                        onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-[#A6875C] rounded-lg bg-white text-xs font-bold"
                      />
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isOut
                            ? "bg-rose-100 text-rose-800"
                            : isLow
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-50 text-emerald-800"
                        }`}
                      >
                        {isLow && <AlertTriangle className="w-3 h-3" />}
                        {p.stock} units
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-[#96867B]">
                    ≤ {p.lowStockThreshold} units
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {isEditing ? (
                      <div className="inline-flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Reason"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="w-28 px-2 py-1 border border-[#E5DDCF] rounded-lg text-[11px]"
                        />
                        <button
                          onClick={() => handleSave(p.id)}
                          disabled={isUpdating}
                          className="px-2.5 py-1 rounded-lg bg-[#A6875C] text-white text-xs font-bold hover:bg-[#8C6D43] transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 text-xs text-[#96867B] hover:text-[#241813] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#DFC8A8] text-[#241813] hover:bg-[#DFC8A8] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Adjust Stock
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
