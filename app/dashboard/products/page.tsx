import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { listProducts } from "@/lib/admin/services";

export default async function DashboardProductsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    redirect("/login");
  }

  if (role !== Role.CATALOG_ADMIN && role !== Role.SUPER_ADMIN) {
    redirect("/dashboard");
  }

  const products = await listProducts({ page: 1, pageSize: 10 });

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Products Management</h2>
        <p className="mt-2 text-sm text-gray-600">Manage product catalog, pricing, and availability.</p>
      </div>

      <div className="grid gap-4">
        {products.items.map((product) => (
          <div key={product.id} className="rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">{product.brand?.name ?? "Unbranded"}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>{product.isPublished ? "Published" : "Draft"}</p>
                <p>{product.variants[0]?.stock ?? 0} in stock</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
