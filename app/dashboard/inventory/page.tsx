"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Boxes,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  History,
  Plus,
  Minus,
  Loader2,
  Package,
  FileText,
  X,
  ArrowRight,
  Filter,
  Download,
} from "lucide-react";
import { toast } from "sonner";

type ProductVariantItem = {
  id: string;
  sku: string;
  barcode: string | null;
  color: string;
  ram: string;
  storage: string;
  price: number;
  stock: number;
  isActive: boolean;
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string | null;
    category: { id: string; name: string } | null;
    brand: { id: string; name: string } | null;
  };
};

type InventorySummary = {
  totalVariants: number;
  totalStock: number;
  lowStockCount: number;
  outOfStockCount: number;
};

type InventoryApiResponse = {
  items: ProductVariantItem[];
  total: number;
  page: number;
  pageSize: number;
  summary: InventorySummary;
};

type StockMovementItem = {
  id: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  note: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  variant: {
    id: string;
    sku: string;
    color: string;
    ram: string;
    storage: string;
    product: {
      id: string;
      name: string;
      thumbnail: string | null;
    };
  };
};

type StockMovementsApiResponse = {
  items: StockMovementItem[];
  total: number;
  page: number;
  pageSize: number;
};

export default function DashboardInventoryPage() {
  const router = useRouter();

  // Active Tab: "inventory" | "movements"
  const [activeTab, setActiveTab] = useState<"inventory" | "movements">("inventory");

  // Inventory list state
  const [items, setItems] = useState<ProductVariantItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary>({
    totalVariants: 0,
    totalStock: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "low_stock" | "out_of_stock" | "in_stock">("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadInventoryPdf = async () => {
    try {
      setDownloadingPdf(true);
      toast.info("Generating Inventory PDF report...");

      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/inventory/pdf?${params.toString()}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to download Inventory PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Nexora-Inventory-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Inventory PDF downloaded successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "PDF download failed");
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Movements state
  const [movements, setMovements] = useState<StockMovementItem[]>([]);
  const [totalMovements, setTotalMovements] = useState(0);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [movementSearch, setMovementSearch] = useState("");
  const [movementTypeFilter, setMovementTypeFilter] = useState<"ALL" | "IN" | "OUT" | "ADJUSTMENT">("ALL");
  const [movementPage, setMovementPage] = useState(1);

  // Adjustment Modal State
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantItem | null>(null);
  const [adjustType, setAdjustType] = useState<"IN" | "OUT" | "ADJUSTMENT">("IN");
  const [adjustQuantity, setAdjustQuantity] = useState<string>("1");
  const [adjustNote, setAdjustNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Inventory Data
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        status: statusFilter,
      });
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/admin/inventory?${params.toString()}`);
      if (res.status === 403) {
        toast.error("Access denied");
        router.replace("/dashboard");
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to fetch inventory data");
      }

      const data: InventoryApiResponse = await res.json();
      setItems(data.items);
      setTotalItems(data.total);
      setSummary(data.summary);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error loading inventory");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search, router]);

  // Fetch Movements Log
  const fetchMovements = useCallback(async () => {
    try {
      setMovementsLoading(true);
      const params = new URLSearchParams({
        page: movementPage.toString(),
        pageSize: pageSize.toString(),
      });
      if (movementSearch.trim()) params.append("search", movementSearch.trim());
      if (movementTypeFilter !== "ALL") params.append("type", movementTypeFilter);

      const res = await fetch(`/api/admin/inventory/movements?${params.toString()}`);
      if (res.status === 403) {
        router.replace("/dashboard");
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to fetch stock movements log");
      }

      const data: StockMovementsApiResponse = await res.json();
      setMovements(data.items);
      setTotalMovements(data.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error loading movement history");
    } finally {
      setMovementsLoading(false);
    }
  }, [movementPage, movementSearch, movementTypeFilter, router]);

  useEffect(() => {
    if (activeTab === "inventory") {
      fetchInventory();
    } else {
      fetchMovements();
    }
  }, [activeTab, fetchInventory, fetchMovements]);

  // Handle Adjustment Submit
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;

    const qty = parseInt(adjustQuantity, 10);
    if (isNaN(qty)) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if ((adjustType === "IN" || adjustType === "OUT") && qty <= 0) {
      toast.error("Quantity for IN/OUT must be greater than 0");
      return;
    }

    if (adjustType === "ADJUSTMENT" && qty < 0) {
      toast.error("Target stock cannot be negative");
      return;
    }

    // Double-click protection
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          type: adjustType,
          quantity: qty,
          note: adjustNote.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to adjust stock");
      }

      toast.success(
        `Stock updated successfully! New stock for SKU ${selectedVariant.sku}: ${data.variant.stock}`
      );
      setSelectedVariant(null);
      setAdjustQuantity("1");
      setAdjustNote("");
      fetchInventory();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Adjustment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAdjustModal = (variant: ProductVariantItem) => {
    setSelectedVariant(variant);
    setAdjustType("IN");
    setAdjustQuantity("1");
    setAdjustNote("");
  };

  const calculateNewStockPreview = () => {
    if (!selectedVariant) return 0;
    const qty = parseInt(adjustQuantity, 10) || 0;
    if (adjustType === "IN") return selectedVariant.stock + Math.max(0, qty);
    if (adjustType === "OUT") return Math.max(0, selectedVariant.stock - Math.max(0, qty));
    if (adjustType === "ADJUSTMENT") return Math.max(0, qty);
    return selectedVariant.stock;
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 font-medium px-2.5 py-0.5">
          Out of Stock
        </Badge>
      );
    }
    if (stock <= 5) {
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 font-medium px-2.5 py-0.5">
          Low Stock ({stock})
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 font-medium px-2.5 py-0.5">
        In Stock ({stock})
      </Badge>
    );
  };

  const getMovementTypeBadge = (type: "IN" | "OUT" | "ADJUSTMENT") => {
    switch (type) {
      case "IN":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> RESTOCK (+IN)
          </Badge>
        );
      case "OUT":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50 gap-1 font-semibold">
            <TrendingDown className="w-3.5 h-3.5" /> REMOVE (-OUT)
          </Badge>
        );
      case "ADJUSTMENT":
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 gap-1 font-semibold">
            <RefreshCw className="w-3.5 h-3.5" /> AUDIT (=ADJ)
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-7 h-7 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight">Inventory & Stock Control</h1>
          </div>
          <p className="mt-1 text-sm text-indigo-200">
            Monitor real-time inventory levels, adjust variant stocks, and audit stock movements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleDownloadInventoryPdf}
            disabled={downloadingPdf}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium shadow-xs"
          >
            {downloadingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Inventory PDF</span>
              </>
            )}
          </Button>
          <Button
            onClick={() => {
              if (activeTab === "inventory") fetchInventory();
              else fetchMovements();
            }}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 border-white/20 text-white gap-2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${(loading || movementsLoading) ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Variants</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.totalVariants}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Units in Stock</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.totalStock.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Low Stock Warning</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{summary.lowStockCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{summary.outOfStockCount}</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Minus className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50/50 px-4 pt-3 gap-2">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "inventory"
                ? "border-indigo-600 text-indigo-600 bg-white rounded-t-lg shadow-xs"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 rounded-t-lg"
            }`}
          >
            <Boxes className="w-4 h-4" />
            Inventory Stock List
          </button>
          <button
            onClick={() => setActiveTab("movements")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "movements"
                ? "border-indigo-600 text-indigo-600 bg-white rounded-t-lg shadow-xs"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 rounded-t-lg"
            }`}
          >
            <History className="w-4 h-4" />
            Stock Movement Log Audit
          </button>
        </div>

        {/* TAB 1: INVENTORY ITEMS */}
        {activeTab === "inventory" && (
          <div className="p-6 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search Product, SKU, or Barcode..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <Filter className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">Status:</span>
                <div className="flex items-center gap-1">
                  {[
                    { id: "all", label: "All Items" },
                    { id: "low_stock", label: "Low Stock (<=5)" },
                    { id: "out_of_stock", label: "Out of Stock (0)" },
                    { id: "in_stock", label: "In Stock (>5)" },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => {
                        setStatusFilter(filter.id as typeof statusFilter);
                        setPage(1);
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition shrink-0 ${
                        statusFilter === filter.id
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3.5">Product & Variant Info</th>
                    <th className="px-4 py-3.5">SKU / Barcode</th>
                    <th className="px-4 py-3.5">Attributes</th>
                    <th className="px-4 py-3.5">Unit Price</th>
                    <th className="px-4 py-3.5 text-center">Stock Level</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                          <p className="text-sm">Loading inventory items...</p>
                        </div>
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        <Package className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="font-semibold text-gray-700">No inventory items found</p>
                        <p className="text-xs text-gray-500">Try adjusting your search query or status filter.</p>
                      </td>
                    </tr>
                  ) : (
                    items.map((variant) => (
                      <tr key={variant.id} className="hover:bg-gray-50/70 transition">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                              {variant.product.thumbnail ? (
                                <img
                                  src={variant.product.thumbnail}
                                  alt={variant.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 line-clamp-1">
                                {variant.product.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                {variant.product.category && (
                                  <span>{variant.product.category.name}</span>
                                )}
                                {variant.product.brand && (
                                  <span>• {variant.product.brand.name}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="font-mono text-xs font-semibold text-gray-800">{variant.sku}</p>
                          {variant.barcode && (
                            <p className="font-mono text-[11px] text-gray-400 mt-0.5">{variant.barcode}</p>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-xs text-gray-600">
                          <div className="flex flex-wrap gap-1">
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                              {variant.color}
                            </span>
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                              {variant.ram} / {variant.storage}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 font-semibold text-gray-900">
                          ${Number(variant.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {getStockBadge(variant.stock)}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <Button
                            onClick={() => openAdjustModal(variant)}
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 font-medium shadow-xs"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Adjust Stock
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalItems > pageSize && (
              <div className="flex items-center justify-between pt-2 text-sm text-gray-600">
                <p>
                  Showing {Math.min((page - 1) * pageSize + 1, totalItems)} to{" "}
                  {Math.min(page * pageSize, totalItems)} of {totalItems} items
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * pageSize >= totalItems}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STOCK MOVEMENT HISTORY LOG */}
        {activeTab === "movements" && (
          <div className="p-6 space-y-4">
            {/* Filter Bar for Movements */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by Note, SKU, Product, or Admin User..."
                  value={movementSearch}
                  onChange={(e) => {
                    setMovementSearch(e.target.value);
                    setMovementPage(1);
                  }}
                  className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                <Filter className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">Type:</span>
                <div className="flex items-center gap-1">
                  {[
                    { id: "ALL", label: "All Movements" },
                    { id: "IN", label: "Restock (+IN)" },
                    { id: "OUT", label: "Removal (-OUT)" },
                    { id: "ADJUSTMENT", label: "Audit (=ADJ)" },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => {
                        setMovementTypeFilter(filter.id as typeof movementTypeFilter);
                        setMovementPage(1);
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition shrink-0 ${
                        movementTypeFilter === filter.id
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Movements Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3.5">Timestamp</th>
                    <th className="px-4 py-3.5">Type</th>
                    <th className="px-4 py-3.5">Product & SKU</th>
                    <th className="px-4 py-3.5 text-center">Change (Qty)</th>
                    <th className="px-4 py-3.5 text-center">Before ➔ After</th>
                    <th className="px-4 py-3.5">Performed By</th>
                    <th className="px-4 py-3.5">Note / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {movementsLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                          <p className="text-sm">Loading stock movement logs...</p>
                        </div>
                      </td>
                    </tr>
                  ) : movements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">
                        <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="font-semibold text-gray-700">No movement logs found</p>
                        <p className="text-xs text-gray-500">
                          Stock changes from customer orders or manual adjustments will appear here.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    movements.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/70 transition">
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-gray-500 font-mono">
                          {new Date(log.createdAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {getMovementTypeBadge(log.type)}
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-gray-900 text-xs line-clamp-1">
                            {log.variant.product.name}
                          </p>
                          <p className="font-mono text-[11px] text-gray-500 mt-0.5">
                            SKU: {log.variant.sku} ({log.variant.color}, {log.variant.ram}/{log.variant.storage})
                          </p>
                        </td>

                        <td className="px-4 py-3.5 text-center whitespace-nowrap font-bold">
                          {log.type === "IN" && <span className="text-emerald-600">+{log.quantity}</span>}
                          {log.type === "OUT" && <span className="text-red-600">-{log.quantity}</span>}
                          {log.type === "ADJUSTMENT" && <span className="text-blue-600">±{log.quantity}</span>}
                        </td>

                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 text-xs font-mono bg-gray-100 px-2.5 py-1 rounded-md text-gray-800">
                            <span>{log.stockBefore}</span>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <span className="font-bold text-indigo-700">{log.stockAfter}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-xs text-gray-700">
                          {log.user ? (
                            <div>
                              <p className="font-medium text-gray-900">{log.user.name || "Admin User"}</p>
                              <p className="text-[11px] text-gray-400">{log.user.email}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">System / Customer</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-xs text-gray-600 max-w-xs truncate">
                          {log.note || <span className="text-gray-400 italic">No note recorded</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination for Movements */}
            {totalMovements > pageSize && (
              <div className="flex items-center justify-between pt-2 text-sm text-gray-600">
                <p>
                  Showing {Math.min((movementPage - 1) * pageSize + 1, totalMovements)} to{" "}
                  {Math.min(movementPage * pageSize, totalMovements)} of {totalMovements} movements
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setMovementPage((p) => Math.max(1, p - 1))}
                    disabled={movementPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setMovementPage((p) => p + 1)}
                    disabled={movementPage * pageSize >= totalMovements}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* STOCK ADJUSTMENT MODAL DRAWER */}
      {selectedVariant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Stock Adjustment</h3>
                  <p className="text-xs text-gray-500">Update variant quantity & audit movement</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVariant(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Variant Card */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm space-y-1">
              <p className="font-bold text-gray-900">{selectedVariant.product.name}</p>
              <div className="flex items-center gap-3 text-xs text-gray-600 font-mono">
                <span>SKU: {selectedVariant.sku}</span>
                <span>• Color: {selectedVariant.color}</span>
                <span>• Specs: {selectedVariant.ram}/{selectedVariant.storage}</span>
              </div>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Current Physical Stock:</span>
                <span className="font-bold text-indigo-700 text-sm">{selectedVariant.stock} units</span>
              </div>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              {/* Type Selection */}
              <div>
                <Label className="text-xs font-semibold uppercase text-gray-600">Adjustment Type</Label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType("IN");
                      setAdjustQuantity("1");
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition ${
                      adjustType === "IN"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Plus className="w-4 h-4 mb-1 text-emerald-600" />
                    Restock (+IN)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType("OUT");
                      setAdjustQuantity("1");
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition ${
                      adjustType === "OUT"
                        ? "bg-red-50 border-red-500 text-red-800 ring-2 ring-red-500/20"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Minus className="w-4 h-4 mb-1 text-red-600" />
                    Remove (-OUT)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType("ADJUSTMENT");
                      setAdjustQuantity(selectedVariant.stock.toString());
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition ${
                      adjustType === "ADJUSTMENT"
                        ? "bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-500/20"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <RefreshCw className="w-4 h-4 mb-1 text-blue-600" />
                    Audit (=ADJ)
                  </button>
                </div>
              </div>

              {/* Quantity Input */}
              <div>
                <Label htmlFor="quantity" className="text-xs font-semibold uppercase text-gray-600">
                  {adjustType === "ADJUSTMENT" ? "New Exact Stock Target" : "Quantity Amount"}
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min={adjustType === "ADJUSTMENT" ? "0" : "1"}
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  className="mt-1 font-mono text-base font-bold"
                  placeholder="Enter quantity..."
                  required
                />
              </div>

              {/* Live Preview Calculation */}
              <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
                <span className="text-indigo-900 font-medium">Resulting Stock Level:</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-gray-500">{selectedVariant.stock}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-bold text-indigo-700 text-sm">
                    {calculateNewStockPreview()} units
                  </span>
                </div>
              </div>

              {/* Note / Reason */}
              <div>
                <Label htmlFor="note" className="text-xs font-semibold uppercase text-gray-600">
                  Reason / Note
                </Label>
                <Input
                  id="note"
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="e.g. Supplier Restock PO-9921, Damaged box..."
                  className="mt-1 text-xs"
                />

                {/* Preset Note Buttons */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {["Supplier Restock", "Inventory Audit", "Damaged / Broken Item", "Customer Return"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setAdjustNote(tag)}
                      className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded transition"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedVariant(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px] shadow-xs"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    "Confirm Adjustment"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
