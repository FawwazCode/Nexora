import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1f2937",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#7f46fa",
    borderBottomStyle: "solid",
    paddingBottom: 12,
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#7f46fa",
    letterSpacing: 1,
  },
  docTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginTop: 2,
  },
  paidBadge: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#15803d",
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
    borderWidth: 1,
    borderStyle: "solid",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    textAlign: "right",
  },
  metaRight: {
    textAlign: "right",
  },
  metaText: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  receiptGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 6,
    padding: 10,
  },
  cardHeader: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    paddingBottom: 4,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 3,
    fontSize: 9,
  },
  infoLabel: {
    width: "38%",
    color: "#6b7280",
    fontFamily: "Helvetica-Bold",
  },
  infoVal: {
    width: "62%",
    color: "#111827",
  },
  table: {
    width: "100%",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "solid",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    padding: 6,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#374151",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    borderBottomStyle: "solid",
    padding: 6,
    fontSize: 9,
  },
  colNum: { width: "6%", textAlign: "center" },
  colItem: { width: "44%" },
  colSku: { width: "18%" },
  colQty: { width: "8%", textAlign: "center" },
  colPrice: { width: "12%", textAlign: "right" },
  colTotal: { width: "12%", textAlign: "right" },

  financialSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 25,
  },
  financialBox: {
    width: "50%",
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 6,
    padding: 10,
  },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
    fontSize: 9,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderTopStyle: "solid",
    marginVertical: 4,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: "#7f46fa",
    paddingVertical: 2,
  },
  paidRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: "#111827",
    paddingVertical: 2,
  },
  changeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: "#15803d",
    paddingVertical: 2,
  },
  thankYouBox: {
    backgroundColor: "#faf5ff",
    borderColor: "#f3e8ff",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 6,
    padding: 12,
    textAlign: "center",
    marginBottom: 20,
  },
  thankYouTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#6b21a8",
    marginBottom: 2,
  },
  thankYouText: {
    fontSize: 8,
    color: "#7e22ce",
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 35,
    right: 35,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderTopStyle: "solid",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#9ca3af",
  },
});

export type PaymentPdfItem = {
  name: string;
  sku: string;
  specs?: string;
  quantity: number;
  price: number;
  subtotal: number;
};

export type PaymentPdfData = {
  paymentId: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentAmount: number;
  paidAmount: number;
  changeAmount: number;
  paidAt?: string;
  note?: string;

  orderNumber: string;
  orderDate: string;
  subtotal: number;
  shippingCost: number;
  grandTotal: number;

  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  receiverName?: string;
  fullAddress?: string;

  items: PaymentPdfItem[];
  generatedAt: string;
};

export function PaymentPdfDocument({ data }: { data: PaymentPdfData }) {
  return (
    <Document title={`Nexora-Payment-${data.orderNumber}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>NEXORA</Text>
            <Text style={styles.docTitle}>PAYMENT RECEIPT</Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.paidBadge}>STATUS: {data.paymentStatus}</Text>
            <Text style={styles.metaText}>Receipt ID: {data.paymentId}</Text>
            <Text style={styles.metaText}>Generated: {data.generatedAt}</Text>
          </View>
        </View>

        {/* 2-Column Info Grid */}
        <View style={styles.receiptGrid}>
          {/* Customer / Billed To */}
          <View style={styles.infoCard}>
            <Text style={styles.cardHeader}>Billed Customer</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoVal}>{data.customerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoVal}>{data.customerEmail}</Text>
            </View>
            {data.customerPhone ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoVal}>{data.customerPhone}</Text>
              </View>
            ) : null}
            {data.receiverName ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Recipient:</Text>
                <Text style={styles.infoVal}>{data.receiverName}</Text>
              </View>
            ) : null}
          </View>

          {/* Payment & Order Summary */}
          <View style={styles.infoCard}>
            <Text style={styles.cardHeader}>Transaction Summary</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order No:</Text>
              <Text style={styles.infoVal}>{data.orderNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order Date:</Text>
              <Text style={styles.infoVal}>{data.orderDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Method:</Text>
              <Text style={styles.infoVal}>{data.paymentMethod}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Paid Timestamp:</Text>
              <Text style={styles.infoVal}>
                {data.paidAt
                  ? new Date(data.paidAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Completed"}
              </Text>
            </View>
          </View>
        </View>

        {/* Product Items Table */}
        <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 6 }}>
          Purchased Items ({data.items.length})
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colNum}>No</Text>
            <Text style={styles.colItem}>Product Name & Specs</Text>
            <Text style={styles.colSku}>SKU</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Unit Price</Text>
            <Text style={styles.colTotal}>Subtotal</Text>
          </View>

          {data.items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.colNum}>{idx + 1}</Text>
              <View style={styles.colItem}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>{item.name}</Text>
                {item.specs ? (
                  <Text style={{ fontSize: 8, color: "#6b7280", marginTop: 1 }}>
                    {item.specs}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.colSku}>{item.sku}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>${item.price.toFixed(2)}</Text>
              <Text style={styles.colTotal}>${item.subtotal.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Financial Calculation Box */}
        <View style={styles.financialSection}>
          <View style={styles.financialBox}>
            <View style={styles.financialRow}>
              <Text style={{ color: "#6b7280" }}>Items Subtotal:</Text>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>${data.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={{ color: "#6b7280" }}>Shipping Fee:</Text>
              <Text style={{ color: "#15803d", fontFamily: "Helvetica-Bold" }}>
                {data.shippingCost > 0 ? `$${data.shippingCost.toFixed(2)}` : "FREE"}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.grandTotalRow}>
              <Text>Grand Total:</Text>
              <Text>${data.grandTotal.toFixed(2)}</Text>
            </View>

            <View style={styles.paidRow}>
              <Text style={{ color: "#4b5563" }}>Customer Paid Nominal:</Text>
              <Text>${data.paidAmount.toFixed(2)}</Text>
            </View>

            {data.changeAmount > 0 && (
              <View style={styles.changeRow}>
                <Text>Change Amount Returned:</Text>
                <Text>${data.changeAmount.toFixed(2)}</Text>
              </View>
            )}

            {data.note ? (
              <View style={{ marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: "#e5e7eb", borderTopStyle: "solid" }}>
                <Text style={{ fontSize: 8, color: "#6b7280", fontStyle: "italic" }}>
                  Note: {data.note}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Thank You Note */}
        <View style={styles.thankYouBox}>
          <Text style={styles.thankYouTitle}>Thank you for your business with Nexora!</Text>
          <Text style={styles.thankYouText}>
            Your payment has been successfully recorded. For support inquiries, please visit our help portal or email support@nexora.com.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Nexora Digital Commerce — Official Payment Receipt</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
