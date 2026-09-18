import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const methods = await prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, methods });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to fetch shipping methods" },
      { status: 500 }
    );
  }
}
