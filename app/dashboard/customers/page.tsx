import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { listCustomers } from "@/lib/admin/services";

export default async function DashboardCustomersPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    redirect("/login");
  }

  if (role !== Role.ORDER_SPECIALIST && role !== Role.SUPER_ADMIN) {
    redirect("/dashboard");
  }

  const customers = await listCustomers({ page: 1, pageSize: 10 });

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Customers Management</h2>
        <p className="mt-2 text-sm text-gray-600">Review customer accounts and service interactions.</p>
      </div>

      <div className="grid gap-4">
        {customers.items.map((customer) => (
          <div key={customer.id} className="rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{customer.name ?? customer.email}</p>
                <p className="text-sm text-gray-500">{customer.email}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>{customer.isActive ? "Active" : "Disabled"}</p>
                <p>{customer._count.orders} orders</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
