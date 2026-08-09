"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  PackageCheck,
  Clock,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  MapPin,
  User,
  Phone,
  ArrowRight,
  X,
  Loader2,
  Package,
  ExternalLink,
  ShieldCheck,
  Download,
} from "lucide-react";
import { toast } from "sonner";

type Courier = {
  id: string;
  name: string;
  code: string;
};

type Address = {
  id: string;
  receiverName: string;
  phone: string;
  fullAddress: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
};

type Shipment = {
  id: string;
  trackingNumber: string | null;
  status: "NOT_YET_SHIPPED" | "SHIPPED" | "IN_TRANSIT" | "HAS_ARRIVED";
  shippedAt: string | null;
  deliveredAt: string | null;
  courier: Courier | null;
};

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  variant: {
    sku: string;
    color: string;
    ram: string;
    storage: string;
    product: {
      name: string;
      thumbnail: string | null;
    };
  };
};

type ShippingOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID";
  shipmentStatus: "NOT_YET_SHIPPED" | "SHIPPED" | "IN_TRANSIT" | "HAS_ARRIVED";
  grandTotal: number;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
  address: Address;
  shipment: Shipment | null;
  items: OrderItem[];
};

type ShippingSummary = {
  notYetShippedCount: number;
  shippedCount: number;
  inTransitCount: number;
  hasArrivedCount: number;
};

type ShippingApiResponse = {
  items: ShippingOrder[];
  total: number;
  page: number;
  pageSize: number;
  summary: ShippingSummary;
};

