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
    borderBottomColor: "#2563eb",
    borderBottomStyle: "solid",
    paddingBottom: 12,
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
    letterSpacing: 1,
  },
  docTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
    marginTop: 2,
  },
  metaRight: {
    textAlign: "right",
  },
  orderBadge: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1e40af",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 8,
    color: "#64748b",
  },
  statusBanner: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusTextGroup: {
    flexDirection: "column",
  },
  statusLabel: {
    fontSize: 8,
    color: "#1e40af",
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  statusValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a8a",
    marginTop: 2,
  },
  twoColumnSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  infoBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 6,
    padding: 10,
  },
  boxTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#334155",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
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
    width: "35%",
    color: "#64748b",
    fontFamily: "Helvetica-Bold",
  },
  infoVal: {
    width: "65%",
    color: "#0f172a",
  },
  table: {
    width: "100%",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "solid",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    borderBottomStyle: "solid",
    padding: 6,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#334155",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
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

  totalsArea: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  totalsBox: {
    width: "45%",
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 6,
    padding: 8,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
    fontSize: 9,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    borderTopStyle: "solid",
    paddingTop: 4,
    marginTop: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: "#0f172a",
  },
  verificationNotice: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 6,
    padding: 8,
    marginBottom: 16,
  },
  verificationTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#166534",
    marginBottom: 2,
  },
  verificationText: {
    fontSize: 8,
    color: "#15803d",
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 35,
    right: 35,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    borderTopStyle: "solid",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#94a3b8",
  },
});

export type ShippingPdfItem = {
  name: string;
  sku: string;
  variantSpecs: string;
  quantity: number;
  price: number;
  subtotal: number;
};

export type ShippingPdfData = {
  orderNumber: string;
  orderDate: string;
  orderStatus: string;
  paymentStatus: string;
  grandTotal: number;

  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  cityProvincePostal: string;

  shipmentStatus: string;
  courierName: string;
  trackingNumber: string;
  shippedAt?: string;

  items: ShippingPdfItem[];
  generatedAt: string;
};

export function ShippingPdfDocument({ data }: { data: ShippingPdfData }) {
  return (
    <Document title={`Nexora-Shipping-${data.orderNumber}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>NEXORA</Text>
            <Text style={styles.docTitle}>Official Proof of Shipping & Manifest</Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.orderBadge}>ORDER #{data.orderNumber}</Text>
            <Text style={styles.metaText}>Generated: {data.generatedAt}</Text>
            <Text style={styles.metaText}>Order Date: {data.orderDate}</Text>
          </View>
        </View>

        {/* Status Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.statusTextGroup}>
            <Text style={styles.statusLabel}>Shipment Status</Text>
            <Text style={styles.statusValue}>{data.shipmentStatus} DISPATCHED</Text>
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={styles.statusLabel}>Courier & Tracking Number</Text>
            <Text style={styles.statusValue}>
              {data.courierName} — {data.trackingNumber}
            </Text>
          </View>
        </View>

        {/* 2-Column Details */}
        <View style={styles.twoColumnSection}>
          {/* Customer & Address */}
          <View style={styles.infoBox}>
            <Text style={styles.boxTitle}>Delivery Recipient</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoVal}>{data.customerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoVal}>{data.customerPhone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoVal}>{data.shippingAddress}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>City / Zip:</Text>
              <Text style={styles.infoVal}>{data.cityProvincePostal}</Text>
            </View>
          </View>

          {/* Shipment & Order Meta */}
          <View style={styles.infoBox}>
            <Text style={styles.boxTitle}>Order & Logistics Summary</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order Status:</Text>
              <Text style={styles.infoVal}>{data.orderStatus}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment Status:</Text>
              <Text style={styles.infoVal}>{data.paymentStatus}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Shipped Date:</Text>
              <Text style={styles.infoVal}>
                {data.shippedAt
                  ? new Date(data.shippedAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Recently Dispatched"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Airway Bill (AWB):</Text>
              <Text style={styles.infoVal}>{data.trackingNumber}</Text>
            </View>
          </View>
        </View>

        {/* Verification Notice */}
        <View style={styles.verificationNotice}>
          <Text style={styles.verificationTitle}>✓ Package Verified & Handed to Courier</Text>
          <Text style={styles.verificationText}>
            This shipment has been packed and handed over to {data.courierName} with tracking code {data.trackingNumber}. Keep this document for delivery verification.
          </Text>
        </View>

        {/* Products Table */}
        <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 6 }}>
          Package Manifest ({data.items.length} Item{data.items.length > 1 ? "s" : ""})
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colNum}>No</Text>
            <Text style={styles.colItem}>Product & Variant Description</Text>
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
                {item.variantSpecs ? (
                  <Text style={{ fontSize: 8, color: "#64748b", marginTop: 1 }}>
                    Specs: {item.variantSpecs}
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

        {/* Totals Box */}
        <View style={styles.totalsArea}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={{ color: "#64748b" }}>Order Items Total:</Text>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>${data.grandTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={{ color: "#64748b" }}>Shipping Cost:</Text>
              <Text style={{ color: "#166534", fontFamily: "Helvetica-Bold" }}>FREE / INCLUDED</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text>Total Declared Value:</Text>
              <Text>${data.grandTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Nexora Order Shipping Verification System — Official Document</Text>
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
