import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

export default async function DashboardInventoryPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    redirect("/login");
  }

  if (role !== Role.CATALOG_ADMIN && role !== Role.SUPER_ADMIN) {
    redirect("/dashboard");
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">Inventory Management</h2>
      <p className="mt-2 text-sm text-gray-600">Review stock level and product availability.</p>
    </div>
  );
}
