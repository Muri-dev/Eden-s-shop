import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CUSTOMER_COOKIE_NAME, ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE_NAME);
  cookieStore.delete(ADMIN_COOKIE_NAME);
  return NextResponse.json({ success: true });
}
