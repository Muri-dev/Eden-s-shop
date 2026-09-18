import { NextResponse } from "next/server";
import { processPaystackWebhook } from "@/services/payment.service";

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-paystack-signature");
    const rawBody = await req.text();

    if (!signature) {
      return NextResponse.json(
        { error: "Missing webhook signature" },
        { status: 400 }
      );
    }

    // Process asynchronously & idempotently
    const result = await processPaystackWebhook(rawBody, signature);

    // Paystack expects an immediate 200 response
    return NextResponse.json({ received: true, result }, { status: 200 });
  } catch (error: any) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json(
      { error: error?.message || "Webhook processing failed" },
      { status: 400 }
    );
  }
}
