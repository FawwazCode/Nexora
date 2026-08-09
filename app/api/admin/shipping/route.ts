import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageOrders } from "@/lib/admin/permissions";
import { listShippingOrders, adminUpdateShipmentStatus } from "@/lib/admin/services";
import { shippingListSchema, shipmentUpdateSchema } from "@/lib/admin/validation";
import { ShipmentStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null | undefined)?.role;

    if (!canManageOrders(role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = shippingListSchema.safeParse({
      search: searchParams.get("search") ?? undefined,
      shipmentStatus: searchParams.get("shipmentStatus") ?? "ALL",
      page: searchParams.get("page") ?? 1,
      pageSize: searchParams.get("pageSize") ?? 10,
    });

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await listShippingOrders(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
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
    const parsed = shipmentUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { orderId, shipmentStatus, trackingNumber, courierId } = parsed.data;

    const result = await adminUpdateShipmentStatus(
      orderId,
      shipmentStatus as ShipmentStatus,
      trackingNumber,
      courierId
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to update shipment status" },
      { status: 400 }
    );
  }
}
