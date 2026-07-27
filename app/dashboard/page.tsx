import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardRedirect } from "@/lib/rbac";
import { Role } from "@prisma/client";
import { getAdminDashboardSummary, getAdminRecentCustomers, getAdminRecentOrders, getAdminLowStockProducts, getAdminBestSellingProducts } from "@/lib/admin/services";

type DashboardUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
};

const roleContent: Record<string, { title: string; description: string; highlights: string[] }> = {
  [Role.CUSTOMER]: {
    title: "Customer Dashboard",
    description: "Track your orders, profile, and wishlist from one place.",
    highlights: ["View your recent orders", "Manage profile settings", "Keep track of favorites"],
  },
  [Role.CATALOG_ADMIN]: {
    title: "Catalog Dashboard",
    description: "Manage products, categories, and inventory efficiently.",
    highlights: ["Maintain product catalog", "Organize categories", "Monitor inventory"],
  },
  [Role.ORDER_SPECIALIST]: {
    title: "Order Operations Dashboard",
    description: "Monitor orders, customers, and shipping workflows.",
    highlights: ["Review incoming orders", "Manage customers", "Coordinate shipping"],
  },
  [Role.SUPER_ADMIN]: {
    title: "Super Admin Dashboard",
    description: "Full overview of the platform and all operational areas.",
    highlights: ["Access all modules", "Manage platform settings", "Supervise all roles"],
  },
};

export default async function DashboardPage() {
  const session = await auth();
  const role = (session?.user as DashboardUser | undefined)?.role;

  if (!session?.user) {
    redirect("/login");
  }

  const redirectTo = getDashboardRedirect("/dashboard", role);
  if (redirectTo) {
    redirect(redirectTo);
  }

  const content = roleContent[role ?? Role.CUSTOMER] ?? roleContent[Role.CUSTOMER];
  const [summary, recentOrders, recentCustomers, lowStockProducts, bestSellingProducts] = await Promise.all([
    getAdminDashboardSummary(),
    getAdminRecentOrders(5),
    getAdminRecentCustomers(5),
    getAdminLowStockProducts(5),
    getAdminBestSellingProducts(5),
  ]);

  const stats = [
    { label: "Total Products", value: summary.totalProducts },
    { label: "Total Categories", value: summary.totalCategories },
    { label: "Total Customers", value: summary.totalCustomers },
    { label: "Total Orders", value: summary.totalOrders },
    { label: "Total Revenue", value: `$${summary.totalRevenue.toFixed(2)}` },
    { label: "Pending Orders", value: summary.pendingOrders },
    { label: "Completed Orders", value: summary.completedOrders },
    { label: "Low Stock Products", value: summary.lowStockProducts },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7F46FA]">{content.title}</p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">Welcome back, {(session.user as DashboardUser).name ?? "there"}</h2>
        <p className="mt-3 max-w-2xl text-sm text-gray-600">{content.description}</p>
      </div>

      {role === Role.SUPER_ADMIN ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>
      ) : null}

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

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
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