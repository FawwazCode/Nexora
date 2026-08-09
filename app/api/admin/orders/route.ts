import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageOrders } from "@/lib/admin/permissions";
import { listOrders, getOrderDetail, updateOrderStatus, adminUpdatePaymentStatus, adminUpdateShipmentStatus } from "@/lib/admin/services";
import { orderListSchema } from "@/lib/admin/validation";
import { OrderStatus, PaymentStatus, ShipmentStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null | undefined)?.role;

    if (!canManageOrders(role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = orderListSchema.safeParse({
      search: searchParams.get("search") ?? undefined,
      page: searchParams.get("page") ?? 1,
      pageSize: searchParams.get("pageSize") ?? 10,
      status: searchParams.get("status") ?? undefined,
      paymentStatus: searchParams.get("paymentStatus") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const id = searchParams.get("id");
    if (id) {
      const detail = await getOrderDetail(id);
      return NextResponse.json(detail);
    }

    const result = await listOrders(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null | undefined)?.role;

    if (!canManageOrders(role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, paymentStatus, shipmentStatus, note, trackingNumber, courierId } = body;

    if (!id) {
      return NextResponse.json({ message: "Missing order id" }, { status: 400 });
    }

    let updatedOrder;

    if (paymentStatus) {
      updatedOrder = await adminUpdatePaymentStatus(id, paymentStatus as PaymentStatus, note);
    } else if (shipmentStatus) {
      updatedOrder = await adminUpdateShipmentStatus(id, shipmentStatus as ShipmentStatus, trackingNumber, courierId);
    } else if (status) {
      updatedOrder = await updateOrderStatus(id, status as OrderStatus);
    } else {
      return NextResponse.json({ message: "No status field provided to update" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unexpected error" }, { status: 400 });
  }
}

