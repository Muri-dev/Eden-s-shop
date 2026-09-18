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

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        image: body.image,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : undefined,
        order: body.order !== undefined ? Number(body.order) : undefined,
        isVisible: body.isVisible !== undefined ? Boolean(body.isVisible) : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        action: "UPDATE_CATEGORY",
        entity: "Category",
        entityId: id,
        detailsJson: JSON.stringify({ message: `Updated category "${category.name}"` }),
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return NextResponse.json(
        { error: `Cannot delete category containing ${count} products. Reassign products first.` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        action: "DELETE_CATEGORY",
        entity: "Category",
        entityId: id,
        detailsJson: JSON.stringify({ message: `Deleted category ID: ${id}` }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
