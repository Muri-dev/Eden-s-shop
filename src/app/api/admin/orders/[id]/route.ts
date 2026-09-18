import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, sku: true, images: true },
            },
            variant: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
        payments: { orderBy: { createdAt: "desc" } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let shippingAddress = null;
    try {
      if (order.shippingAddressJson) {
        shippingAddress = JSON.parse(order.shippingAddressJson);
      }
    } catch (e) {
      // fallback
    }

    const formatted = {
      ...order,
      shippingAddress,
      items: order.items.map((i) => ({
        id: i.id,
        title: i.productName,
        sku: i.sku,
        variantName: i.variantName,
        unitPrice: i.priceAtPurchase,
        totalPrice: i.subtotal,
        quantity: i.quantity,
        product: {
          id: i.product?.id,
          title: i.product?.name,
          slug: i.product?.slug,
          sku: i.product?.sku,
          thumbnail: i.product?.images?.[0]?.url || i.imageAtPurchase || "",
        },
      })),
      timeline: [],
    };

    return NextResponse.json({ success: true, order: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, internalNotes, notes, paymentStatus } = body;

    const existing = await prisma.order.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id },
        data: {
          status: status || existing.status,
          notes: internalNotes !== undefined ? internalNotes : notes !== undefined ? notes : existing.notes,
          paymentStatus: paymentStatus || existing.paymentStatus,
        },
      });

      await tx.auditLog.create({
        data: {
          adminId: session.adminId,
          adminEmail: session.email,
          action: "UPDATE_ORDER",
          entity: "Order",
          entityId: id,
          detailsJson: JSON.stringify({
            orderNumber: ord.orderNumber,
            status: ord.status,
            paymentStatus: ord.paymentStatus,
            updatedBy: session.name,
          }),
        },
      });

      return ord;
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
