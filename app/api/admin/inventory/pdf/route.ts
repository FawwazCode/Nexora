import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { auth } from "@/lib/auth";
import { canManageProducts } from "@/lib/admin/permissions";
import { listInventoryItems } from "@/lib/admin/services";
import { InventoryPdfDocument, InventoryPdfData } from "@/lib/pdf/inventory-pdf";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null | undefined)?.role;

    if (!role || !canManageProducts(role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") || "all") as "all" | "low_stock" | "out_of_stock" | "in_stock";
    const categoryId = searchParams.get("categoryId") || undefined;

    const inventoryData = await listInventoryItems({
      page: 1,
      pageSize: 1000,
      search,
      status,
      categoryId,
    });

    const pdfData: InventoryPdfData = {
      items: inventoryData.items.map((item) => {
        const specs = [item.color, item.ram, item.storage].filter(Boolean).join(" / ");
        return {
          id: item.id,
          sku: item.sku,
          barcode: item.barcode,
          productName: item.product.name,
          categoryName: item.product.category?.name,
          brandName: item.product.brand?.name,
          specs,
          price: Number(item.price),
          stock: item.stock,
          isActive: item.isActive,
        };
      }),
      summary: inventoryData.summary,
      filterSearch: search,
      filterStatus: status !== "all" ? status : undefined,
      generatedAt: new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    };

    const pdfBuffer = await renderToBuffer(
      React.createElement(InventoryPdfDocument, { data: pdfData })
    );

    const filename = `Nexora-Inventory-${new Date().toISOString().slice(0, 10)}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
