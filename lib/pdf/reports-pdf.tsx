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
    borderBottomColor: "#4f46e5",
    borderBottomStyle: "solid",
    paddingBottom: 12,
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#4f46e5",
    letterSpacing: 1,
  },
  docTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    marginTop: 2,
  },
  metaText: {
    fontSize: 9,
    color: "#6b7280",
    textAlign: "right",
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 6,
    padding: 10,
  },
  metricLabel: {
    fontSize: 8,
    color: "#6b7280",
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  metricValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 8,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    paddingBottom: 4,
  },
  table: {
    width: "100%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "solid",
    borderRadius: 4,
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
  colRank: { width: "10%", textAlign: "center" },
  colName: { width: "45%" },
  colSku: { width: "20%" },
  colSold: { width: "12.5%", textAlign: "right" },
  colStock: { width: "12.5%", textAlign: "right" },
  colDate: { width: "50%" },
  colSales: { width: "50%", textAlign: "right" },
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

export type ReportsPdfData = {
  revenue: number;
  totalOrders: number;
  newCustomers: number;
  monthlySales: Array<{ createdAt: string | Date; grandTotal: number }>;
  bestSellingProducts: Array<{
    id: string;
    sku: string;
    stock: number;
    soldQuantity: number;
    productName: string;
  }>;
  generatedAt: string;
};

export function ReportsPdfDocument({ data }: { data: ReportsPdfData }) {
  return (
    <Document title="Nexora-Admin-Reports">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>NEXORA</Text>
            <Text style={styles.docTitle}>Platform Reports & Performance Analytics</Text>
          </View>
          <View>
            <Text style={styles.metaText}>Generated: {data.generatedAt}</Text>
            <Text style={styles.metaText}>Scope: Platform Summary</Text>
          </View>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Revenue</Text>
            <Text style={styles.metricValue}>${data.revenue.toFixed(2)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Orders</Text>
            <Text style={styles.metricValue}>{data.totalOrders}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>New Customers (30d)</Text>
            <Text style={styles.metricValue}>{data.newCustomers}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Sales Entries</Text>
            <Text style={styles.metricValue}>{data.monthlySales.length}</Text>
          </View>
        </View>

        {/* Best Selling Products Table */}
        <Text style={styles.sectionTitle}>Top Selling Products</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colRank}>#</Text>
            <Text style={styles.colName}>Product Name</Text>
            <Text style={styles.colSku}>SKU</Text>
            <Text style={styles.colSold}>Units Sold</Text>
            <Text style={styles.colStock}>In Stock</Text>
          </View>
          {data.bestSellingProducts.length > 0 ? (
            data.bestSellingProducts.map((p, idx) => (
              <View key={p.id || idx} style={styles.tableRow}>
                <Text style={styles.colRank}>{idx + 1}</Text>
                <Text style={styles.colName}>{p.productName}</Text>
                <Text style={styles.colSku}>{p.sku}</Text>
                <Text style={styles.colSold}>{p.soldQuantity}</Text>
                <Text style={styles.colStock}>{p.stock}</Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={{ width: "100%", textAlign: "center", color: "#9ca3af" }}>
                No product sales recorded yet.
              </Text>
            </View>
          )}
        </View>

        {/* Monthly Sales Breakdown */}
        <Text style={styles.sectionTitle}>Sales Transactions History</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDate}>Date</Text>
            <Text style={styles.colSales}>Sales Total ($)</Text>
          </View>
          {data.monthlySales.length > 0 ? (
            data.monthlySales.map((s, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.colDate}>
                  {new Date(s.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                <Text style={styles.colSales}>${Number(s.grandTotal).toFixed(2)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={{ width: "100%", textAlign: "center", color: "#9ca3af" }}>
                No sales data available.
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Nexora Admin Portal — Confidential Report</Text>
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
