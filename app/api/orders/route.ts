import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listCustomerOrders } from "@/lib/customer/services";

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user as { id?: string; role?: string } | undefined;

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "CUSTOMER") {
      return NextResponse.json({ message: "Forbidden: Customer access required" }, { status: 403 });
    }

    const orders = await listCustomerOrders(user.id);
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
