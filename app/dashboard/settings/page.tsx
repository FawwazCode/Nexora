import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getStoreSettings } from "@/lib/admin/services";

export default async function DashboardSettingsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    redirect("/login");
  }

  if (role !== Role.SUPER_ADMIN) {
    redirect("/dashboard");
  }

  const settings = await getStoreSettings();

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
        <p className="mt-2 text-sm text-gray-600">Manage system configuration and platform settings.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Store Name</p>
          <p className="mt-1 font-medium text-gray-900">{settings?.storeName ?? "Nexora"}</p>
        </div>
        <div className="rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Currency</p>
          <p className="mt-1 font-medium text-gray-900">{settings?.currency ?? "USD"}</p>
        </div>
        <div className="rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Support Email</p>
          <p className="mt-1 font-medium text-gray-900">{settings?.supportEmail ?? "-"}</p>
        </div>
        <div className="rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Shipping Fee</p>
          <p className="mt-1 font-medium text-gray-900">${Number(settings?.shippingFee ?? 0).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
