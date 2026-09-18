import { prisma } from "../src/lib/db";

async function main() {
  console.log("Testing checkout order creation & payment initialize...");
  const product = await prisma.product.findFirst({
    include: { variants: true },
  });
  const shipping = await prisma.shippingMethod.findFirst();

  if (!product || !shipping) {
    console.error("No product or shipping method found");
    process.exit(1);
  }

  const payload = {
    customerName: "Alexander Vance",
    customerEmail: "customer@edenshop.com",
    customerPhone: "+254712345678",
    shippingAddress: {
      fullName: "Alexander Vance",
      phone: "+254712345678",
      streetAddress: "Kitisuru Ridge, Villa 14",
      city: "Nairobi",
      state: "Nairobi County",
      postalCode: "00100",
      country: "Kenya",
    },
    shippingMethodId: shipping.id,
    couponCode: "EDENLUXURY20",
    items: [
      {
        productId: product.id,
        variantId: product.variants[0]?.id,
        quantity: 1,
      },
    ],
  };

  try {
    const res = await fetch("http://localhost:3000/api/payments/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("Checkout Init Response Status:", res.status);
    console.log("Checkout Result:", data);
  } catch (err: any) {
    console.error("Fetch error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
