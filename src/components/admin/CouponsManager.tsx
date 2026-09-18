"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/stores/toast.store";
import { Tag, Plus, CheckCircle2, XCircle } from "lucide-react";

interface CouponItem {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minOrderValue: number | null;
  maxDiscountValue: number | null;
  usageLimit: number | null;
  timesUsed: number;
  isActive: boolean;
}

interface CouponsManagerProps {
  initialCoupons: CouponItem[];
}

export function CouponsManager({ initialCoupons }: CouponsManagerProps) {
  const router = useRouter();
  const [coupons, setCoupons] = useState<CouponItem[]>(initialCoupons);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) {
      toast.warning("Coupon code and discount value are required.");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase(),
          description,
          discountType,
          discountValue: parseFloat(discountValue),
          minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
          usageLimit: usageLimit ? parseInt(usageLimit) : null,
          isActive: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Coupon code ${code.toUpperCase()} activated.`);
        setCoupons((prev) => [data.coupon, ...prev]);
        setCode("");
        setDescription("");
        setDiscountValue("");
        setMinOrderValue("");
        setUsageLimit("");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to create coupon.");
      }
    } catch {
      toast.error("Network communication error.");
    } finally {
      setIsCreating(false);
    }
  };

  const toggleStatus = async (couponId: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Coupon status modified.");
        setCoupons((prev) =>
          prev.map((c) => (c.id === couponId ? { ...c, isActive: !current } : c))
        );
      }
    } catch {
      toast.error("Failed to update status.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Create Coupon Form */}
      <div className="bg-white border border-[#E5DDCF] rounded-2xl p-6 shadow-xs h-fit space-y-4">
        <h3 className="font-serif text-lg font-medium text-[#241813] pb-2 border-b border-[#E5DDCF] flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#A6875C]" />
          Issue Privilege Voucher
        </h3>

        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Voucher Code"
            placeholder="e.g. PRIVILEGE20"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#63534B]">
              Discount Type
            </label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#E5DDCF] rounded-xl focus:outline-hidden focus:border-[#A6875C] bg-[#FAF7F2]"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed Amount (KES)</option>
            </select>
          </div>

          <Input
            label={discountType === "PERCENTAGE" ? "Discount Percentage (%)" : "Discount Amount (KES)"}
            type="number"
            placeholder={discountType === "PERCENTAGE" ? "15" : "5000"}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            required
          />

          <Input
            label="Minimum Spend (KES)"
            type="number"
            placeholder="10000"
            value={minOrderValue}
            onChange={(e) => setMinOrderValue(e.target.value)}
          />

          <Input
            label="Total Usage Limit (Optional)"
            type="number"
            placeholder="50"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#63534B]">
              Campaign Notes / Description
            </label>
            <input
              type="text"
              placeholder="VIP Client Spring Privilege"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#E5DDCF] rounded-xl focus:outline-hidden focus:border-[#A6875C] bg-[#FAF7F2]"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isCreating}
            className="w-full uppercase font-bold text-xs"
          >
            Activate Voucher Code
          </Button>
        </form>
      </div>

      {/* Coupons Table */}
      <div className="lg:col-span-2 bg-white border border-[#E5DDCF] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-[#FAF7F2] border-b border-[#E5DDCF]">
          <h3 className="font-serif text-lg font-medium text-[#241813] flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#A6875C]" />
            Active Privilege Codes ({coupons.length})
          </h3>
        </div>

        <div className="divide-y divide-[#F5EFE6]">
          {coupons.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#FAF7F2] transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-[#241813] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#DFC8A8]">
                    {c.code}
                  </span>
                  <span className="font-semibold text-xs text-emerald-700">
                    {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `${formatPrice(c.discountValue)} OFF`}
                  </span>
                </div>
                {c.description && (
                  <p className="text-xs text-[#63534B] mt-1">{c.description}</p>
                )}
                <div className="flex items-center gap-3 text-[11px] text-[#96867B] mt-1">
                  {c.minOrderValue && c.minOrderValue > 0 && (
                    <span>Min spend: {formatPrice(c.minOrderValue)}</span>
                  )}
                  <span>Used: {c.timesUsed} {c.usageLimit ? `/ ${c.usageLimit}` : ""}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleStatus(c.id, c.isActive)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                    c.isActive
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {c.isActive ? "Active" : "Disabled"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
