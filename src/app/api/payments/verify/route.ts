import { NextResponse } from "next/server";
import { verifyAndProcessPayment } from "@/services/payment.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { success: false, message: "Transaction reference is required." },
        { status: 400 }
      );
    }

    const result = await verifyAndProcessPayment(reference);

    return NextResponse.json({
      success: result.status === "SUCCESSFUL",
      data: result,
    });
  } catch (error: any) {
    console.error("Payment verification API error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to verify transaction." },
      { status: 500 }
    );
  }
}
