import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { addToCartSchema } from "@/lib/customer/validation";
import { addToCart, getCustomerCart, clearCart } from "@/lib/customer/services";

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

    const cart = await getCustomerCart(user.id);
    return NextResponse.json({ success: true, data: cart });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

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
    const validation = addToCartSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.errors[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    await addToCart(user.id, validation.data);
    return NextResponse.json({ success: true, message: "Item added to cart" });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to add item to cart" },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    const user = session?.user as { id?: string; role?: string } | undefined;

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "CUSTOMER") {
      return NextResponse.json({ message: "Forbidden: Customer access required" }, { status: 403 });
    }

    await clearCart(user.id);
    return NextResponse.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to clear cart" },
      { status: 500 }
    );
  }
}
