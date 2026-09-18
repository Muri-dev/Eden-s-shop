import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { success: false, message: "Please provide a coupon code." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { success: false, message: "Invalid or inactive privilege code." },
        { status: 404 }
      );
    }

    // Check expiration
    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
      return NextResponse.json(
        { success: false, message: "This privilege code has not started yet." },
        { status: 400 }
      );
    }

    if (coupon.endDate && now > coupon.endDate) {
      return NextResponse.json(
        { success: false, message: "This privilege code has expired." },
        { status: 400 }
      );
    }

    // Check overall usage limit
    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, message: "This privilege code has reached its maximum allocation limit." },
        { status: 400 }
      );
    }

    // Check minimum order value
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum order value of KSh ${new Intl.NumberFormat("en-KE").format(
            coupon.minOrderValue
          )} required for this privilege.`,
        },
        { status: 400 }
      );
    }

    // Calculate discount value
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountValue && discountAmount > coupon.maxDiscountValue) {
        discountAmount = coupon.maxDiscountValue;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, subtotal);

    return NextResponse.json({
      success: true,
      message: `Privilege code ${coupon.code} applied.`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        maxDiscountValue: coupon.maxDiscountValue,
      },
      discountAmount,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to validate coupon code." },
      { status: 500 }
    );
  }
}
