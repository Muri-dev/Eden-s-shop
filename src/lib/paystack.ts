import crypto from "crypto";

function getSecretKey() {
  return process.env.PAYSTACK_SECRET_KEY || "";
}
const PAYSTACK_BASE_URL = "https://api.paystack.co";

export interface InitializePaymentParams {
  email: string;
  amount: number; // in KES or base unit. Paystack expects lowest currency unit (cents), so KES * 100
  reference: string;
  callback_url: string;
  channels?: string[]; // e.g. ['mobile_money', 'card']
  metadata?: {
    orderId: string;
    customerPhone: string;
    customerName: string;
    custom_fields?: Array<{ display_name: string; variable_name: string; value: string }>;
  };
}

export interface InitializePaymentResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface VerifyPaymentResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    domain: string;
    status: "success" | "failed" | "abandoned" | "pending";
    reference: string;
    amount: number; // in cents
    gateway_response: string;
    paid_at: string;
    channel: string; // 'mobile_money', 'card', etc.
    currency: string;
    ip_address: string;
    customer: {
      email: string;
      phone?: string;
    };
    metadata?: {
      orderId?: string;
      customerPhone?: string;
      customerName?: string;
    };
  };
}

/**
 * Initialize a Paystack transaction for checkout (including M-Pesa mobile money)
 */
export async function initializePaystackPayment(
  params: InitializePaymentParams
): Promise<InitializePaymentResponse> {
  const secretKey = getSecretKey();
  const isSampleKey = !secretKey || secretKey.includes("placeholder") || secretKey.includes("sample");

  // If using placeholder/test development key without live network access
  if (isSampleKey) {
    console.log("⚠️ Using Paystack simulated test mode (sample key detected).");
    return {
      status: true,
      message: "Simulation authorization URL initialized",
      data: {
        authorization_url: `/payment/verify?reference=${params.reference}&mode=test_simulate`,
        access_code: `mock_acc_${Date.now()}`,
        reference: params.reference,
      },
    };
  }

  try {
    const amountInSubunits = Math.round(params.amount * 100);

    const payload = {
      email: params.email,
      amount: amountInSubunits,
      reference: params.reference,
      callback_url: params.callback_url,
      currency: "KES",
      channels: params.channels || ["mobile_money", "card"],
      metadata: params.metadata,
    };

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Paystack initialization error:", error);
    return {
      status: false,
      message: error?.message || "Failed to initialize transaction with Paystack",
    };
  }
}

/**
 * Verify Paystack transaction status on backend using secret key
 */
export async function verifyPaystackPayment(
  reference: string
): Promise<VerifyPaymentResponse> {
  const secretKey = getSecretKey();
  const isSampleKey = !secretKey || secretKey.includes("placeholder") || secretKey.includes("sample");

  // If running in development simulation mode
  if (isSampleKey) {
    console.log("⚠️ Simulating Paystack verification for reference:", reference);
    return {
      status: true,
      message: "Simulation payment verified",
      data: {
        id: Math.floor(Math.random() * 100000),
        domain: "test",
        status: "success",
        reference,
        amount: 500000,
        gateway_response: "Successful (M-Pesa / Mobile Money Simulated)",
        paid_at: new Date().toISOString(),
        channel: "mobile_money",
        currency: "KES",
        ip_address: "127.0.0.1",
        customer: {
          email: "customer@edenshop.com",
          phone: "+254712345678",
        },
      },
    };
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Paystack verification error:", error);
    return {
      status: false,
      message: error?.message || "Failed to verify transaction with Paystack",
    };
  }
}

/**
 * Verify Paystack Webhook Signature using HMAC-SHA512
 */
export function verifyPaystackWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secretKey = getSecretKey();
  if (!signatureHeader || !secretKey) return false;

  try {
    const hash = crypto
      .createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    return hash === signatureHeader;
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}
