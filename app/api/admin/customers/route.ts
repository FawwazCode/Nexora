import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageOrders } from "@/lib/admin/permissions";
import { listCustomers, getCustomerDetail, toggleCustomerStatus } from "@/lib/admin/services";
import { customerListSchema, customerToggleSchema } from "@/lib/admin/validation";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null | undefined)?.role;

    if (!canManageOrders(role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = customerListSchema.safeParse({
      search: searchParams.get("search") ?? undefined,
      page: searchParams.get("page") ?? 1,
      pageSize: searchParams.get("pageSize") ?? 10,
      status: searchParams.get("status") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const id = searchParams.get("id");
    if (id) {
      const detail = await getCustomerDetail(id);
      return NextResponse.json(detail);
    }

    const result = await listCustomers(parsed.data);
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
    const parsed = customerToggleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    if (!body.id) {
      return NextResponse.json({ message: "Missing id" }, { status: 400 });
    }

    const customer = await toggleCustomerStatus(body.id, parsed.data.isActive);
    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
