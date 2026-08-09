import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { processManualPayment } from "@/lib/customer/services";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const user = session?.user as { id?: string; role?: string } | undefined;

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: orderId } = await params;
    const body = await request.json();
    const amount = Number(body.amount);

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ message: "Invalid payment amount" }, { status: 400 });
    }

    const result = await processManualPayment(user.id, orderId, amount);

    return NextResponse.json({
      success: true,
      message: "Payment Success",
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Payment processing failed" },
      { status: 400 }
    );
  }
}
