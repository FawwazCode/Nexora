import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assertSuperAdmin } from "@/lib/admin/permissions";
import { listUsers, updateUserRole } from "@/lib/admin/services";
import { roleUpdateSchema } from "@/lib/admin/validation";

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null | undefined)?.role;

    assertSuperAdmin(role);

    const users = await listUsers();
    return NextResponse.json(users);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ message }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null | undefined)?.role;

    assertSuperAdmin(role);

    const body = await request.json();
    const parsed = roleUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    if (!body.id) {
      return NextResponse.json({ message: "Missing id" }, { status: 400 });
    }

    const sessionUser = session?.user as { id?: string } | null | undefined;
    if (sessionUser?.id === body.id) {
      return NextResponse.json({ message: "Super admin cannot remove their own role" }, { status: 400 });
    }

    const user = await updateUserRole(body.id, parsed.data.role);
    return NextResponse.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ message }, { status });
  }
}
