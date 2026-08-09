import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { auth } from "@/lib/auth";
import { assertSuperAdmin } from "@/lib/admin/permissions";
import { getAdminReports } from "@/lib/admin/services";
import { ReportsPdfDocument, ReportsPdfData } from "@/lib/pdf/reports-pdf";

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null | undefined)?.role;

    assertSuperAdmin(role);

    const reports = await getAdminReports();

    const pdfData: ReportsPdfData = {
      revenue: reports.revenue,
      totalOrders: reports.totalOrders,
      newCustomers: reports.newCustomers,
      monthlySales: reports.monthlySales.map((s) => ({
        createdAt: s.createdAt,
        grandTotal: Number(s._sum.grandTotal ?? 0),
      })),
      bestSellingProducts: reports.bestSellingProducts.map((p) => ({
        id: p.id,
        sku: p.sku,
        stock: p.stock,
        soldQuantity: p.soldQuantity,
        productName: p.product.name,
      })),
      generatedAt: new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    };

    const pdfBuffer = await renderToBuffer(
      React.createElement(ReportsPdfDocument, { data: pdfData })
    );

    const filename = `Nexora-Report-${new Date().toISOString().slice(0, 10)}.pdf`;

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
    const status = message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ message }, { status });
  }
}
