import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageOrders } from "@/lib/admin/permissions";
import { listCouriers } from "@/lib/admin/services";

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null | undefined)?.role;

    if (!canManageOrders(role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const couriers = await listCouriers();
    return NextResponse.json(couriers);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
