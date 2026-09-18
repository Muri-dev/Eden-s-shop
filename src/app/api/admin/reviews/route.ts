import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, slug: true, images: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = reviews.map((r) => ({
      ...r,
      product: {
        id: r.product.id,
        title: r.product.name,
        slug: r.product.slug,
        thumbnail: r.product.images?.[0]?.url || "",
      },
    }));

    return NextResponse.json({ success: true, reviews: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId, status } = await req.json();

    if (!reviewId || !["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json({ error: "Valid reviewId and status are required." }, { status: 400 });
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { status },
    });

    return NextResponse.json({ success: true, review: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}
