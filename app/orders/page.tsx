"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ChevronRight, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar/navbar";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  variant: {
    product: {
      name: string;
      thumbnail: string | null;
    };
  };
};

type Order = {
  id: string;
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  grandTotal: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/orders");
      if (res.status === 401) {
        toast.error("Please login to view your orders");
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.data);
      } else {
        toast.error(data.message || "Failed to load orders");
      }
    } catch {
      toast.error("Error loading order history");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 border-0">Delivered</Badge>;
      case "SHIPPED":
        return <Badge className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/15 border-0">Shipped</Badge>;
      case "PROCESSING":
        return <Badge className="bg-purple-500/15 text-purple-700 hover:bg-purple-500/15 border-0">Processing</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-500/15 text-red-700 hover:bg-red-500/15 border-0">Cancelled</Badge>;
      default:
        return <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/15 border-0">Pending</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">Paid</Badge>;
      default:
        return <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">Unpaid</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="border-b border-zinc-200 pb-6">
          <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">Order History</h1>
          <p className="mt-1 text-sm text-zinc-500">Track and view your past order purchases</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#7F46FA]" />
            <p className="mt-4 text-sm font-medium text-zinc-500">Loading order history...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 mb-4">
              <Package className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900">No orders found</h2>
            <p className="mt-2 text-zinc-500 max-w-md">
              You haven&apos;t placed any orders yet. Once you make a purchase, your orders will appear here.
            </p>
            <Link href="/products" className="mt-6">
              <Button className="bg-[#7F46FA] text-white hover:bg-[#6D3BE3]">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300"
              >
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-50/50 p-5 border-b border-zinc-100">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Order Number</span>
                      <p className="font-bold text-zinc-900">{order.orderNumber}</p>
                    </div>
                    <div className="hidden sm:block h-8 w-px bg-zinc-200" />
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Date Placed</span>
                      <p className="text-sm font-medium text-zinc-700">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    {getPaymentStatusBadge(order.paymentStatus)}
                  </div>
                </div>

                {/* Items summary & Total */}
                <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-900">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"}:
                    </p>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                      {order.items.map((i) => `${i.variant.product.name} (x${i.quantity})`).join(", ")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-zinc-400 font-medium">Total Amount</span>
                      <p className="text-lg font-bold text-[#7F46FA]">
                        {currencyFormatter.format(order.grandTotal)}
                      </p>
                    </div>

                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" className="border-zinc-200 hover:border-[#7F46FA] hover:text-[#7F46FA]">
                        View Detail
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
