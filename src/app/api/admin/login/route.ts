import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, signAdminToken, ADMIN_COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials." },
        { status: 401 }
      );
    }

    if (admin.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "Account disabled. Contact Super Admin." },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials." },
        { status: 401 }
      );
    }

    const token = signAdminToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role as "SUPER_ADMIN" | "ADMIN" | "STAFF",
    });

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 12 * 60 * 60,
      path: "/",
    });

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          adminEmail: admin.email,
          action: "LOGIN",
          entity: "AdminUser",
          entityId: admin.id,
          detailsJson: JSON.stringify({ message: `Admin ${admin.name} logged into portal.` }),
        },
      });
    } catch (e) {
      console.warn("Could not write audit log:", e);
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: "Administration authentication failed." },
      { status: 500 }
    );
  }
}
