import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkoutSchema } from "@/lib/customer/validation";
import { createOrderFromCart } from "@/lib/customer/services";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const user = session?.user as { id?: string; role?: string } | undefined;

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "CUSTOMER") {
      return NextResponse.json({ message: "Forbidden: Customer access required" }, { status: 403 });
    }

    const body = await request.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.errors[0]?.message || "Invalid checkout payload" },
        { status: 400 }
      );
    }

    const order = await createOrderFromCart(user.id, validation.data);

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Checkout failed" },
      { status: 400 }
    );
  }
}