export default function DashboardShippingPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<ShippingOrder[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [summary, setSummary] = useState<ShippingSummary>({
    notYetShippedCount: 0,
    shippedCount: 0,
    inTransitCount: 0,
    hasArrivedCount: 0,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "NOT_YET_SHIPPED" | "SHIPPED" | "IN_TRANSIT" | "HAS_ARRIVED">("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<ShippingOrder | null>(null);
  const [selectedCourierId, setSelectedCourierId] = useState<string>("");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [targetShipmentStatus, setTargetShipmentStatus] = useState<"NOT_YET_SHIPPED" | "SHIPPED" | "IN_TRANSIT" | "HAS_ARRIVED">("SHIPPED");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);

  const handleDownloadShippingPdf = async (order: ShippingOrder) => {
    try {
      setDownloadingPdfId(order.id);
      toast.info(`Generating Shipping PDF for ${order.orderNumber}...`);

      const res = await fetch(`/api/admin/shipping/${order.id}/pdf`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to download Shipping PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Nexora-Shipping-${order.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Shipping PDF for ${order.orderNumber} downloaded successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "PDF download failed");
    } finally {
      setDownloadingPdfId(null);
    }
  };

  // Fetch Couriers List
  const fetchCouriers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/shipping/couriers");
      if (res.ok) {
        const data: Courier[] = await res.json();
        setCouriers(data);
      }
    } catch {
      // Non-critical, fallback to manual text
    }
  }, []);

  // Fetch Shipping Orders Data
  const fetchShippingOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        shipmentStatus: statusFilter,
      });
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/admin/shipping?${params.toString()}`);
      if (res.status === 403) {
        toast.error("Access denied");
        router.replace("/dashboard");
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to fetch shipping orders");
      }

      const data: ShippingApiResponse = await res.json();
      setOrders(data.items);
      setTotalItems(data.total);
      setSummary(data.summary);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error loading shipping data");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search, router]);

  useEffect(() => {
    fetchCouriers();
    fetchShippingOrders();
  }, [fetchCouriers, fetchShippingOrders]);

  const openManageModal = (order: ShippingOrder) => {
    setSelectedOrder(order);
    setSelectedCourierId(order.shipment?.courier?.id || couriers[0]?.id || "");
    setTrackingNumber(order.shipment?.trackingNumber || `NXR-TRK-${Date.now().toString().slice(-6)}`);
    setTargetShipmentStatus(order.shipmentStatus === "NOT_YET_SHIPPED" ? "SHIPPED" : order.shipmentStatus);
  };

  const handleUpdateShipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/shipping", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          shipmentStatus: targetShipmentStatus,
          courierId: selectedCourierId,
          trackingNumber: trackingNumber.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update shipment status");
      }

      toast.success(
        `Shipment for Order ${selectedOrder.orderNumber} updated to ${targetShipmentStatus}`
      );
      setSelectedOrder(null);
      fetchShippingOrders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getShipmentBadge = (status: "NOT_YET_SHIPPED" | "SHIPPED" | "IN_TRANSIT" | "HAS_ARRIVED") => {
    switch (status) {
      case "NOT_YET_SHIPPED":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 gap-1 px-2.5 py-1 font-semibold">
            <Clock className="w-3.5 h-3.5" /> Awaiting Shipment
          </Badge>
        );
      case "SHIPPED":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 gap-1 px-2.5 py-1 font-semibold">
            <Truck className="w-3.5 h-3.5" /> Dispatched / Shipped
          </Badge>
        );
      case "IN_TRANSIT":
        return (
          <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 border-indigo-200 gap-1 px-2.5 py-1 font-semibold">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> In Transit
          </Badge>
        );
      case "HAS_ARRIVED":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 gap-1 px-2.5 py-1 font-semibold">
            <PackageCheck className="w-3.5 h-3.5" /> Delivered & Arrived
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-7 h-7 text-blue-400" />
            <h1 className="text-2xl font-bold tracking-tight">Shipping & Logistics Control</h1>
          </div>
          <p className="mt-1 text-sm text-blue-200">
            Coordinate customer deliveries, update courier tracking numbers, and progress order status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchShippingOrders}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 border-white/20 text-white gap-2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Logistics
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Awaiting Shipment</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{summary.notYetShippedCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dispatched / Shipped</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{summary.shippedCount}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">In Transit</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{summary.inTransitCount}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivered & Completed</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{summary.hasArrivedCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-4">
        {/* Search & Status Filters */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search Order #, Receiver Name, Tracking #..."
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
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">Filter Status:</span>
            <div className="flex items-center gap-1">
              {[
                { id: "ALL", label: "All Shipping Orders" },
                { id: "NOT_YET_SHIPPED", label: "Awaiting Shipment" },
                { id: "SHIPPED", label: "Shipped" },
                { id: "IN_TRANSIT", label: "In Transit" },
                { id: "HAS_ARRIVED", label: "Delivered" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    setStatusFilter(filter.id as typeof statusFilter);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition shrink-0 ${
                    statusFilter === filter.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Shipping Orders Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3.5">Order Number & Date</th>
                <th className="px-4 py-3.5">Recipient & Address</th>
                <th className="px-4 py-3.5">Package Details</th>
                <th className="px-4 py-3.5">Courier & Tracking</th>
                <th className="px-4 py-3.5 text-center">Shipment Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <p className="text-sm">Loading shipping records...</p>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <Truck className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="font-semibold text-gray-700">No shipping records found</p>
                    <p className="text-xs text-gray-500">Orders with verified payments ready for delivery will appear here.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/70 transition">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-bold text-gray-900 font-mono text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <Badge className="mt-1 bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        Payment PAID
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="space-y-0.5 text-xs text-gray-700">
                        <p className="font-bold text-gray-900 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {order.address?.receiverName || order.user.name || "Customer"}
                        </p>
                        <p className="text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {order.address?.phone || order.user.phone || "No phone"}
                        </p>
                        <p className="text-gray-600 text-[11px] line-clamp-2 mt-1 flex items-start gap-1">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                          {order.address?.fullAddress}, {order.address?.city}, {order.address?.province}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="space-y-1 text-xs">
                        <p className="font-medium text-gray-800">
                          {order.items.length} item(s) ordered
                        </p>
                        <div className="text-[11px] text-gray-500 line-clamp-1">
                          {order.items.map((i) => i.variant.product.name).join(", ")}
                        </div>
                        <p className="font-semibold text-gray-900">
                          ${Number(order.grandTotal).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      {order.shipment?.courier || order.shipment?.trackingNumber ? (
                        <div className="space-y-1 text-xs font-mono">
                          <p className="font-bold text-gray-900">
                            {order.shipment.courier?.name || "Standard Carrier"}
                          </p>
                          <p className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-block text-[11px]">
                            {order.shipment.trackingNumber || "N/A"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Not assigned yet</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      {getShipmentBadge(order.shipmentStatus)}
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {order.shipmentStatus !== "NOT_YET_SHIPPED" && (
                          <Button
                            onClick={() => handleDownloadShippingPdf(order)}
                            disabled={downloadingPdfId === order.id}
                            size="sm"
                            variant="outline"
                            className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 gap-1.5 font-medium shadow-xs"
                          >
                            {downloadingPdfId === order.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5 text-blue-600" />
                            )}
                            Shipping PDF
                          </Button>
                        )}
                        <Button
                          onClick={() => openManageModal(order)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 font-medium shadow-xs"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          Manage Shipment
                        </Button>
                      </div>
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
              {Math.min(page * pageSize, totalItems)} of {totalItems} orders
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

      {/* MANAGE SHIPMENT MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Update Order Shipment</h3>
                  <p className="text-xs text-gray-500">Order: {selectedOrder.orderNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient Summary */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-sm">{selectedOrder.address.receiverName}</span>
                <span className="text-gray-500 font-mono">{selectedOrder.address.phone}</span>
              </div>
              <p className="text-gray-600 line-clamp-2">{selectedOrder.address.fullAddress}, {selectedOrder.address.city}, {selectedOrder.address.province} ({selectedOrder.address.postalCode})</p>
            </div>

            <form onSubmit={handleUpdateShipmentSubmit} className="space-y-4">
              {/* Courier Selection */}
              <div>
                <Label htmlFor="courier" className="text-xs font-semibold uppercase text-gray-600">
                  Select Courier / Carrier
                </Label>
                <select
                  id="courier"
                  value={selectedCourierId}
                  onChange={(e) => setSelectedCourierId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Courier --</option>
                  {couriers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tracking Number Input */}
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="tracking" className="text-xs font-semibold uppercase text-gray-600">
                    Tracking / Airway Bill (AWB) Number
                  </Label>
                  <button
                    type="button"
                    onClick={() => setTrackingNumber(`NXR-TRK-${Math.floor(100000 + Math.random() * 900000)}`)}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Auto Generate
                  </button>
                </div>
                <Input
                  id="tracking"
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. JNE-88201923"
                  className="mt-1 font-mono text-sm font-semibold"
                  required
                />
              </div>

              {/* Shipment Status Selector */}
              <div>
                <Label className="text-xs font-semibold uppercase text-gray-600">
                  Update Shipment Progress State
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {[
                    { id: "NOT_YET_SHIPPED", label: "Awaiting Shipment", icon: Clock, color: "amber" },
                    { id: "SHIPPED", label: "Dispatched / Shipped", icon: Truck, color: "blue" },
                    { id: "IN_TRANSIT", label: "In Transit", icon: RefreshCw, color: "indigo" },
                    { id: "HAS_ARRIVED", label: "Delivered & Arrived", icon: PackageCheck, color: "emerald" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setTargetShipmentStatus(st.id as typeof targetShipmentStatus)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition ${
                        targetShipmentStatus === st.id
                          ? "bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-500/20 shadow-xs"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <st.icon className="w-4 h-4 shrink-0" />
                      <span className="text-left line-clamp-1">{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Flow Explanation / Guard */}
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 flex items-start gap-2 text-xs text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  Setting status to <strong>SHIPPED</strong> automatically syncs Order status to <em>SHIPPED</em>. Setting status to <strong>HAS_ARRIVED</strong> completes the order as <em>DELIVERED</em>.
                </p>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white min-w-[130px] shadow-xs"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </div>
                  ) : (
                    "Save & Sync Status"
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
