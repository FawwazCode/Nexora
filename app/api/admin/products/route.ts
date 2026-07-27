import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageProducts } from "@/lib/admin/permissions";
import { listProducts, createProduct, updateProduct, deleteProduct, restoreProduct } from "@/lib/admin/services";
import { searchQuerySchema, productCreateSchema, productUpdateSchema } from "@/lib/admin/validation";

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

    const result = await listProducts(parsed.data);
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
    const parsed = productCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const product = await createProduct(parsed.data);
    return NextResponse.json(product, { status: 201 });
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
    const parsed = productUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const product = await updateProduct(parsed.data);
    return NextResponse.json(product, { status: 200 });
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

    const product = await deleteProduct(id);
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null | undefined)?.role;

    if (!canManageProducts(role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const id = body?.id as string | undefined;
    if (!id) {
      return NextResponse.json({ message: "Missing id" }, { status: 400 });
    }

    const { id: _id, ...data } = body;
    const product = await restoreProduct(id);
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
