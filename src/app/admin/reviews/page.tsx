import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ReviewsManager } from "@/components/admin/ReviewsManager";

export const revalidate = 0;

export default async function AdminReviewsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, name: true, images: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  const formatted = reviews.map((r) => ({
    ...r,
    product: {
      id: r.product.id,
      title: r.product.name,
      thumbnail: r.product.images?.[0]?.url || null,
    },
  }));

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E5DDCF]">
        <h1 className="font-serif text-3xl font-light text-[#241813]">
          Client Testimonials & Reviews
        </h1>
        <p className="text-xs text-[#63534B] mt-1">
          Moderate verified patron endorsements, ratings, and feedback before public display.
        </p>
      </div>

      <ReviewsManager initialReviews={formatted} />
    </div>
  );
}
