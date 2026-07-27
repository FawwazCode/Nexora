import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardRedirect } from "@/lib/rbac";
import DashboardNavbar from "@/components/layout/dashboard-navbar";
import DashboardSidebar from "@/components/layout/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  // Protect dashboard routes using the shared RBAC policy.
  const redirectTo = getDashboardRedirect("/dashboard", role);
  if (redirectTo) {
    redirect(redirectTo);
  }

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}