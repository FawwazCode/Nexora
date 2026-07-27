import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assertSuperAdmin } from "@/lib/admin/permissions";
import { getStoreSettings, upsertStoreSettings } from "@/lib/admin/services";
import { settingsSchema } from "@/lib/admin/validation";

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null | undefined)?.role;

    assertSuperAdmin(role);

    const settings = await getStoreSettings();
    return NextResponse.json(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null | undefined)?.role;

    assertSuperAdmin(role);

    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const settings = await upsertStoreSettings(parsed.data);
    return NextResponse.json(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ message }, { status });
  }
}
