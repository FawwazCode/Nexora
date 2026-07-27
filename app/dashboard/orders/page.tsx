import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { listOrders } from "@/lib/admin/services";

export default async function DashboardOrdersPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    redirect("/login");
  }

  if (role !== Role.ORDER_SPECIALIST && role !== Role.SUPER_ADMIN) {
    redirect("/dashboard");
  }

  const orders = await listOrders({ page: 1, pageSize: 10 });

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Orders Management</h2>
        <p className="mt-2 text-sm text-gray-600">Track and manage customer orders.</p>
      </div>

      <div className="grid gap-4">
        {orders.items.map((order) => (
          <div key={order.id} className="rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{order.orderNumber}</p>
                <p className="text-sm text-gray-500">{order.user?.name ?? order.user?.email ?? "Customer"}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>${Number(order.grandTotal).toFixed(2)}</p>
                <p>{order.status}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
