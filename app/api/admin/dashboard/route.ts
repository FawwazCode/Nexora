import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminDashboardSummary, getAdminRecentCustomers, getAdminRecentOrders, getAdminLowStockProducts, getAdminBestSellingProducts } from "@/lib/admin/services";
import { assertSuperAdmin } from "@/lib/admin/permissions";

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null | undefined)?.role;

    assertSuperAdmin(role);

    const [summary, recentOrders, recentCustomers, lowStockProducts, bestSellingProducts] = await Promise.all([
      getAdminDashboardSummary(),
      getAdminRecentOrders(5),
      getAdminRecentCustomers(5),
      getAdminLowStockProducts(5),
      getAdminBestSellingProducts(5),
    ]);

    return NextResponse.json({
      summary,
      recentOrders,
      recentCustomers,
      lowStockProducts,
      bestSellingProducts,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ message }, { status });
  }
}
