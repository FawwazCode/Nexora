import { NextResponse } from "next/server";
import {
  renderToBuffer,
  DocumentProps,
} from "@react-pdf/renderer";
import React, { ReactElement } from "react";
import { auth } from "@/lib/auth";
import { canManageOrders } from "@/lib/admin/permissions";
import { getOrderDetail } from "@/lib/admin/services";
import {
  ShippingPdfDocument,
  ShippingPdfData,
} from "@/lib/pdf/shipping-pdf";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth();
    const role = (session?.user as { role?: string } | null | undefined)?.role;

    if (!role || !canManageOrders(role)) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const order = await getOrderDetail(id);

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // Business Rule Check:
    // Only allow shipping PDF for orders that have been shipped.
    if (order.shipmentStatus === "NOT_YET_SHIPPED") {
      return NextResponse.json(
        {
          message:
            "Shipping PDF is only available for orders with SHIPPED status",
        },
        { status: 400 }
      );
    }

    const pdfData: ShippingPdfData = {
      orderNumber: order.orderNumber,

      orderDate: new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),

      orderStatus: order.status,

      paymentStatus: order.paymentStatus,

      grandTotal: Number(order.grandTotal),

      customerName:
        order.address?.receiverName ||
        order.user.name ||
        "Customer",

      customerPhone:
        order.address?.phone ||
        "N/A",

      customerEmail: order.user.email,

      shippingAddress:
        order.address?.fullAddress ||
        "No address specified",

      cityProvincePostal: order.address
        ? `${order.address.city}, ${order.address.province} ${order.address.postalCode}`
        : "",

      shipmentStatus: order.shipmentStatus,

      courierName: "Standard Courier",

      trackingNumber:
        order.shipment?.trackingNumber ||
        "N/A",

      shippedAt:
        order.shipment?.shippedAt?.toISOString(),

      items: order.items.map((item) => {
        const price = Number(item.price);

        const specs = [
          item.variant.color,
          item.variant.ram,
          item.variant.storage,
        ]
          .filter(Boolean)
          .join(" / ");

        return {
          name: item.variant.product.name,
          sku: item.variant.sku,
          variantSpecs: specs,
          quantity: item.quantity,
          price,
          subtotal: price * item.quantity,
        };
      }),

      generatedAt: new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    };

    const pdfDocument = React.createElement(
      ShippingPdfDocument,
      { data: pdfData }
    ) as ReactElement<DocumentProps>;

    const pdfBuffer = await renderToBuffer(pdfDocument);

    const filename = `Nexora-Shipping-${order.orderNumber}.pdf`;

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
      error instanceof Error
        ? error.message
        : "Unexpected error";

    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}