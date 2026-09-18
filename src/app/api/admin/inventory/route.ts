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
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";

    const where: any = {
      status: { not: "ARCHIVED" },
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    if (filter === "out_of_stock") {
      where.stock = 0;
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        stock: true,
        lowStockThreshold: true,
        status: true,
        images: { orderBy: { order: "asc" } },
        category: { select: { name: true } },
        variants: {
          select: { id: true, name: true, sku: true, stock: true },
        },
        inventoryLogs: {
          take: 3,
          orderBy: { createdAt: "desc" },
          select: { id: true, quantity: true, type: true, reason: true, createdAt: true },
        },
      },
      orderBy: { stock: "asc" },
    });

    const formatted = products.map((p) => ({
      ...p,
      title: p.name,
      thumbnail: p.images.find((i) => i.isThumbnail)?.url || p.images[0]?.url || "",
    }));

    const lowStockItems = formatted.filter(
      (p) => p.stock <= p.lowStockThreshold && p.stock > 0
    );
    const outOfStockItems = formatted.filter((p) => p.stock === 0);

    let filtered = formatted;
    if (filter === "low_stock") {
      filtered = lowStockItems;
    }

    return NextResponse.json({
      success: true,
      products: filtered,
      summary: {
        totalTracked: formatted.length,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
      },
    });
  } catch (error: any) {
    console.error("Admin inventory error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, variantId, newStock, reason, type = "ADJUSTMENT" } = await req.json();

    if (!productId || newStock === undefined || newStock < 0) {
      return NextResponse.json({ error: "Valid productId and newStock are required." }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error("Product not found");

      const oldStock = product.stock;
      const diff = Number(newStock) - oldStock;

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: Number(newStock) },
      });

      if (variantId) {
        await tx.productVariant.update({
          where: { id: variantId },
          data: { stock: Number(newStock) },
        });
      }

      await tx.inventoryMovement.create({
        data: {
          productId,
          quantity: Math.abs(diff),
          remainingStock: Number(newStock),
          type: type as any,
          reason: `${reason || "Manual adjustment"} by ${session.name} (was ${oldStock}, now ${newStock})`,
          referenceId: productId,
          performedBy: session.name,
        },
      });

      await tx.auditLog.create({
        data: {
          adminId: session.adminId,
          adminEmail: session.email,
          action: "INVENTORY_ADJUSTMENT",
          entity: "Product",
          entityId: productId,
          detailsJson: JSON.stringify({
            productName: product.name,
            oldStock,
            newStock,
            reason: reason || "Manual update",
          }),
        },
      });

      return updatedProduct;
    });

    return NextResponse.json({ success: true, product: result });
  } catch (error: any) {
    console.error("Stock adjustment error:", error);
    return NextResponse.json({ error: error.message || "Failed to adjust stock" }, { status: 500 });
  }
}
