import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "eden-luxury-production-grade-secret-key-2026-v1";
const CUSTOMER_COOKIE_NAME = "eden_customer_session";
const ADMIN_COOKIE_NAME = "eden_admin_session";

export interface CustomerPayload {
  userId: string;
  email: string;
  name: string;
  role: "CUSTOMER";
}

export interface AdminPayload {
  adminId: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF";
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Token generation
export function signCustomerToken(payload: CustomerPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });
}

// Token verification
export function verifyCustomerToken(token: string): CustomerPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as CustomerPayload;
  } catch {
    return null;
  }
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

// Server Component / Server Action session retrieval
export async function getCustomerSession(): Promise<CustomerPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = verifyCustomerToken(token);
    if (!payload) return null;

    // Verify user still exists and is active in DB
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, status: true },
    });

    if (!user || user.status !== "ACTIVE") return null;

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: "CUSTOMER",
    };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = verifyAdminToken(token);
    if (!payload) return null;

    // Verify admin still exists and is active
    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.adminId },
      select: { id: true, email: true, name: true, role: true, status: true },
    });

    if (!admin || admin.status !== "ACTIVE") return null;

    return {
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role as "SUPER_ADMIN" | "ADMIN" | "STAFF",
    };
  } catch {
    return null;
  }
}

export { CUSTOMER_COOKIE_NAME, ADMIN_COOKIE_NAME };
