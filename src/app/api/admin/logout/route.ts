import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const session = await getAdminSession();
    if (session) {
      await prisma.auditLog.create({
        data: {
          adminId: session.adminId,
          adminEmail: session.email,
          action: "LOGOUT",
          entity: "AdminUser",
          entityId: session.adminId,
          detailsJson: JSON.stringify({ message: `Admin ${session.name} logged out.` }),
        },
      });
    }
  } catch (e) {
    console.warn("Logout audit log failed:", e);
  }

  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);

  return NextResponse.json({ success: true });
}
