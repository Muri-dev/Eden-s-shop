import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Eden's Shop database seed...");

  // 1. Clean existing records for clean idempotent seed
  await prisma.auditLog.deleteMany();
  await prisma.paymentEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.flashSaleProduct.deleteMany();
  await prisma.flashSale.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.shippingMethod.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.adminUser.deleteMany();

  console.log("🧹 Cleared existing database tables.");

  // 2. Admin Users
  const adminPasswordHash = await bcrypt.hash("AdminEden2026!", 10);
  const superAdmin = await prisma.adminUser.create({
    data: {
      email: "admin@edenshop.com",
      passwordHash: adminPasswordHash,
      name: "Eden Store Executive Admin",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  const staffPasswordHash = await bcrypt.hash("StaffEden2026!", 10);
  await prisma.adminUser.create({
    data: {
      email: "staff@edenshop.com",
      passwordHash: staffPasswordHash,
      name: "Victoria Montgomery",
      role: "STAFF",
      status: "ACTIVE",
    },
  });

  console.log("👤 Created Admin accounts (admin@edenshop.com / AdminEden2026!)");

  // 3. Demo Customer User
  const customerPasswordHash = await bcrypt.hash("CustomerEden2026!", 10);
  const demoCustomer = await prisma.user.create({
    data: {
      email: "customer@edenshop.com",
      passwordHash: customerPasswordHash,
      name: "Alexander Vance",
      phone: "+254712345678",
      status: "ACTIVE",
      role: "CUSTOMER",
    },
  });

  // Default address for demo customer
  await prisma.address.create({
    data: {
      userId: demoCustomer.id,
      type: "SHIPPING",
      fullName: "Alexander Vance",
      phone: "+254712345678",
      streetAddress: "Kitisuru Ridge, Villa 14",
      apartment: "Penthouse Suite",
      city: "Nairobi",
      state: "Nairobi County",
      postalCode: "00100",
      country: "Kenya",
      isDefault: true,
    },
  });

  console.log("👤 Created Demo Customer (customer@edenshop.com / CustomerEden2026!)");

  // 4. Categories
  const catLeather = await prisma.category.create({
    data: {
      name: "Fine Leather Goods",
      slug: "fine-leather-goods",
      description: "Handcrafted full-grain Italian leather briefcases, travel weekenders, and wallets.",
      image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop",
      isFeatured: true,
      order: 1,
    },
  });

  const catWatches = await prisma.category.create({
    data: {
      name: "Horology & Watches",
      slug: "horology-and-watches",
      description: "Precision automatic and mechanical Swiss-caliber luxury timepieces.",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop",
      isFeatured: true,
      order: 2,
    },
  });

  const catFragrance = await prisma.category.create({
    data: {
      name: "Haute Fragrance",
      slug: "haute-fragrance",
      description: "Artisanal extrait de parfum featuring rare agarwood, amber, and Damask rose.",
      image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop",
      isFeatured: true,
      order: 3,
    },
  });

  const catJewelry = await prisma.category.create({
    data: {
      name: "Fine Jewelry",
      slug: "fine-jewelry",
      description: "Ethically sourced gold, platinum, and brilliant cut gemstones crafted by master jewelers.",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1000&auto=format&fit=crop",
      isFeatured: true,
      order: 4,
    },
  });

  const catApparel = await prisma.category.create({
    data: {
      name: "Cashmere & Silk Apparel",
      slug: "cashmere-and-silk-apparel",
      description: "Ultra-fine Grade-A Mongolian cashmere sweaters, coats, and mulberry silk loungewear.",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop",
      isFeatured: true,
      order: 5,
    },
  });

  // 5. Brands
  const brandEden = await prisma.brand.create({
    data: {
      name: "Eden Atelier",
      slug: "eden-atelier",
      description: "The hallmark of timeless refinement and bespoke craftsmanship.",
      logo: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=200&auto=format&fit=crop",
      isFeatured: true,
    },
  });

  const brandVance = await prisma.brand.create({
    data: {
      name: "Vance & Co. Geneva",
      slug: "vance-and-co",
      description: "Independent master horologists creating chronographs since 1912.",
      isFeatured: true,
    },
  });

  const brandMaison = await prisma.brand.create({
    data: {
      name: "Maison d'Ambre",
      slug: "maison-d-ambre",
      description: "Parisian perfumery blending rare natural botanical essences.",
      isFeatured: true,
    },
  });

  const brandAurelia = await prisma.brand.create({
    data: {
      name: "Aurélia Fine Gems",
      slug: "aurelia-fine-gems",
      description: "Architectural 18k solid gold fine jewelry and solitaire pieces.",
      isFeatured: true,
    },
  });

  // 6. Products with Variants, Images & Specs
  const productsData = [
    {
      name: "Eden Grand Sovereign Automatic Chronometer",
      slug: "eden-grand-sovereign-automatic-chronometer",
      sku: "WAT-EDEN-001",
      description: "An exceptional masterpiece of horological engineering. The Grand Sovereign features a 40mm brushed 316L stainless steel case, anti-reflective sapphire crystal, and an in-house automatic movement with a 72-hour power reserve. Water-resistant up to 100 meters.",
      shortDescription: "40mm automatic Swiss-caliber timepiece with 72-hour power reserve.",
      categoryId: catWatches.id,
      brandId: brandVance.id,
      price: 185000,
      discountPrice: 165000,
      costPrice: 95000,
      stock: 12,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      isFlashSale: true,
      flashSalePrice: 155000,
      tags: "luxury, watch, automatic, sapphire, swiss, mens",
      images: [
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?q=80&w=1000&auto=format&fit=crop",
      ],
      variants: [
        { sku: "WAT-EDEN-001-SLV", name: "Silver Sunburst Dial / Steel Bracelet", size: "40mm", color: "Silver", colorCode: "#C0C0C0", price: 165000, stock: 7 },
        { sku: "WAT-EDEN-001-BLK", name: "Onyx Black Dial / Alligator Strap", size: "40mm", color: "Deep Black", colorCode: "#111111", price: 172000, stock: 5 },
      ],
      specs: [
        { key: "Movement", value: "Caliber ED-8902 Automatic" },
        { key: "Power Reserve", value: "72 Hours" },
        { key: "Case Diameter", value: "40 mm" },
        { key: "Crystal", value: "Scratch-resistant Sapphire" },
        { key: "Water Resistance", value: "10 ATM / 100 Meters" },
      ],
    },
    {
      name: "The Savoy Heritage Leather Holdall Weekender",
      slug: "the-savoy-heritage-leather-holdall-weekender",
      sku: "LEA-SAV-002",
      description: "Meticulously handcrafted from full-grain vegetable-tanned Tuscan leather. Engineered to age gracefully and develop a rich, lustrous patina. Accompanied by solid brass hardware, YKK Excella zippers, and reinforced base studs for lifetimes of refined travel.",
      shortDescription: "Tuscan vegetable-tanned full-grain leather weekender bag.",
      categoryId: catLeather.id,
      brandId: brandEden.id,
      price: 68000,
      discountPrice: 59500,
      costPrice: 28000,
      stock: 18,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      isFlashSale: false,
      tags: "leather, luggage, travel, weekender, handcrafted, carry-on",
      images: [
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop",
      ],
      variants: [
        { sku: "LEA-SAV-002-COG", name: "Cognac Tan", color: "Cognac Tan", colorCode: "#964B00", price: 59500, stock: 10 },
        { sku: "LEA-SAV-002-ESP", name: "Espresso Dark Brown", color: "Dark Espresso", colorCode: "#241813", price: 59500, stock: 8 },
      ],
      specs: [
        { key: "Material", value: "100% Full Grain Tuscan Leather" },
        { key: "Lining", value: "Heavy Cotton Canvas with Suede Accents" },
        { key: "Dimensions", value: "52cm x 28cm x 30cm" },
        { key: "Capacity", value: "42 Liters (Complies with airline carry-on)" },
      ],
    },
    {
      name: "Oud Impérial Extrait de Parfum (100ml)",
      slug: "oud-imperial-extrait-de-parfum-100ml",
      sku: "FRG-OUD-003",
      description: "An opulent concentration of wild Cambodian agarwood, rare Taif rose, ambergris, and smoky bourbon vanilla. Created with a 35% oil concentration for extraordinary projection and all-day sillage.",
      shortDescription: "Rare natural agarwood and Taif rose 35% concentration extrait.",
      categoryId: catFragrance.id,
      brandId: brandMaison.id,
      price: 38500,
      discountPrice: 34000,
      costPrice: 14000,
      stock: 25,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      isFlashSale: true,
      flashSalePrice: 31000,
      tags: "fragrance, perfume, oud, luxury, niche, unisex",
      images: [
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1000&auto=format&fit=crop",
      ],
      variants: [
        { sku: "FRG-OUD-003-100", name: "100ml Crystal Flacon", size: "100ml", price: 34000, stock: 18 },
        { sku: "FRG-OUD-003-50", name: "50ml Travel Flacon", size: "50ml", price: 22000, stock: 7 },
      ],
      specs: [
        { key: "Concentration", value: "Extrait de Parfum (35% Oil)" },
        { key: "Top Notes", value: "Bergamot, Pink Peppercorn, Saffron" },
        { key: "Heart Notes", value: "Taif Rose, Pure Cambodian Oud, Cedar" },
        { key: "Base Notes", value: "Ambergris, Bourbon Vanilla, Birch Tar" },
      ],
    },
    {
      name: "The Eden Solitaire 18K Yellow Gold Bangle",
      slug: "the-eden-solitaire-18k-yellow-gold-bangle",
      sku: "JWL-SOL-004",
      description: "Crafted in solid 18-karat recycled yellow gold with an architectural beveled silhouette. Features a subtle push-lock closure mechanism with safety clasp and a secret natural conflict-free diamond inset.",
      shortDescription: "Architectural 18k solid yellow gold hinge bangle with hidden diamond.",
      categoryId: catJewelry.id,
      brandId: brandAurelia.id,
      price: 245000,
      discountPrice: null,
      costPrice: 150000,
      stock: 6,
      lowStockThreshold: 2,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      isFlashSale: false,
      tags: "jewelry, gold, 18k, bangle, diamond, fine jewelry",
      images: [
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1611591475846-59152b1b36fa?q=80&w=1000&auto=format&fit=crop",
      ],
      variants: [
        { sku: "JWL-SOL-004-SM", name: "Small (16cm circumference)", size: "Small", color: "18K Gold", colorCode: "#D4AF37", price: 245000, stock: 2 },
        { sku: "JWL-SOL-004-MD", name: "Medium (17.5cm circumference)", size: "Medium", color: "18K Gold", colorCode: "#D4AF37", price: 245000, stock: 3 },
        { sku: "JWL-SOL-004-LG", name: "Large (19cm circumference)", size: "Large", color: "18K Gold", colorCode: "#D4AF37", price: 245000, stock: 1 },
      ],
      specs: [
        { key: "Metal", value: "Solid 18K Yellow Gold (Au 750)" },
        { key: "Stone", value: "0.08ct F-G VS1 Natural Diamond" },
        { key: "Weight", value: "24.6 grams" },
        { key: "Closure", value: "Concealed Double-Click Safety" },
      ],
    },
    {
      name: "Mongolian Pure Cashmere Double-Breasted Overcoat",
      slug: "mongolian-pure-cashmere-double-breasted-overcoat",
      sku: "APP-CSH-005",
      description: "Tailored in Italy from 100% unblended 4-ply Mongolian grade-A cashmere. Unbelievably soft, lightweight yet thermally insulating. Features horn buttons, cupro silk lining, and peak lapels.",
      shortDescription: "100% 4-ply Grade-A Mongolian cashmere tailored overcoat.",
      categoryId: catApparel.id,
      brandId: brandEden.id,
      price: 115000,
      discountPrice: 98000,
      costPrice: 52000,
      stock: 14,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      isFlashSale: false,
      tags: "cashmere, coat, luxury, winter, apparel, outerwear",
      images: [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop",
      ],
      variants: [
        { sku: "APP-CSH-005-CAM-M", name: "Camel Beige - Size 48 / Medium", size: "48 (M)", color: "Camel", colorCode: "#C19A6B", price: 98000, stock: 5 },
        { sku: "APP-CSH-005-CAM-L", name: "Camel Beige - Size 50 / Large", size: "50 (L)", color: "Camel", colorCode: "#C19A6B", price: 98000, stock: 4 },
        { sku: "APP-CSH-005-ESP-M", name: "Espresso Brown - Size 48 / Medium", size: "48 (M)", color: "Espresso", colorCode: "#241813", price: 98000, stock: 3 },
        { sku: "APP-CSH-005-ESP-L", name: "Espresso Brown - Size 50 / Large", size: "50 (L)", color: "Espresso", colorCode: "#241813", price: 98000, stock: 2 },
      ],
      specs: [
        { key: "Fabric", value: "100% Mongolian Cashmere (380g/m²)" },
        { key: "Lining", value: "100% Bemberg Cupro Silk" },
        { key: "Buttons", value: "Genuine Water Buffalo Horn" },
        { key: "Care", value: "Specialist Dry Clean Only" },
      ],
    },
    {
      name: "The Kensington Bridle Leather Document Folio",
      slug: "the-kensington-bridle-leather-document-folio",
      sku: "LEA-FOL-006",
      description: "Slim, structured luxury folio fitted for 14-inch laptops, documents, and stylus pens. Hand-burnished edges with wax thread saddle-stitching.",
      shortDescription: "Handcrafted English bridle leather laptop & document folio.",
      categoryId: catLeather.id,
      brandId: brandEden.id,
      price: 32000,
      discountPrice: 28500,
      costPrice: 12000,
      stock: 22,
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: false,
      isFlashSale: false,
      tags: "leather, folio, laptop sleeve, office, luxury, accessories",
      images: [
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1000&auto=format&fit=crop",
      ],
      variants: [
        { sku: "LEA-FOL-006-BLK", name: "Midnight Black", color: "Black", colorCode: "#000000", price: 28500, stock: 12 },
        { sku: "LEA-FOL-006-BRN", name: "Cognac Brown", color: "Cognac", colorCode: "#8B4513", price: 28500, stock: 10 },
      ],
      specs: [
        { key: "Compatibility", value: "MacBook Pro 14\", iPad Pro 12.9\", A4 Documents" },
        { key: "Closure", value: "Dual Magnetic Snap Lock" },
      ],
    },
    {
      name: "Rose de Grasse Nectar Extrait (50ml)",
      slug: "rose-de-grasse-nectar-extrait-50ml",
      sku: "FRG-ROS-007",
      description: "Harvested at dawn in Grasse, France. Centifolia rose petals infused with sparkling bergamot, creamy sandalwood, and white musk.",
      shortDescription: "Rare dawn-harvested Grasse rose with white amber and sandalwood.",
      categoryId: catFragrance.id,
      brandId: brandMaison.id,
      price: 29500,
      discountPrice: null,
      costPrice: 11000,
      stock: 20,
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      isFlashSale: false,
      tags: "perfume, floral, rose, grasse, niche, perfume",
      images: [
        "https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1000&auto=format&fit=crop",
      ],
      variants: [],
      specs: [
        { key: "Volume", value: "50ml Flacon" },
        { key: "Family", value: "Floral Oriental" },
      ],
    },
    {
      name: "Eden Pavé Diamond Eternity Ring",
      slug: "eden-pave-diamond-eternity-ring",
      sku: "JWL-ETR-008",
      description: "A continuous band of hand-selected round brilliant cut diamonds set in 18K white gold. 1.50 total carat weight of exceptional VVS clarity.",
      shortDescription: "18K white gold 1.50ct total weight diamond eternity band.",
      categoryId: catJewelry.id,
      brandId: brandAurelia.id,
      price: 195000,
      discountPrice: 175000,
      costPrice: 110000,
      stock: 8,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: false,
      isFlashSale: false,
      tags: "ring, diamond, eternity, 18k, wedding, fine jewelry",
      images: [
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop",
      ],
      variants: [
        { sku: "JWL-ETR-008-6", name: "US Size 6 (52mm)", size: "6", price: 175000, stock: 3 },
        { sku: "JWL-ETR-008-7", name: "US Size 7 (54mm)", size: "7", price: 175000, stock: 3 },
        { sku: "JWL-ETR-008-8", name: "US Size 8 (57mm)", size: "8", price: 175000, stock: 2 },
      ],
      specs: [
        { key: "Total Diamond Weight", value: "1.50 Carats" },
        { key: "Color & Clarity", value: "F-G Color, VVS2 Clarity" },
        { key: "Metal", value: "18K White Gold (Au 750)" },
      ],
    }
  ];

  for (const item of productsData) {
    const product = await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        description: item.description,
        shortDescription: item.shortDescription,
        categoryId: item.categoryId,
        brandId: item.brandId,
        price: item.price,
        discountPrice: item.discountPrice,
        costPrice: item.costPrice,
        stock: item.stock,
        lowStockThreshold: item.lowStockThreshold || 5,
        isFeatured: item.isFeatured,
        isBestSeller: item.isBestSeller,
        isNewArrival: item.isNewArrival,
        isFlashSale: item.isFlashSale,
        flashSalePrice: item.flashSalePrice || null,
        tags: item.tags,
        status: "PUBLISHED",
        seoTitle: `${item.name} | Eden's Shop Luxury Store`,
        seoDescription: item.shortDescription,
      },
    });

    // Add Images
    for (let i = 0; i < item.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: item.images[i],
          altText: `${product.name} - Image ${i + 1}`,
          order: i,
          isThumbnail: i === 0,
        },
      });
    }

    // Add Variants
    for (const v of item.variants) {
      const vAny = v as any;
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: v.sku,
          name: v.name,
          size: vAny.size || null,
          color: vAny.color || null,
          colorCode: vAny.colorCode || null,
          price: v.price,
          stock: v.stock,
        },
      });
    }

    // Add Specifications
    for (let i = 0; i < item.specs.length; i++) {
      await prisma.productSpecification.create({
        data: {
          productId: product.id,
          key: item.specs[i].key,
          value: item.specs[i].value,
          order: i,
        },
      });
    }

    // Initial Inventory Movement
    await prisma.inventoryMovement.create({
      data: {
        productId: product.id,
        type: "IN",
        quantity: item.stock,
        remainingStock: item.stock,
        reason: "Initial catalogue intake",
        performedBy: "Initial System Seed",
      },
    });

    // Sample reviews for social proof
    await prisma.review.create({
      data: {
        productId: product.id,
        userId: demoCustomer.id,
        rating: 5,
        title: "Absolute perfection and unmatched craft",
        comment: "Eden's delivery was swift in Nairobi, and the packaging is extraordinarily luxurious. The craftsmanship exceeded every expectation.",
        isVerifiedPurchase: true,
        status: "APPROVED",
      },
    });
  }

  console.log(`📦 Created ${productsData.length} luxury products with variants, images, specifications, and reviews.`);

  // 7. Shipping Methods
  const shippingMethods = [
    { name: "Nairobi Express Courier (Same Day)", description: "Dispatched via private concierge within 4 hours", cost: 850, estimatedDays: "Same Day", minOrderForFree: 100000, order: 1 },
    { name: "Standard Kenya Courier (G4S / Wells Fargo)", description: "Insured nationwide delivery with trackable dispatch", cost: 500, estimatedDays: "1 - 2 Business Days", minOrderForFree: 75000, order: 2 },
    { name: "East Africa Regional Express", description: "Uganda, Tanzania, Rwanda priority air cargo", cost: 3500, estimatedDays: "3 - 4 Business Days", minOrderForFree: 250000, order: 3 },
    { name: "Eden VIP Boutique Pickup (Westlands)", description: "Collect with complimentary champagne tasting at Eden Lounge", cost: 0, estimatedDays: "Ready in 2 hours", order: 4 },
  ];

  for (const sm of shippingMethods) {
    await prisma.shippingMethod.create({ data: sm });
  }
  console.log("🚚 Created Shipping Methods.");

  // 8. Coupons
  await prisma.coupon.create({
    data: {
      code: "EDENLUXURY20",
      description: "20% off your first luxury investment",
      discountType: "PERCENTAGE",
      discountValue: 20,
      minOrderValue: 50000,
      maxDiscountValue: 40000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      usageLimit: 500,
      perCustomerLimit: 1,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: "WELCOME10",
      description: "10% Welcome discount for new patrons",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderValue: 20000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      usageLimit: 1000,
      perCustomerLimit: 1,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: "VIP5000",
      description: "KSh 5,000 fixed privilege credit",
      discountType: "FIXED",
      discountValue: 5000,
      minOrderValue: 60000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  console.log("🎟️ Created active luxury coupons (EDENLUXURY20, WELCOME10, VIP5000).");

  // 9. Flash Sale
  const flashSale = await prisma.flashSale.create({
    data: {
      title: "The Autumn Horology & Scent Flash Sale",
      description: "Limited quantities of our most coveted timepieces and extraits available at preferential privilege prices.",
      bannerImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Active for 7 days
      isActive: true,
    },
  });

  // Attach the Grand Sovereign watch to flash sale
  const watchProduct = await prisma.product.findFirst({ where: { slug: "eden-grand-sovereign-automatic-chronometer" } });
  if (watchProduct) {
    await prisma.flashSaleProduct.create({
      data: {
        flashSaleId: flashSale.id,
        productId: watchProduct.id,
        salePrice: 155000,
        maxQuantity: 10,
        soldQuantity: 3,
        perCustomerLimit: 1,
      },
    });
  }

  // 10. Promotional Banners & CMS Site Settings
  await prisma.banner.create({
    data: {
      title: "The Signature Leather Collection",
      subtitle: "Hand-burnished Italian vegetable-tanned leather, conceived for modern aristocrats.",
      imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1600&auto=format&fit=crop",
      targetUrl: "/shop?category=fine-leather-goods",
      buttonText: "Discover Collection",
      position: "HOME_TOP",
      isActive: true,
      order: 1,
    },
  });

  const siteSettings = [
    { key: "store_name", value: "Eden's Shop", group: "GENERAL" },
    { key: "store_tagline", value: "Timeless Refinement & Curated Luxury", group: "GENERAL" },
    { key: "store_currency", value: "KES", group: "GENERAL" },
    { key: "store_currency_symbol", value: "KSh", group: "GENERAL" },
    { key: "contact_email", value: "concierge@edenshop.com", group: "CONTACT" },
    { key: "contact_phone", value: "+254 700 888 999", group: "CONTACT" },
    { key: "contact_address", value: "Eden Pavilion, 4th Floor, Westlands, Nairobi, Kenya", group: "CONTACT" },
    { key: "announcement_text", value: "Complimentary White-Glove Courier Delivery on all orders over KSh 75,000 | Safaricom M-Pesa Supported", group: "HERO" },
    { key: "announcement_active", value: "true", group: "HERO" },
    { key: "hero_title", value: "The Pinnacle of Craftsmanship & Modern Elegance", group: "HERO" },
    { key: "hero_subtitle", value: "Explore exceptional horology, handcrafted leather goods, and rare artisanal perfumes curated for the discerning patron.", group: "HERO" },
    { key: "hero_cta_primary", value: "Explore The Vault", group: "HERO" },
    { key: "hero_cta_secondary", value: "View New Arrivals", group: "HERO" },
    { key: "return_policy", value: "We offer an unconditional 14-day return and exchange policy for unworn, unaltered items in their original luxury presentation packaging.", group: "POLICIES" },
    { key: "authenticity_guarantee", value: "Every timepiece, jewel, and leather creation includes an individually numbered Eden Certificate of Authenticity and comprehensive 3-year warranty.", group: "POLICIES" },
  ];

  for (const setting of siteSettings) {
    await prisma.siteSetting.create({ data: setting });
  }

  // 11. Initial Demo Order for testing Order History & Admin Views
  const demoOrder = await prisma.order.create({
    data: {
      orderNumber: "EDN-2026-0891",
      userId: demoCustomer.id,
      customerEmail: demoCustomer.email,
      customerName: demoCustomer.name,
      customerPhone: demoCustomer.phone || "+254712345678",
      shippingAddressJson: JSON.stringify({
        fullName: "Alexander Vance",
        phone: "+254712345678",
        streetAddress: "Kitisuru Ridge, Villa 14",
        city: "Nairobi",
        country: "Kenya",
      }),
      shippingMethodName: "Nairobi Express Courier (Same Day)",
      shippingCost: 850,
      subtotal: 59500,
      discountAmount: 5000,
      taxAmount: 0,
      grandTotal: 55350,
      currency: "KES",
      status: "PAID",
      paymentStatus: "SUCCESSFUL",
      notes: "Please call upon arrival at gate.",
    },
  });

  const weekenderProduct = await prisma.product.findFirst({ where: { sku: "LEA-SAV-002" } });
  if (weekenderProduct) {
    await prisma.orderItem.create({
      data: {
        orderId: demoOrder.id,
        productId: weekenderProduct.id,
        productName: weekenderProduct.name,
        sku: weekenderProduct.sku,
        priceAtPurchase: 59500,
        discountAtPurchase: 0,
        quantity: 1,
        subtotal: 59500,
        imageAtPurchase: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=600&auto=format&fit=crop",
      },
    });

    await prisma.payment.create({
      data: {
        orderId: demoOrder.id,
        reference: "pay_edn_ref_demo_891",
        amount: 55350,
        currency: "KES",
        channel: "mobile_money",
        status: "SUCCESSFUL",
        provider: "PAYSTACK",
        customerPhone: "+254712345678",
        customerEmail: demoCustomer.email,
        paidAt: new Date(),
      },
    });
  }

  console.log("✨ Seed completed successfully! Eden's Shop is fully primed.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
