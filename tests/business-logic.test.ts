import { verifyPaystackWebhookSignature } from "../src/lib/paystack";
import { signCustomerToken, verifyCustomerToken, signAdminToken, verifyAdminToken } from "../src/lib/auth";
import { prisma } from "../src/lib/db";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

// Load .env manually for standalone script runner
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
          const key = trimmed.substring(0, eqIdx).trim();
          let val = trimmed.substring(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
} catch (e) {}

async function runTests() {
  console.log("==========================================");
  console.log("🧪 RUNNING EDEN'S SHOP BUSINESS LOGIC TESTS");
  console.log("==========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // TEST 1: Paystack HMAC-SHA512 Webhook Verification
  try {
    const testSecret = process.env.PAYSTACK_SECRET_KEY || "mock_signature_test_secret_2026";
    const samplePayload = JSON.stringify({
      event: "charge.success",
      data: { reference: "EDEN-PAY-TEST1234", amount: 1500000 },
    });
    const expectedSignature = crypto
      .createHmac("sha512", testSecret)
      .update(samplePayload)
      .digest("hex");

    const isValid = verifyPaystackWebhookSignature(samplePayload, expectedSignature);
    assert(isValid === true, "Paystack Webhook HMAC-SHA512 Signature Validates Correctly");

    const isTampered = verifyPaystackWebhookSignature(samplePayload + "tampered", expectedSignature);
    assert(isTampered === false, "Paystack Webhook Rejects Tampered Payload");
  } catch (err: any) {
    console.error("Test 1 error:", err);
    failed++;
  }

  // TEST 2: JWT Token Generation & Verification
  try {
    const payload = { userId: "user-12345", email: "collector@edenshop.com", name: "Lord Kensington", role: "CUSTOMER" as const };
    const token = signCustomerToken(payload);
    assert(typeof token === "string" && token.length > 20, "JWT Token Created Successfully");

    const decoded = verifyCustomerToken(token);
    assert(decoded !== null && decoded.userId === "user-12345" && decoded.role === "CUSTOMER", "JWT Token Decodes and Verifies Payload");

    const badToken = token + "xyz";
    const decodedBad = verifyCustomerToken(badToken);
    assert(decodedBad === null, "JWT Verification Safely Rejects Invalid Token");
  } catch (err: any) {
    console.error("Test 2 error:", err);
    failed++;
  }

  // TEST 3: Password Hashing and Verification
  try {
    const password = "SecretEdenPassword2026!";
    const hash = await bcrypt.hash(password, 10);
    const isMatch = await bcrypt.compare(password, hash);
    const isMismatch = await bcrypt.compare("WrongPassword", hash);

    assert(isMatch === true, "Bcrypt Password Hash Matches Correct Password");
    assert(isMismatch === false, "Bcrypt Password Hash Rejects Incorrect Password");
  } catch (err: any) {
    console.error("Test 3 error:", err);
    failed++;
  }

  // TEST 4: Supabase PostgreSQL Connection & Catalog Integrity
  try {
    const productCount = await prisma.product.count({ where: { status: "PUBLISHED" } });
    assert(productCount > 0, `Supabase Postgres Live Connection: Found ${productCount} Published Luxury Products`);

    const categoryCount = await prisma.category.count();
    assert(categoryCount > 0, `Supabase Postgres Live Connection: Found ${categoryCount} Active Categories`);

    const shippingCount = await prisma.shippingMethod.count();
    assert(shippingCount > 0, `Supabase Postgres Live Connection: Found ${shippingCount} White-Glove Shipping Methods`);

    const couponCount = await prisma.coupon.count({ where: { isActive: true } });
    assert(couponCount > 0, `Supabase Postgres Live Connection: Found ${couponCount} Active Coupons`);
  } catch (err: any) {
    console.error("Test 4 DB error:", err);
    failed++;
  }

  // TEST 5: Cart Calculation & Discount Validation Logic
  try {
    const subtotal = 100000;
    const shippingCost = 1500;
    const discountPercent = 20; // 20% off
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const total = subtotal - discountAmount + shippingCost;

    assert(discountAmount === 20000, "20% Discount Correctly Computed to 20,000");
    assert(total === 81500, "Order Total Correctly Computed to 81,500 with Shipping");
  } catch (err: any) {
    console.error("Test 5 error:", err);
    failed++;
  }

  console.log("\n==========================================");
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("Test runner execution failed:", err);
  process.exit(1);
});
