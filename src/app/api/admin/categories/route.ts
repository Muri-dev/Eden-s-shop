import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, slug, description, image, isFeatured, order, isVisible } = await req.json();

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required." }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        isFeatured: Boolean(isFeatured),
        order: Number(order) || 0,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        action: "CREATE_CATEGORY",
        entity: "Category",
        entityId: category.id,
        detailsJson: JSON.stringify({ message: `Created category "${category.name}"` }),
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}
