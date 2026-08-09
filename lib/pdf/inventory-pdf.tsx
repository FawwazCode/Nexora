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
    padding: 30,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1f2937",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#475569",
    borderBottomStyle: "solid",
    paddingBottom: 10,
    marginBottom: 14,
  },
  brandTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    letterSpacing: 1,
  },
  docTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
    marginTop: 2,
  },
  metaText: {
    fontSize: 8,
    color: "#64748b",
    textAlign: "right",
  },
  filterBar: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 4,
    padding: 8,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterItem: {
    fontSize: 8,
    color: "#475569",
  },
  filterBold: {
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 8,
    borderRadius: 4,
  },
  metricLabel: {
    fontSize: 7,
    color: "#475569",
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  metricValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginTop: 2,
  },
  table: {
    width: "100%",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderStyle: "solid",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    borderBottomStyle: "solid",
    padding: 5,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#1e293b",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    borderBottomStyle: "solid",
    padding: 5,
    fontSize: 8,
  },
  colSku: { width: "16%" },
  colName: { width: "30%" },
  colCategory: { width: "18%" },
  colSpecs: { width: "14%" },
  colPrice: { width: "10%", textAlign: "right" },
  colStock: { width: "12%", textAlign: "center" },

  badgeLow: {
    color: "#92400e",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    fontFamily: "Helvetica-Bold",
  },
  badgeOut: {
    color: "#991b1b",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    fontFamily: "Helvetica-Bold",
  },
  badgeOk: {
    color: "#166534",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    borderTopStyle: "solid",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#94a3b8",
  },
});

export type InventoryPdfItem = {
  id: string;
  sku: string;
  barcode?: string | null;
  productName: string;
  categoryName?: string;
  brandName?: string;
  specs: string;
  price: number;
  stock: number;
  isActive: boolean;
  updatedAt?: string;
};

export type InventoryPdfData = {
  items: InventoryPdfItem[];
  summary: {
    totalVariants: number;
    totalStock: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  filterSearch?: string;
  filterStatus?: string;
  generatedAt: string;
};

export function InventoryPdfDocument({ data }: { data: InventoryPdfData }) {
  const getStockBadgeStyle = (stock: number) => {
    if (stock === 0) return styles.badgeOut;
    if (stock <= 5) return styles.badgeLow;
    return styles.badgeOk;
  };

  const getStockLabel = (stock: number) => {
    if (stock === 0) return "OUT OF STOCK";
    if (stock <= 5) return `LOW (${stock})`;
    return `${stock} IN STOCK`;
  };

  return (
    <Document title="Nexora-Inventory-Report">
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>NEXORA</Text>
            <Text style={styles.docTitle}>Catalog Inventory & Stock Audit Report</Text>
          </View>
          <View>
            <Text style={styles.metaText}>Generated: {data.generatedAt}</Text>
            <Text style={styles.metaText}>Scope: Active Warehouse Inventory</Text>
          </View>
        </View>

        {/* Filter Summary */}
        <View style={styles.filterBar}>
          <Text style={styles.filterItem}>
            Applied Search: <Text style={styles.filterBold}>{data.filterSearch || "None (All items)"}</Text>
          </Text>
          <Text style={styles.filterItem}>
            Stock Status Filter: <Text style={styles.filterBold}>{data.filterStatus || "All Statuses"}</Text>
          </Text>
          <Text style={styles.filterItem}>
            Showing: <Text style={styles.filterBold}>{data.items.length} variants</Text>
          </Text>
        </View>

        {/* Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Listed Variants</Text>
            <Text style={styles.metricValue}>{data.summary.totalVariants}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Units in Stock</Text>
            <Text style={styles.metricValue}>{data.summary.totalStock.toLocaleString()}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Low Stock Items (1-5)</Text>
            <Text style={styles.metricValue}>{data.summary.lowStockCount}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Out of Stock Items (0)</Text>
            <Text style={styles.metricValue}>{data.summary.outOfStockCount}</Text>
          </View>
        </View>

        {/* Inventory Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colSku}>SKU / Barcode</Text>
            <Text style={styles.colName}>Product Name</Text>
            <Text style={styles.colCategory}>Category / Brand</Text>
            <Text style={styles.colSpecs}>Variant Specs</Text>
            <Text style={styles.colPrice}>Unit Price</Text>
            <Text style={styles.colStock}>Stock Level & Status</Text>
          </View>

          {data.items.length > 0 ? (
            data.items.map((item, idx) => (
              <View key={item.id || idx} style={styles.tableRow}>
                <View style={styles.colSku}>
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>{item.sku}</Text>
                  {item.barcode ? (
                    <Text style={{ fontSize: 7, color: "#64748b" }}>{item.barcode}</Text>
                  ) : null}
                </View>
                <Text style={styles.colName}>{item.productName}</Text>
                <Text style={styles.colCategory}>
                  {item.categoryName || "General"}
                  {item.brandName ? ` • ${item.brandName}` : ""}
                </Text>
                <Text style={styles.colSpecs}>{item.specs}</Text>
                <Text style={styles.colPrice}>${item.price.toFixed(2)}</Text>
                <View style={styles.colStock}>
                  <Text style={getStockBadgeStyle(item.stock)}>
                    {getStockLabel(item.stock)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={{ width: "100%", textAlign: "center", color: "#9ca3af" }}>
                No inventory records match the selected filter.
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Nexora Warehouse & Inventory Management System</Text>
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
