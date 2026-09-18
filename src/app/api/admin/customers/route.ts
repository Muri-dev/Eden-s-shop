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
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        role: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            grandTotal: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = customers.map((c) => {
      const totalSpent = c.orders
        .filter((o) => o.status !== "CANCELLED" && o.status !== "FAILED")
        .reduce((sum, o) => sum + o.grandTotal, 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        status: c.status,
        createdAt: c.createdAt,
        totalOrders: c._count.orders,
        totalReviews: c._count.reviews,
        totalSpent,
      };
    });

    return NextResponse.json({ success: true, customers: enriched });
  } catch (error: any) {
    console.error("Admin customers fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId, status } = await req.json();

    if (!customerId || !["ACTIVE", "SUSPENDED", "INACTIVE"].includes(status)) {
      return NextResponse.json({ error: "Valid customerId and status are required." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: customerId },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        action: "UPDATE_CUSTOMER_STATUS",
        entity: "User",
        entityId: customerId,
        detailsJson: JSON.stringify({ message: `Customer ${updated.email} status changed to ${status}` }),
      },
    });

    return NextResponse.json({ success: true, customer: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}
