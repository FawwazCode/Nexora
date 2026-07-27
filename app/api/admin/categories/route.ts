import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageProducts } from "@/lib/admin/permissions";
import { listCategories, createCategory, updateCategory, deleteCategory } from "@/lib/admin/services";
import { categoryCreateSchema, categoryUpdateSchema, searchQuerySchema } from "@/lib/admin/validation";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null | undefined)?.role;

    if (!canManageProducts(role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = searchQuerySchema.safeParse({
      search: searchParams.get("search") ?? undefined,
      page: searchParams.get("page") ?? 1,
      pageSize: searchParams.get("pageSize") ?? 10,
    });

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await listCategories(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null | undefined)?.role;

    if (!canManageProducts(role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = categoryCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const category = await createCategory(parsed.data);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null | undefined)?.role;

    if (!canManageProducts(role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = categoryUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const category = await updateCategory(parsed.data);
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null | undefined)?.role;

    if (!canManageProducts(role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Missing id" }, { status: 400 });
    }

    const category = await deleteCategory(id);
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
