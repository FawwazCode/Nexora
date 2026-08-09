import { NextResponse } from "next/server";
import {
  renderToBuffer,
  DocumentProps,
} from "@react-pdf/renderer";
import React, { ReactElement } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  PaymentPdfDocument,
  PaymentPdfData,
} from "@/lib/pdf/payment-pdf";
import { Role } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const role = (session.user as { role?: string })?.role;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        address: true,
        payment: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // Security Check:
    // Customer can only access their own order's payment receipt.
    if (role === Role.CUSTOMER && order.userId !== userId) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // Business Rule Check:
    // Only allow receipt download for paid orders.
    if (
      order.paymentStatus !== "PAID" ||
      !order.payment ||
      order.payment.status !== "PAID"
    ) {
      return NextResponse.json(
        {
          message:
            "Payment receipt is only available for paid orders",
        },
        { status: 400 }
      );
    }

    const grandTotal = Number(order.grandTotal);
    const subtotal = Number(order.subtotal);
    const shippingCost = Number(order.shippingCost);
    const paidAmount = Number(
      order.payment.paidAmount ?? grandTotal
    );
    const changeAmount = Number(
      order.payment.changeAmount ?? 0
    );
    const paymentAmount = Number(
      order.payment.amount ?? grandTotal
    );

    const pdfData: PaymentPdfData = {
      paymentId: order.payment.id,

      paymentMethod: order.payment.method || "MANUAL",

      paymentStatus: order.payment.status,

      paymentAmount,

      paidAmount,

      changeAmount,

      paidAt: order.payment.paidAt?.toISOString(),

      note: order.payment.note || undefined,

      orderNumber: order.orderNumber,

      orderDate: new Date(
        order.createdAt
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),

      subtotal,

      shippingCost,

      grandTotal,

      customerName:
        order.user.name ||
        order.address.receiverName ||
        "Customer",

      customerEmail: order.user.email,

      customerPhone:
        order.address.phone ||
        order.user.phone ||
        undefined,

      receiverName: order.address.receiverName,

      fullAddress: `${order.address.fullAddress}, ${order.address.city}, ${order.address.province} (${order.address.postalCode})`,

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
          specs,
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
      PaymentPdfDocument,
      { data: pdfData }
    ) as ReactElement<DocumentProps>;

    const pdfBuffer = await renderToBuffer(pdfDocument);

    const filename = `Nexora-Payment-${order.orderNumber}.pdf`;

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