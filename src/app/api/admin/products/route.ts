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
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (status) {
      where.status = status;
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          variants: { select: { id: true, name: true, sku: true, stock: true, price: true } },
          images: { orderBy: { order: "asc" } },
        },
      }),
    ]);

    const formatted = products.map((p) => ({
      ...p,
      title: p.name,
      thumbnail: p.images.find((i) => i.isThumbnail)?.url || p.images[0]?.url || "",
    }));

    return NextResponse.json({
      success: true,
      products: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Admin products fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const {
      title,
      name = title,
      slug,
      shortDescription,
      description,
      sku,
      price,
      compareAtPrice,
      discountPrice = compareAtPrice,
      costPrice,
      stock,
      lowStockThreshold,
      categoryId,
      brandId,
      thumbnail,
      images = [],
      variants = [],
      isFeatured = false,
      isBestSeller = false,
      isNewArrival = true,
      status = "PUBLISHED",
    } = data;

    const productName = name || title;

    if (!productName || !slug || !sku || price === undefined || !categoryId) {
      return NextResponse.json(
        { error: "Product name, slug, sku, price, and category are required." },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ slug }, { sku }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A product with this slug or SKU already exists." },
        { status: 409 }
      );
    }

    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          name: productName,
          slug,
          shortDescription: shortDescription || "",
          description: description || "",
          sku,
          price: Number(price),
          discountPrice: discountPrice ? Number(discountPrice) : null,
          costPrice: costPrice ? Number(costPrice) : null,
          stock: Number(stock) || 0,
          lowStockThreshold: Number(lowStockThreshold) || 5,
          categoryId,
          brandId: brandId || null,
          isFeatured: Boolean(isFeatured),
          isBestSeller: Boolean(isBestSeller),
          isNewArrival: Boolean(isNewArrival),
          status: status || "PUBLISHED",
        },
      });

      const imageUrls = images.length > 0 ? images : thumbnail ? [thumbnail] : [];
      if (imageUrls.length > 0) {
        await tx.productImage.createMany({
          data: imageUrls.map((url: string, index: number) => ({
            productId: p.id,
            url,
            isThumbnail: index === 0,
            order: index,
          })),
        });
      }

      if (variants && variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((v: any) => ({
            productId: p.id,
            sku: v.sku || `${sku}-${v.name.toLowerCase().replace(/\s+/g, "-")}`,
            name: v.name,
            price: Number(v.price) || Number(price),
            stock: Number(v.stock) || 0,
            attributesJson: JSON.stringify(v.attributes || {}),
          })),
        });
      }

      if (Number(stock) > 0) {
        await tx.inventoryMovement.create({
          data: {
            productId: p.id,
            quantity: Number(stock),
            remainingStock: Number(stock),
            type: "RESTOCK",
            reason: `Initial creation by admin ${session.name}`,
            referenceId: p.id,
            performedBy: session.name,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          adminId: session.adminId,
          adminEmail: session.email,
          action: "CREATE_PRODUCT",
          entity: "Product",
          entityId: p.id,
          detailsJson: JSON.stringify({ message: `Created product "${p.name}" (SKU: ${p.sku})` }),
        },
      });

      return p;
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Admin product creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}
