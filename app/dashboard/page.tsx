import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardRedirect } from "@/lib/rbac";
import { Role } from "@prisma/client";
import {
  getAdminDashboardSummary,
  getAdminRecentCustomers,
  getAdminRecentOrders,
  getAdminLowStockProducts,
  getAdminBestSellingProducts,
} from "@/lib/admin/services";

type DashboardUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
};

const roleContent: Record<string, { title: string; description: string }> = {
  [Role.CATALOG_ADMIN]: {
    title: "Catalog Dashboard",
    description: "Manage products, categories, and inventory efficiently.",
  },
  [Role.ORDER_SPECIALIST]: {
    title: "Order Operations Dashboard",
    description: "Monitor orders, customers, and shipping workflows.",
  },
  [Role.SUPER_ADMIN]: {
    title: "Super Admin Dashboard",
    description: "Full overview of the platform and all operational areas.",
  },
};

export default async function DashboardPage() {
  const session = await auth();
  const role = (session?.user as DashboardUser | undefined)?.role;

  if (!session?.user) {
    redirect("/login");
  }

  if (role === Role.CUSTOMER) {
    redirect("/customer");
  }

  const redirectTo = getDashboardRedirect("/dashboard", role);
  if (redirectTo) {
    redirect(redirectTo);
  }

  const content = roleContent[role ?? Role.SUPER_ADMIN] ?? roleContent[Role.SUPER_ADMIN];

  // Conditional data fetching based strictly on role
  let summary: Awaited<ReturnType<typeof getAdminDashboardSummary>> | null = null;
  let recentOrders: Awaited<ReturnType<typeof getAdminRecentOrders>> = [];
  let recentCustomers: Awaited<ReturnType<typeof getAdminRecentCustomers>> = [];
  let lowStockProducts: Awaited<ReturnType<typeof getAdminLowStockProducts>> = [];
  let bestSellingProducts: Awaited<ReturnType<typeof getAdminBestSellingProducts>> = [];

  if (role === Role.SUPER_ADMIN) {
    [summary, recentOrders, recentCustomers, lowStockProducts, bestSellingProducts] =
      await Promise.all([
        getAdminDashboardSummary(),
        getAdminRecentOrders(5),
        getAdminRecentCustomers(5),
        getAdminLowStockProducts(5),
        getAdminBestSellingProducts(5),
      ]);
  } else if (role === Role.CATALOG_ADMIN) {
    [summary, lowStockProducts, bestSellingProducts] = await Promise.all([
      getAdminDashboardSummary(),
      getAdminLowStockProducts(5),
      getAdminBestSellingProducts(5),
    ]);
  } else if (role === Role.ORDER_SPECIALIST) {
    [summary, recentOrders, recentCustomers] = await Promise.all([
      getAdminDashboardSummary(),
      getAdminRecentOrders(5),
      getAdminRecentCustomers(5),
    ]);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7F46FA]">{content.title}</p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">
          Welcome back, {(session.user as DashboardUser).name ?? "there"}
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-gray-600">{content.description}</p>
      </div>

      {/* Super Admin Stats */}
      {role === Role.SUPER_ADMIN && summary && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{summary.totalProducts}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Categories</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{summary.totalCategories}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Customers</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{summary.totalCustomers}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{summary.totalOrders}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">${summary.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pending Orders</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{summary.pendingOrders}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Completed Orders</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{summary.completedOrders}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Low Stock Products</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{summary.lowStockProducts}</p>
          </div>
        </div>
      )}

      {/* Catalog Admin Stats */}
      {role === Role.CATALOG_ADMIN && summary && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{summary.totalProducts}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Categories</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{summary.totalCategories}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Low Stock Variants</p>
            <p className="mt-2 text-2xl font-semibold text-amber-600">{summary.lowStockProducts}</p>
          </div>
        </div>
      )}

      {/* Order Specialist Stats */}
      {role === Role.ORDER_SPECIALIST && summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{summary.totalOrders}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pending Orders</p>
            <p className="mt-2 text-2xl font-semibold text-amber-600">{summary.pendingOrders}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Completed Orders</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600">{summary.completedOrders}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Registered Customers</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{summary.totalCustomers}</p>
          </div>
        </div>
      )}

      {/* Orders & Customers Section (Only for SUPER_ADMIN and ORDER_SPECIALIST) */}
      {(role === Role.SUPER_ADMIN || role === Role.ORDER_SPECIALIST) && (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <div className="mt-4 space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div>
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.user?.name ?? order.user?.email ?? "Customer"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${Number(order.grandTotal).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{order.paymentStatus}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Recent Customers</h3>
            <div className="mt-4 space-y-3">
              {recentCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div>
                    <p className="font-medium text-gray-900">{customer.name ?? customer.email}</p>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                  <span className="text-sm text-gray-500">{customer.isActive ? "Active" : "Disabled"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products & Catalog Section (Only for SUPER_ADMIN and CATALOG_ADMIN) */}
      {(role === Role.SUPER_ADMIN || role === Role.CATALOG_ADMIN) && (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Products</h3>
            <div className="mt-4 space-y-3">
              {lowStockProducts.map((variant) => (
                <div key={variant.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div>
                    <p className="font-medium text-gray-900">{variant.product?.name}</p>
                    <p className="text-sm text-gray-500">SKU {variant.sku}</p>
                  </div>
                  <p className="font-medium text-amber-600">{variant.stock} left</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Best Selling Products</h3>
            <div className="mt-4 space-y-3">
              {bestSellingProducts.map((variant) => (
                <div key={variant.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div>
                    <p className="font-medium text-gray-900">{variant.product?.name}</p>
                    <p className="text-sm text-gray-500">SKU {variant.sku}</p>
                  </div>
                  <p className="font-medium text-[#7F46FA]">{variant.soldQuantity} sold</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium text-gray-900">{(session.user as DashboardUser).name ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-gray-900">{(session.user as DashboardUser).email ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="font-medium text-gray-900">{(session.user as DashboardUser).role ?? "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}