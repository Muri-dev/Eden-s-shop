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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerEmail: { contains: search } },
        { customerName: { contains: search } },
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            select: {
              id: true,
              productName: true,
              quantity: true,
              priceAtPurchase: true,
              subtotal: true,
            },
          },
        },
      }),
    ]);

    const formatted = orders.map((o) => ({
      ...o,
      items: o.items.map((i) => ({
        id: i.id,
        title: i.productName,
        quantity: i.quantity,
        unitPrice: i.priceAtPurchase,
        totalPrice: i.subtotal,
      })),
    }));

    return NextResponse.json({
      success: true,
      orders: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Admin orders list error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
