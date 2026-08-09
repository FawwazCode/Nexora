import Link from "next/link";
import { auth } from "@/lib/auth";
import { dashboardMenus } from "@/lib/dashboard-config";

export default async function DashboardSidebar() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const items = role ? dashboardMenus[role] ?? [] : [];

  return (
    <aside className="w-72 shrink-0 border-r bg-white p-6">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900">Nexora Dashboard</h2>
        <p className="text-sm text-gray-500">Role-based access</p>
      </div>

      <nav className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-[#7F46FA]/10 hover:text-[#7F46FA]"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
