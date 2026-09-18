"use client";

import React, { useState } from "react";
import { formatDate } from "@/lib/utils";
import { RatingStars } from "@/components/ui/RatingStars";
import { toast } from "@/stores/toast.store";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  status: string;
  createdAt: Date;
  isVerifiedPurchase: boolean;
  product: { id: string; title: string; thumbnail: string | null };
  user: { id: string; name: string; email: string };
}

interface ReviewsManagerProps {
  initialReviews: ReviewItem[];
}

export function ReviewsManager({ initialReviews }: ReviewsManagerProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);

  const updateStatus = async (reviewId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Review ${status.toLowerCase()}.`);
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
        );
      } else {
        toast.error("Moderation action failed.");
      }
    } catch {
      toast.error("Network communication error.");
    }
  };

  return (
    <div className="bg-white border border-[#E5DDCF] rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#FAF7F2] border-b border-[#E5DDCF] text-[#96867B] uppercase tracking-wider">
              <th className="py-3 px-4">Creation</th>
              <th className="py-3 px-4">Patron</th>
              <th className="py-3 px-4">Rating</th>
              <th className="py-3 px-4">Comment</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5EFE6]">
            {reviews.map((r) => (
              <tr key={r.id} className="hover:bg-[#FAF7F2] transition-colors">
                <td className="py-3.5 px-4">
                  <span className="font-semibold text-[#241813] block line-clamp-1">
                    {r.product.title}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-medium text-[#241813] block">{r.user.name}</span>
                  <span className="text-[11px] text-[#96867B]">{r.user.email}</span>
                </td>
                <td className="py-3.5 px-4">
                  <RatingStars rating={r.rating} size="sm" />
                </td>
                <td className="py-3.5 px-4 max-w-xs">
                  {r.title && <p className="font-semibold text-[#241813] mb-0.5">{r.title}</p>}
                  <p className="text-[#63534B] line-clamp-2">{r.comment}</p>
                </td>
                <td className="py-3.5 px-4 text-[#96867B]">
                  {formatDate(r.createdAt)}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      r.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : r.status === "REJECTED"
                        ? "bg-rose-50 text-rose-800 border border-rose-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    {r.status !== "APPROVED" && (
                      <button
                        onClick={() => updateStatus(r.id, "APPROVED")}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                        title="Approve Review"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {r.status !== "REJECTED" && (
                      <button
                        onClick={() => updateStatus(r.id, "REJECTED")}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                        title="Reject Review"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
