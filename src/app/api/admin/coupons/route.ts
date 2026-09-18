import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({
      include: {
        _count: { select: { usages: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      code,
      description,
      discountType = "PERCENTAGE",
      discountValue,
      minOrderValue = 0,
      maxDiscountValue,
      startDate,
      endDate,
      usageLimit,
      isActive = true,
    } = body;

    if (!code || discountValue === undefined) {
      return NextResponse.json({ error: "Code and discountValue are required." }, { status: 400 });
    }

    const existing = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists." }, { status: 409 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        description,
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
        maxDiscountValue: maxDiscountValue ? Number(maxDiscountValue) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        isActive: Boolean(isActive),
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        action: "CREATE_COUPON",
        entity: "Coupon",
        entityId: coupon.id,
        detailsJson: JSON.stringify({ message: `Created coupon code ${coupon.code}` }),
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create coupon" }, { status: 500 });
  }
}
