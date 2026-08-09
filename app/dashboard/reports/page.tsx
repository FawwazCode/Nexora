"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

type ReportData = {
  revenue: number;
  monthlySales: Array<{ createdAt: Date; _sum: { grandTotal: { toNumber: () => number } } }>;
  totalOrders: number;
  bestSellingProducts: Array<{
    id: string;
    sku: string;
    stock: number;
    product: { name: string; slug: string };
    soldQuantity: number;
  }>;
  newCustomers: number;
};

export default function DashboardReportsPage() {
  const [reports, setReports] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/reports");
      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }
      const data = await response.json();
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      toast.info("Generating PDF report...");
      const res = await fetch("/api/admin/reports/pdf");

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to download PDF report");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Nexora-Report-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "PDF generation failed");
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-red-600">{error}</div>
        <Button onClick={fetchReports}>Retry</Button>
      </div>
    );
  }

  if (!reports) {
    return null;
  }

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reports & Analytics</h2>
          <p className="mt-1 text-sm text-gray-600">View platform performance metrics and insights.</p>
        </div>
        <Button
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium shadow-xs shrink-0"
        >
          {downloadingPdf ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-purple-50 to-white p-5">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">${reports.revenue.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-blue-50 to-white p-5">
          <p className="text-sm text-gray-600">Total Orders</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{reports.totalOrders}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-green-50 to-white p-5">
          <p className="text-sm text-gray-600">New Customers (30d)</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{reports.newCustomers}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-amber-50 to-white p-5">
          <p className="text-sm text-gray-600">Monthly Sales</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {reports.monthlySales.length} transactions
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Selling Products</h3>
        <div className="space-y-3">
          {reports.bestSellingProducts.map((product) => (
            <div key={product.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
              <div>
                <p className="font-medium text-gray-900">{product.product.name}</p>
                <p className="text-sm text-gray-500">SKU {product.sku}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-[#7F46FA]">{product.soldQuantity} sold</p>
                <p className="text-sm text-gray-500">{product.stock} in stock</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Sales Overview</h3>
        {reports.monthlySales.length > 0 ? (
          <div className="space-y-3">
            {reports.monthlySales.map((sale, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-medium text-gray-900">
                  {Number(sale._sum.grandTotal ?? 0).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No sales data available</p>
        )}
      </div>
    </div>
  );
}
