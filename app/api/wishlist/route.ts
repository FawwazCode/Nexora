import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            thumbnail: true,
            shortDescription: true,
            isPublished: true,
            isDeleted: true,
            category: { select: { id: true, name: true } },
            brand: { select: { id: true, name: true } },
            variants: {
              where: { isActive: true },
              select: {
                id: true,
                price: true,
                stock: true,
                sku: true,
                color: true,
                ram: true,
                storage: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    // Format wishlist items
    const formatted = items
      .filter((item) => item.product.isPublished && !item.product.isDeleted)
      .map((item) => {
        const firstVariant = item.product.variants[0];
        return {
          id: item.id,
          productId: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          thumbnail: item.product.thumbnail,
          categoryName: item.product.category?.name || "General",
          brandName: item.product.brand?.name || "Nexora",
          price: firstVariant ? Number(firstVariant.price) : 0,
          stock: firstVariant ? firstVariant.stock : 0,
          variantId: firstVariant ? firstVariant.id : null,
          createdAt: item.createdAt,
        };
      });

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const productId = body?.productId as string | undefined;

    if (!productId) {
      return NextResponse.json({ message: "Missing productId" }, { status: 400 });
    }

    const wishlistItem = await prisma.wishlist.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
    });

    return NextResponse.json({ success: true, data: wishlistItem });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ message: "Missing productId" }, { status: 400 });
    }

    await prisma.wishlist.deleteMany({
      where: { userId, productId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
