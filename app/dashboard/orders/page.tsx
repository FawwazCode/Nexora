"use client";

import { useState, useEffect } from "react";
import { OrderStatus, PaymentStatus, ShipmentStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PaymentDetail = {
  id: string;
  method: string;
  status: PaymentStatus;
  amount: number | null;
  paidAmount: number | null;
  changeAmount: number | null;
  paidAt: string | null;
  note: string | null;
};

type Order = {
  id: string;
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  shipmentStatus: ShipmentStatus;
  status: OrderStatus;
  createdAt: Date;
  user: { id: string; name: string | null; email: string } | null;
  payment?: PaymentDetail | null;
  address?: {
    receiverName: string;
    phone: string;
    fullAddress: string;
    city: string;
    province: string;
    postalCode: string;
  } | null;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    variant: { product: { name: string } };
  }>;
};

type OrdersResponse = {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
};

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [search, status, paymentStatus, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (search) params.append("search", search);
      if (status !== "all") params.append("status", status);
      if (paymentStatus !== "all") params.append("paymentStatus", paymentStatus);

      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data: OrdersResponse = await response.json();
      setOrders(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchOrderDetail = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders?id=${orderId}`);
      if (response.ok) {
        const detail = await response.json();
        setSelectedOrder(detail);
      }
    } catch {
      toast.error("Failed to load order details");
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdating(orderId);
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update order status");
      
      toast.success("Order status updated successfully");
      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        handleFetchOrderDetail(orderId);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update order status";
      toast.error(msg);
      alert(msg);
    } finally {
      setUpdating(null);
    }
  };

  const handleVerifyPayment = async (orderId: string) => {
    try {
      setUpdating(orderId);
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, paymentStatus: PaymentStatus.PAID, note: "Verified by Super Admin" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to verify payment");

      toast.success("Payment verified successfully (Status -> PAID)");
      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        handleFetchOrderDetail(orderId);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to verify payment";
      toast.error(msg);
      alert(msg);
    } finally {
      setUpdating(null);
    }
  };

  const handleShipmentChange = async (orderId: string, newShipmentStatus: ShipmentStatus) => {
    try {
      setUpdating(orderId);
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, shipmentStatus: newShipmentStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update shipment status");

      toast.success(`Shipment status updated to ${newShipmentStatus}`);
      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        handleFetchOrderDetail(orderId);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update shipment status";
      toast.error(msg);
      alert(msg);
    } finally {
      setUpdating(null);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const getOrderStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case OrderStatus.PAID:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case OrderStatus.PROCESSING:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case OrderStatus.SHIPPED:
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case OrderStatus.DELIVERED:
        return "bg-green-100 text-green-800 border-green-200";
      case OrderStatus.CANCELLED:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return "bg-green-100 text-green-800 border-green-200";
      case PaymentStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Orders & Payment Management</h2>
        <p className="mt-2 text-sm text-gray-600">Track orders, verify manual payments, and manage shipment progress.</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Search orders..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={status} onValueChange={(value: OrderStatus | "all" | null) => setStatus(value ?? "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Order Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
            <SelectItem value={OrderStatus.PAID}>Paid</SelectItem>
            <SelectItem value={OrderStatus.PROCESSING}>Processing</SelectItem>
            <SelectItem value={OrderStatus.SHIPPED}>Shipped</SelectItem>
            <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
            <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentStatus} onValueChange={(value: PaymentStatus | "all" | null) => setPaymentStatus(value ?? "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value={PaymentStatus.PAID}>Paid</SelectItem>
            <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="text-red-600 p-4 bg-red-50 rounded-lg">
          {error}
          <Button variant="link" onClick={fetchOrders} className="ml-2">
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{order.orderNumber}</p>
                  <Badge className={getOrderStatusColor(order.status)}>{order.status}</Badge>
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>Payment: {order.paymentStatus}</Badge>
                  <Badge variant="outline" className="border-gray-300">Shipment: {order.shipmentStatus}</Badge>
                </div>
                <p className="text-sm text-gray-500">{order.user?.name ?? order.user?.email ?? "Customer"}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="font-medium text-gray-900">${Number(order.grandTotal).toFixed(2)}</p>
                <div className="flex gap-2 mt-2 justify-end flex-wrap">
                  {order.paymentStatus === PaymentStatus.PENDING && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleVerifyPayment(order.id)}
                      disabled={updating === order.id}
                    >
                      Verify Payment
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleFetchOrderDetail(order.id)}>
                    View Details
                  </Button>
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                    disabled={updating === order.id}
                  >
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
                      <SelectItem value={OrderStatus.PROCESSING}>Processing</SelectItem>
                      <SelectItem value={OrderStatus.SHIPPED}>Shipped</SelectItem>
                      <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
                      <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} orders
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Order Details</h3>
                <p className="text-xs text-gray-500">{selectedOrder.orderNumber}</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">Customer</p>
                  <p className="font-medium text-gray-900">{selectedOrder.user?.name ?? selectedOrder.user?.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">Order Status</p>
                  <Badge className={getOrderStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">Payment Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getPaymentStatusColor(selectedOrder.paymentStatus)}>{selectedOrder.paymentStatus}</Badge>
                    {selectedOrder.paymentStatus === PaymentStatus.PENDING && (
                      <Button
                        size="xs"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2 text-xs"
                        onClick={() => handleVerifyPayment(selectedOrder.id)}
                        disabled={updating === selectedOrder.id}
                      >
                        Set to PAID
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">Shipment Status</p>
                  <div className="mt-1">
                    <Select
                      value={selectedOrder.shipmentStatus}
                      onValueChange={(val) => handleShipmentChange(selectedOrder.id, val as ShipmentStatus)}
                      disabled={updating === selectedOrder.id}
                    >
                      <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue placeholder="Shipment Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ShipmentStatus.NOT_YET_SHIPPED}>NOT_YET_SHIPPED</SelectItem>
                        <SelectItem value={ShipmentStatus.SHIPPED}>SHIPPED</SelectItem>
                        <SelectItem value={ShipmentStatus.IN_TRANSIT}>IN_TRANSIT</SelectItem>
                        <SelectItem value={ShipmentStatus.HAS_ARRIVED}>HAS_ARRIVED / DELIVERED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {selectedOrder.payment && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2 text-sm">
                  <p className="font-semibold text-gray-900">Payment Information</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>Method: <strong className="text-gray-900">{selectedOrder.payment.method}</strong></div>
                    <div>Paid At: <strong className="text-gray-900">{selectedOrder.payment.paidAt ? new Date(selectedOrder.payment.paidAt).toLocaleString() : "N/A"}</strong></div>
                    <div>Paid Amount: <strong className="text-gray-900">${Number(selectedOrder.payment.paidAmount ?? 0).toFixed(2)}</strong></div>
                    <div>Change Amount: <strong className="text-gray-900">${Number(selectedOrder.payment.changeAmount ?? 0).toFixed(2)}</strong></div>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Order Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                      <span>{item.variant.product.name} x{item.quantity}</span>
                      <span className="font-medium">${Number(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100 font-bold text-gray-900 text-lg">
                <span>Grand Total</span>
                <span className="text-[#7F46FA]">${Number(selectedOrder.grandTotal).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

