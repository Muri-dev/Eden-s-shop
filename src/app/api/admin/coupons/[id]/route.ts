import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: body.code ? body.code.toUpperCase().trim() : undefined,
        description: body.description,
        discountType: body.discountType,
        discountValue: body.discountValue !== undefined ? Number(body.discountValue) : undefined,
        minOrderValue: body.minOrderValue !== undefined ? Number(body.minOrderValue) : undefined,
        maxDiscountValue: body.maxDiscountValue !== undefined ? Number(body.maxDiscountValue) : undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        usageLimit: body.usageLimit !== undefined ? Number(body.usageLimit) : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        action: "UPDATE_COUPON",
        entity: "Coupon",
        entityId: id,
        detailsJson: JSON.stringify({ message: `Updated coupon ${coupon.code}` }),
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.coupon.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        action: "DELETE_COUPON",
        entity: "Coupon",
        entityId: id,
        detailsJson: JSON.stringify({ message: `Deleted coupon ID: ${id}` }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
