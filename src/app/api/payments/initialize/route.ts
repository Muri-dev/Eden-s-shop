import { NextResponse } from "next/server";
import { initializeOrderPayment } from "@/services/payment.service";
import { getCustomerSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const session = await getCustomerSession();

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingMethodId,
      couponCode,
      items,
      notes,
    } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { success: false, message: "Please provide complete contact information." },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.streetAddress || !shippingAddress.city) {
      return NextResponse.json(
        { success: false, message: "Please provide a complete delivery address." },
        { status: 400 }
      );
    }

    if (!shippingMethodId) {
      return NextResponse.json(
        { success: false, message: "Please select a courier shipping method." },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Your shopping bag is empty." },
        { status: 400 }
      );
    }

    // Call service with server-side authoritative calculations
    const result = await initializeOrderPayment({
      userId: session?.userId || null,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingMethodId,
      couponCode,
      items,
      notes,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Order payment initialization error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to initialize checkout." },
      { status: 400 }
    );
  }
}
