# 🏛️ Eden's Shop — Haute Horlogerie & Maison

A production-grade, full-stack luxury e-commerce platform built with **Next.js 16 (Turbopack)**, **Supabase PostgreSQL**, **Prisma ORM**, **Tailwind CSS**, and **Paystack Live Payments**.

Eden's Shop delivers an ultra-high-end shopping experience featuring Swiss timepieces, fine Tuscan leather goods, and bespoke haute perfumes. It includes a comprehensive **Customer Storefront** and a secure, role-based **Executive Admin Dashboard**.

---

## 🌟 Key Features

### 🛍️ Customer Storefront
- **Grand Salon (Homepage):** Hero carousel, featured collection grid, brand showcase, value propositions, and newsletter concierge.
- **Product Catalog (`/shop`):** Real-time multi-criteria filtering by category, brand, price range, stock availability, and sorting (price low-high, high-low, newest, ratings).
- **Product Detail (`/shop/[slug]`):** High-resolution image gallery, variant selectors (size, color, material), technical specifications accordion, customer reviews, and JSON-LD structured data.
- **Shopping Bag (`/cart`):** Persistent bag with real-time subtotal, quantity updates, and dynamic privilege coupon validation engine.
- **Encrypted Checkout (`/checkout`):** Multi-step checkout with delivery address validation, white-glove courier selection, and server-authoritative pricing.
- **Paystack Live Gateway Integration:** Direct integration with Paystack supporting Credit/Debit Cards, M-Pesa (Mobile Money), and Bank Transfers, backed by HMAC-SHA512 webhook signature verification.
- **Customer Vault (`/account`):** Customer profile management, consignment tracking (`/account/orders`), delivery status progression, and saved wishlist.
- **Curated Offers & Flash Sales:** Dedicated sections for exclusive bundles (`/offers`) and time-limited sales with live countdown clocks (`/flash-sales`).

### 🛡️ Executive Admin Dashboard (`/admin`)
- **Executive Overview:** Real-time KPI metric cards (Gross Revenue, Active Consignments, Average Order Value, Customer Count), interactive sales revenue charts, and quick-action shortcuts.
- **Product Management (`/admin/products`):** Full CRUD with multi-variant management (SKU, stock, price, size, color), gallery photo assignment, and visibility controls.
- **Order Processing (`/admin/orders`):** Comprehensive consignment ledger, payment status monitoring, fulfillment workflow status progression (`PENDING` → `PROCESSING` → `SHIPPED` → `DELIVERED`), and courier tracking assignment.
- **Inventory Control (`/admin/inventory`):** Stock level tracking, low-stock alerts, and logged inventory movement adjustments.
- **Promotions & Coupons (`/admin/coupons`):** Percentage & fixed discount rules, minimum order thresholds, usage limits, and expiration scheduling.
- **Customer Directory (`/admin/customers`):** Client lifetime spend, total orders, and contact directory.
- **Analytics (`/admin/analytics`):** Sales breakdowns, top-performing luxury creations, and conversion metrics.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16.3.5 (App Router with Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 |
| **Database** | PostgreSQL on Supabase (with PgBouncer Connection Pooler) |
| **ORM** | Prisma 6.4.1 |
| **Payment Gateway** | Paystack (Live & Test Modes, M-Pesa + Cards) |
| **Authentication** | Custom HMAC JWT sessions with HTTP-only cookies & Bcrypt |
| **State Management** | Zustand with LocalStorage persistence |
| **Icons & UI** | Lucide React, Canvas Confetti |

---

## 🚀 Quick Start & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Muri-dev/Eden-s-shop.git
cd Eden-s-shop
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the sample environment file:
```bash
cp .env.example .env.local
```

Fill in your configuration details:
```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
JWT_SECRET="your-secure-production-jwt-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_CURRENCY="KES"
NEXT_PUBLIC_CURRENCY_SYMBOL="KSh"
PAYSTACK_PUBLIC_KEY="pk_live_your_public_key"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_live_your_public_key"
PAYSTACK_SECRET_KEY="sk_live_your_secret_key"
PAYSTACK_WEBHOOK_SECRET="sk_live_your_secret_key"
```

### 4. Sync Database Schema
Sync the Prisma schema to your PostgreSQL database:
```bash
npx prisma db push
```

### 5. Seed the Catalog & Accounts
Populate your database with luxury products, shipping tiers, coupons, and demo credentials:
```bash
npx tsx prisma/seed.ts
```

### 6. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the storefront.

---

## 🧪 Automated Testing

Run the test suite to verify business logic, password hashing, JWT signing, discount math, and HMAC-SHA512 webhook validation:
```bash
npx tsx tests/business-logic.test.ts
```

---

## 🔒 Test Credentials

### Executive Admin Portal (`/admin/login`)
- **Email:** `admin@edenshop.com`
- **Password:** `AdminEden2026!`
- *(Or click the **"Fill Executive Admin Demo Credentials"** button on the login screen)*

### Customer Portal (`/login`)
- **Email:** `customer@edenshop.com`
- **Password:** `CustomerEden2026!`
- *(Or click the **"Fill Demo Customer"** quick-fill button)*

### Active Privilege Discount Codes
- **`EDENLUXURY20`**: 20% off entire bag
- **`WELCOME10`**: 10% off entire bag
- **`VIP5000`**: KSh 5,000 off orders over KSh 30,000

---

## 📄 License
Private & Proprietary — Eden's Shop 2026.
