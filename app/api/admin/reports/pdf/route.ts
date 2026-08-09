import { NextResponse } from "next/server";
import {
  renderToBuffer,
  DocumentProps,
} from "@react-pdf/renderer";
import React, { ReactElement } from "react";
import { auth } from "@/lib/auth";
import { canManageProducts } from "@/lib/admin/permissions";
import { getAdminReports } from "@/lib/admin/services";
import {
  ReportsPdfDocument,
  ReportsPdfData,
} from "@/lib/pdf/reports-pdf";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null | undefined)?.role;

    if (!role || !canManageProducts(role)) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const reportsData = await getAdminReports();

    const pdfData: ReportsPdfData = {
      revenue: reportsData.revenue,

      monthlySales: reportsData.monthlySales.map((item) => ({
        createdAt: item.createdAt,
        grandTotal: Number(item._sum.grandTotal ?? 0),
      })),

      totalOrders: reportsData.totalOrders,

      bestSellingProducts: reportsData.bestSellingProducts.map((item) => ({
        id: item.id,
        sku: item.sku,
        stock: item.stock,
        soldQuantity: item.soldQuantity,
        productName: item.product.name,
      })),

      newCustomers: reportsData.newCustomers,

      generatedAt: new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    };

    const pdfDocument = React.createElement(
      ReportsPdfDocument,
      { data: pdfData }
    ) as ReactElement<DocumentProps>;

    const pdfBuffer = await renderToBuffer(pdfDocument);

    const filename = `Nexora-Report-${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;

    const pdfBody = new Uint8Array(pdfBuffer);

    return new NextResponse(pdfBody, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error";

    return NextResponse.json({ message }, { status: 500 });
  }
}