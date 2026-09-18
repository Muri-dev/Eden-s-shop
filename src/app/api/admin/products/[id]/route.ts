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
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { order: "asc" } },
        variants: true,
        specifications: true,
        inventoryLogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const formatted = {
      ...product,
      title: product.name,
      thumbnail: product.images.find((i) => i.isThumbnail)?.url || product.images[0]?.url || "",
    };

    return NextResponse.json({ success: true, product: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const oldStock = existing.stock;
    const newStock = data.stock !== undefined ? Number(data.stock) : oldStock;

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.product.update({
        where: { id },
        data: {
          name: data.title || data.name || existing.name,
          slug: data.slug !== undefined ? data.slug : existing.slug,
          shortDescription: data.shortDescription !== undefined ? data.shortDescription : existing.shortDescription,
          description: data.description !== undefined ? data.description : existing.description,
          sku: data.sku !== undefined ? data.sku : existing.sku,
          price: data.price !== undefined ? Number(data.price) : existing.price,
          discountPrice: data.compareAtPrice !== undefined ? (data.compareAtPrice ? Number(data.compareAtPrice) : null) : existing.discountPrice,
          costPrice: data.costPrice !== undefined ? (data.costPrice ? Number(data.costPrice) : null) : existing.costPrice,
          stock: newStock,
          lowStockThreshold: data.lowStockThreshold !== undefined ? Number(data.lowStockThreshold) : existing.lowStockThreshold,
          categoryId: data.categoryId !== undefined ? data.categoryId : existing.categoryId,
          brandId: data.brandId !== undefined ? data.brandId : existing.brandId,
          isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : existing.isFeatured,
          isBestSeller: data.isBestSeller !== undefined ? Boolean(data.isBestSeller) : existing.isBestSeller,
          isNewArrival: data.isNewArrival !== undefined ? Boolean(data.isNewArrival) : existing.isNewArrival,
          status: data.status !== undefined ? data.status : existing.status,
        },
      });

      // If stock changed directly, log an inventory movement
      if (newStock !== oldStock) {
        const diff = newStock - oldStock;
        await tx.inventoryMovement.create({
          data: {
            productId: p.id,
            quantity: Math.abs(diff),
            remainingStock: newStock,
            type: diff > 0 ? "RESTOCK" : "CORRECTION",
            reason: `Stock adjusted by admin ${session.name} from ${oldStock} to ${newStock}`,
            referenceId: p.id,
            performedBy: session.name,
          },
        });
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          adminId: session.adminId,
          adminEmail: session.email,
          action: "UPDATE_PRODUCT",
          entity: "Product",
          entityId: p.id,
          detailsJson: JSON.stringify({ message: `Updated product "${p.name}"` }),
        },
      });

      return p;
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error("Admin product update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const product = await prisma.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        adminEmail: session.email,
        action: "ARCHIVE_PRODUCT",
        entity: "Product",
        entityId: id,
        detailsJson: JSON.stringify({ message: `Archived product "${product.name}"` }),
      },
    });

    return NextResponse.json({ success: true, message: "Product archived successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to archive product" }, { status: 500 });
  }
}
