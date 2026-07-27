import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { listCategories } from "@/lib/admin/services";

export default async function DashboardCategoriesPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    redirect("/login");
  }

  if (role !== Role.CATALOG_ADMIN && role !== Role.SUPER_ADMIN) {
    redirect("/dashboard");
  }

  const categories = await listCategories({ page: 1, pageSize: 10 });

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Categories Management</h2>
        <p className="mt-2 text-sm text-gray-600">Organize product categories and taxonomy.</p>
      </div>

      <div className="grid gap-4">
        {categories.items.map((category) => (
          <div key={category.id} className="rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{category.name}</p>
                <p className="text-sm text-gray-500">{category.description ?? "No description"}</p>
              </div>
              <p className="text-sm text-gray-500">{category._count.products} products</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
