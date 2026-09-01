import Link from "next/link";
import LogoutButton from "@/components/auth/logout-button";

export default function DashboardNavbar() {
  return (
    <header className="border-b bg-white px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Personalized workspace</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 transition hover:text-[#7F46FA]"
          >
            View Store
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
