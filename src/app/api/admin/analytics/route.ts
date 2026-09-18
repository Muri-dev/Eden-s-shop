import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalOrders,
      orders,
      totalProducts,
      totalCustomers,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({
        where: {
          status: { notIn: ["CANCELLED", "FAILED"] },
        },
        select: {
          grandTotal: true,
          status: true,
          createdAt: true,
          items: {
            select: {
              productId: true,
              productName: true,
              quantity: true,
              subtotal: true,
            },
          },
          payments: {
            select: { channel: true },
            take: 1,
          },
        },
      }),
      prisma.product.count({ where: { status: "PUBLISHED" } }),
      prisma.user.count(),
      prisma.product.count({
        where: {
          stock: { lte: 5 },
          status: "PUBLISHED",
        },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
        },
      }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);

    // Sales by day (last 7 days)
    const last7Days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      last7Days[key] = 0;
    }

    orders.forEach((o) => {
      const day = o.createdAt.toISOString().split("T")[0];
      if (last7Days[day] !== undefined) {
        last7Days[day] += o.grandTotal;
      }
    });

    const salesChart = Object.entries(last7Days).map(([date, amount]) => ({
      date,
      amount,
    }));

    // Top products by revenue
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.subtotal;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        lowStockProducts,
        averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      },
      salesChart,
      topProducts,
      recentOrders,
    });
  } catch (error: any) {
    console.error("Admin analytics error:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
