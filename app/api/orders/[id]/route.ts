import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCustomerOrderDetail } from "@/lib/customer/services";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const user = session?.user as { id?: string; role?: string } | undefined;

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "CUSTOMER") {
      return NextResponse.json({ message: "Forbidden: Customer access required" }, { status: 403 });
    }

    const { id } = await params;
    const order = await getCustomerOrderDetail(user.id, id);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch order details" },
      { status: 500 }
    );
  }
}
