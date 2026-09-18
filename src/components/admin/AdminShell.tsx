"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Tag,
  Users,
  Star,
  BarChart3,
  Boxes,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { toast } from "@/stores/toast.store";

interface AdminShellProps {
  children: React.ReactNode;
  adminName?: string;
  adminRole?: string;
}

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Categories", href: "/admin/categories", icon: Layers },
  { label: "Coupons", href: "/admin/coupons", icon: Tag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export function AdminShell({ children, adminName = "Admin Executive", adminRole = "SUPER_ADMIN" }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If on login page, render children directly without admin shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      toast.success("Executive session concluded.");
      router.push("/admin/login");
      router.refresh();
    } catch {
      toast.error("Logout failed.");
    }
  };

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex text-[#241813]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#1A120E] text-[#FAF7F2] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#33231B] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#241813] border border-[#DFC8A8]/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#DFC8A8]" />
            </div>
            <div>
              <span className="font-serif font-bold text-base tracking-wider text-[#FAF7F2] block">
                EDEN&apos;S
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#A6875C] font-semibold block">
                Atelier Admin
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[#96867B] hover:text-[#FAF7F2]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  active
                    ? "bg-[#A6875C] text-[#1A120E] shadow-sm font-bold"
                    : "text-[#A8988C] hover:text-[#FAF7F2] hover:bg-[#261B15]"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-[#1A120E]" : "text-[#A6875C]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Storefront Link & Admin Profile */}
        <div className="p-4 border-t border-[#33231B] space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-[#DFC8A8] bg-[#261B15] hover:bg-[#33231B] transition-colors"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs truncate">
              <span className="text-[#FAF7F2] font-semibold block truncate">{adminName}</span>
              <span className="text-[10px] uppercase tracking-wider text-[#A6875C] block">
                {adminRole}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-[#96867B] hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-[#E5DDCF] h-16 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-[#241813] hover:bg-[#FAF7F2] rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block text-xs uppercase tracking-wider text-[#96867B] font-medium">
              Eden&apos;s High-Jewelry & Luxury Commerce Operating System
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Store Active
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
