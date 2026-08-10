import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assertSuperAdmin } from "@/lib/admin/permissions";
import { getAdminReports } from "@/lib/admin/services";

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null | undefined)?.role;

    assertSuperAdmin(role);

    const reports = await getAdminReports();
    return NextResponse.json(reports);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ message }, { status });
  }
}
