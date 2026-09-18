import { prisma } from "@/lib/db";
import {
  initializePaystackPayment,
  verifyPaystackPayment,
  verifyPaystackWebhookSignature,
} from "@/lib/paystack";

export interface CreateOrderParams {
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    streetAddress: string;
    apartment?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  shippingMethodId: string;
  couponCode?: string | null;
  items: Array<{
    productId: string;
    variantId?: string | null;
    quantity: number;
  }>;
  notes?: string;
}

/**
 * 1. Authoritative Server-Side Order Creation & Paystack Payment Initialization
 */
export async function initializeOrderPayment(params: CreateOrderParams) {
  if (!params.items || params.items.length === 0) {
    throw new Error("Cannot create an order with an empty shopping bag.");
  }

  // A. Validate items & compute authoritative totals from database
  let subtotal = 0;
  const orderItemsData: any[] = [];

  for (const cartItem of params.items) {
    const product = await prisma.product.findUnique({
      where: { id: cartItem.productId },
      include: { images: true },
    });

    if (!product || product.status !== "PUBLISHED") {
      throw new Error(`Product not found or unavailable: ${cartItem.productId}`);
    }

    let unitPrice = product.price;
    let variantSku = product.sku;
    let variantName = null;
    let availableStock = product.stock;

    if (cartItem.variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: cartItem.variantId },
      });

      if (!variant) {
        throw new Error(`Specification variant not found.`);
      }

      unitPrice = variant.price;
      variantSku = variant.sku;
      variantName = variant.name;
      availableStock = variant.stock;
    } else {
      // Check flash sale or standard discount
      if (product.isFlashSale && product.flashSalePrice) {
        unitPrice = product.flashSalePrice;
      } else if (product.discountPrice) {
        unitPrice = product.discountPrice;
      }
    }

    // Inventory check
    if (cartItem.quantity > availableStock) {
      throw new Error(
        `Insufficient inventory for "${product.name}". Only ${availableStock} units remain.`
      );
    }

    const lineTotal = unitPrice * cartItem.quantity;
    subtotal += lineTotal;

    orderItemsData.push({
      productId: product.id,
      variantId: cartItem.variantId || null,
      productName: product.name,
      variantName,
      sku: variantSku,
      priceAtPurchase: unitPrice,
      discountAtPurchase: 0,
      quantity: cartItem.quantity,
      subtotal: lineTotal,
      imageAtPurchase: product.images[0]?.url || null,
    });
  }

  // B. Validate Shipping Method
  const shippingMethod = await prisma.shippingMethod.findUnique({
    where: { id: params.shippingMethodId },
  });

  if (!shippingMethod) {
    throw new Error("Invalid shipping method selected.");
  }

  let shippingCost = shippingMethod.cost;
  if (shippingMethod.minOrderForFree && subtotal >= shippingMethod.minOrderForFree) {
    shippingCost = 0;
  }

  // C. Validate Coupon Discount (if provided)
  let discountAmount = 0;
  let appliedCouponId: string | null = null;

  if (params.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: params.couponCode.trim().toUpperCase() },
    });

    if (coupon && coupon.isActive) {
      const now = new Date();
      const isValidDates = (!coupon.startDate || now >= coupon.startDate) &&
                           (!coupon.endDate || now <= coupon.endDate);
      const isUnderLimit = !coupon.usageLimit || coupon.timesUsed < coupon.usageLimit;
      const meetsMinOrder = !coupon.minOrderValue || subtotal >= coupon.minOrderValue;

      if (isValidDates && isUnderLimit && meetsMinOrder) {
        appliedCouponId = coupon.id;
        if (coupon.discountType === "PERCENTAGE") {
          discountAmount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountValue && discountAmount > coupon.maxDiscountValue) {
            discountAmount = coupon.maxDiscountValue;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
        discountAmount = Math.min(discountAmount, subtotal);
      }
    }
  }

  // D. Authoritative Grand Total
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  // Generate Unique Order Number
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `EDN-${new Date().getFullYear()}-${randomSuffix}`;
  const paymentReference = `pay_edn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // E. Atomic Database Transaction to persist Order and Payment Record
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const callbackUrl = `${appUrl}/payment/verify?reference=${paymentReference}`;

  const { order, payment } = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId: params.userId || null,
        customerName: params.customerName,
        customerEmail: params.customerEmail,
        customerPhone: params.customerPhone,
        shippingAddressJson: JSON.stringify(params.shippingAddress),
        shippingMethodId: shippingMethod.id,
        shippingMethodName: shippingMethod.name,
        shippingCost,
        subtotal,
        discountAmount,
        grandTotal,
        currency: "KES",
        status: "PAYMENT_PENDING",
        paymentStatus: "PENDING",
        notes: params.notes || null,
        items: {
          create: orderItemsData,
        },
      },
      include: { items: true },
    });

    if (appliedCouponId) {
      await tx.couponUsage.create({
        data: {
          couponId: appliedCouponId,
          orderId: newOrder.id,
          userId: params.userId || null,
        },
      });

      await tx.coupon.update({
        where: { id: appliedCouponId },
        data: { timesUsed: { increment: 1 } },
      });
    }

    const newPayment = await tx.payment.create({
      data: {
        orderId: newOrder.id,
        reference: paymentReference,
        amount: grandTotal,
        currency: "KES",
        channel: "mobile_money",
        status: "PENDING",
        provider: "PAYSTACK",
        customerEmail: params.customerEmail,
        customerPhone: params.customerPhone,
      },
    });

    return { order: newOrder, payment: newPayment };
  });

  // F. Initialize Paystack Transaction
  const paystackRes = await initializePaystackPayment({
    email: params.customerEmail,
    amount: grandTotal,
    reference: paymentReference,
    callback_url: callbackUrl,
    channels: ["mobile_money", "card"],
    metadata: {
      orderId: order.id,
      customerPhone: params.customerPhone,
      customerName: params.customerName,
      custom_fields: [
        {
          display_name: "Order Number",
          variable_name: "order_number",
          value: orderNumber,
        },
        {
          display_name: "Customer Phone",
          variable_name: "customer_phone",
          value: params.customerPhone,
        },
      ],
    },
  });

  if (!paystackRes.status || !paystackRes.data?.authorization_url) {
    throw new Error(paystackRes.message || "Failed to initialize Paystack gateway.");
  }

  return {
    orderNumber: order.orderNumber,
    orderId: order.id,
    reference: paymentReference,
    grandTotal,
    authorizationUrl: paystackRes.data.authorization_url,
  };
}

/**
 * 2. Idempotent Server-Side Verification & Inventory Deduction
 */
export async function verifyAndProcessPayment(reference: string) {
  if (!reference) {
    throw new Error("Missing payment reference.");
  }

  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: {
      order: {
        include: { items: true },
      },
    },
  });

  if (!payment) {
    throw new Error(`No payment record found for reference: ${reference}`);
  }

  // IDEMPOTENCY CHECK: If already processed successfully, do not re-deduct stock or re-credit!
  if (payment.status === "SUCCESSFUL" && payment.order.status === "PAID") {
    return {
      status: "SUCCESSFUL",
      orderNumber: payment.order.orderNumber,
      orderId: payment.order.id,
      amount: payment.amount,
      message: "Payment previously verified and fulfilled.",
    };
  }

  // Call Paystack API to verify status
  const verification = await verifyPaystackPayment(reference);

  if (!verification.status || !verification.data) {
    return {
      status: "FAILED",
      orderNumber: payment.order.orderNumber,
      message: verification.message || "Verification request failed.",
    };
  }

  const data = verification.data;

  // Handle SUCCESS
  if (data.status === "success") {
    await prisma.$transaction(async (tx) => {
      // 1. Update Payment
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESSFUL",
          channel: data.channel || "mobile_money",
          paidAt: new Date(data.paid_at || Date.now()),
          providerResponseJson: JSON.stringify(data),
        },
      });

      // 2. Update Order
      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: "PAID",
          paymentStatus: "SUCCESSFUL",
        },
      });

      // 3. Atomically Deduct Inventory for each ordered item
      for (const item of payment.order.items) {
        if (item.variantId) {
          const variant = await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { decrement: item.quantity },
            },
          });

          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              type: "ORDER_CONFIRMED",
              quantity: -item.quantity,
              remainingStock: variant.stock,
              reason: `Fulfillment for Order ${payment.order.orderNumber}`,
              referenceId: payment.order.id,
              performedBy: "Paystack Gateway Hook",
            },
          });
        } else {
          const product = await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
            },
          });

          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              type: "ORDER_CONFIRMED",
              quantity: -item.quantity,
              remainingStock: product.stock,
              reason: `Fulfillment for Order ${payment.order.orderNumber}`,
              referenceId: payment.order.id,
              performedBy: "Paystack Gateway Hook",
            },
          });
        }
      }

      // 4. Record Payment Event
      await tx.paymentEvent.create({
        data: {
          paymentId: payment.id,
          eventType: "charge.success",
          reference,
          payloadJson: JSON.stringify(data),
        },
      });
    });

    return {
      status: "SUCCESSFUL",
      orderNumber: payment.order.orderNumber,
      orderId: payment.order.id,
      amount: payment.amount,
      message: "Payment successfully verified and order confirmed.",
    };
  } else if (data.status === "failed") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        providerResponseJson: JSON.stringify(data),
      },
    });

    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: "FAILED",
      },
    });

    return {
      status: "FAILED",
      orderNumber: payment.order.orderNumber,
      message: data.gateway_response || "Payment transaction was declined.",
    };
  } else {
    return {
      status: "PENDING",
      orderNumber: payment.order.orderNumber,
      message: "Payment is still processing by Safaricom / Paystack.",
    };
  }
}

/**
 * 3. Secure Paystack Webhook Handler (HMAC-SHA512 Signature & Idempotency)
 */
export async function processPaystackWebhook(rawBody: string, signature: string | null) {
  // Validate HMAC signature
  const isValid = verifyPaystackWebhookSignature(rawBody, signature);
  if (!isValid) {
    throw new Error("Invalid Paystack webhook signature.");
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success" && event.data?.reference) {
    const reference = event.data.reference;
    return await verifyAndProcessPayment(reference);
  }

  return { received: true, ignored: event.event };
}
