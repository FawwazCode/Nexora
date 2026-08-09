import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateCartItemSchema } from "@/lib/customer/validation";
import { updateCartItemQuantity, removeCartItem } from "@/lib/customer/services";

export async function PATCH(
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
    const body = await request.json();
    const validation = updateCartItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.issues[0]?.message || "Invalid quantity" },
        { status: 400 }
      );
    }

    await updateCartItemQuantity(user.id, id, validation.data.quantity);
    return NextResponse.json({ success: true, message: "Cart item updated" });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to update cart item" },
      { status: 400 }
    );
  }
}

export async function DELETE(
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
    await removeCartItem(user.id, id);
    return NextResponse.json({ success: true, message: "Cart item removed" });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to remove cart item" },
      { status: 400 }
    );
  }
}
