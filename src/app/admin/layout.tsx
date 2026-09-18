import React from "react";
import { getAdminSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Executive Suite | Eden's Shop Management",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  return (
    <AdminShell
      adminName={session?.name || "Executive Admin"}
      adminRole={session?.role || "ADMIN"}
    >
      {children}
    </AdminShell>
  );
}
