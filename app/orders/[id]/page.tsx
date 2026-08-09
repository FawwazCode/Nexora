"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Truck, CreditCard, Package, Calendar, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar/navbar";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  variant: {
    sku: string;
    color: string;
    product: {
      id: string;
      name: string;
      slug: string;
      thumbnail: string | null;
    };
    images: { imageUrl: string }[];
  };
};

type Address = {
  receiverName: string;
  phone: string;
  fullAddress: string;
  province: string;
  city: string;
  postalCode: string;
};

type PaymentInfo = {
  method: string;
  status: string;
  amount: number | null;
  paidAmount: number | null;
  changeAmount: number | null;
  paidAt: string | null;
  note: string | null;
};

type OrderDetail = {
  id: string;
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  grandTotal: number;
  status: string;
  paymentStatus: string;
  shipmentStatus: string;
  createdAt: string;
  address: Address;
  items: OrderItem[];
  payment?: PaymentInfo | null;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    async function fetchOrderDetail() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/orders/${id}`);
        if (res.status === 401) {
          toast.error("Please login to view order detail");
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (res.ok && data.success) {
          setOrder(data.data);
        } else {
          toast.error(data.message || "Order not found");
        }
      } catch {
        toast.error("Error fetching order details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrderDetail();
  }, [id, router]);

  const handleDownloadPaymentReceipt = async () => {
    if (!order) return;
    try {
      setDownloadingPdf(true);
      toast.info("Generating Payment Receipt PDF...");

      const res = await fetch(`/api/orders/${order.id}/payment/pdf`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to download payment receipt");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Nexora-Payment-${order.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Payment Receipt downloaded successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "PDF download failed");
    } finally {
      setDownloadingPdf(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 border-b border-zinc-200 pb-6">
          <Link href="/orders">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">Order Detail</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {order ? `Order #${order.orderNumber}` : "View order information"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#7F46FA]" />
            <p className="mt-4 text-sm font-medium text-zinc-500">Loading order details...</p>
          </div>
        ) : !order ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="h-12 w-12 text-zinc-300 mb-3" />
            <h2 className="text-2xl font-bold text-zinc-900">Order not found</h2>
            <p className="mt-2 text-zinc-500">We couldn&apos;t find the requested order details.</p>
            <Link href="/orders" className="mt-6">
              <Button variant="outline">Back to Order History</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            {/* Main Information */}
            <div className="lg:col-span-8 space-y-6">
              {/* Order Status Header */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                  <div>
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Order Number</span>
                    <h2 className="text-xl font-bold text-zinc-900">{order.orderNumber}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    <Badge variant="outline" className="border-zinc-300">
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm text-zinc-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-zinc-400" />
                    <span>
                      Order Date:{" "}
                      <strong className="text-zinc-900">
                        {new Date(order.createdAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-zinc-400" />
                    <span>
                      Shipment Status: <strong className="text-zinc-900">{order.shipmentStatus}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-4">
                  Ordered Products ({order.items.length})
                </h3>

                <div className="mt-4 space-y-4">
                  {order.items.map((item) => {
                    const thumbnail = item.variant.images[0]?.imageUrl || item.variant.product.thumbnail || null;
                    const price = Number(item.price);
                    const subtotal = price * item.quantity;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3 border-b border-zinc-100 last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100 border border-zinc-200">
                            {thumbnail ? (
                              <Image src={thumbnail} alt={item.variant.product.name} fill className="object-cover" unoptimized />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">N/A</div>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/products/${item.variant.product.slug}`}
                              className="font-semibold text-zinc-900 hover:text-[#7F46FA]"
                            >
                              {item.variant.product.name}
                            </Link>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              SKU: {item.variant.sku} {item.variant.color ? `• Color: ${item.variant.color}` : ""}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {currencyFormatter.format(price)} × {item.quantity}
                            </p>
                          </div>
                        </div>

                        <div className="text-right sm:text-right w-full sm:w-auto">
                          <span className="text-xs text-zinc-400 font-medium sm:hidden">Subtotal: </span>
                          <span className="text-base font-bold text-zinc-900">
                            {currencyFormatter.format(subtotal)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar info */}
            <div className="lg:col-span-4 space-y-6">
              {/* Shipping Address */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-zinc-900 font-bold border-b border-zinc-100 pb-3">
                  <MapPin className="h-5 w-5 text-[#7F46FA]" />
                  <span>Shipping Address</span>
                </div>
                <div className="mt-4 text-sm text-zinc-600 space-y-1">
                  <p className="font-bold text-zinc-900">{order.address.receiverName}</p>
                  <p className="text-xs text-zinc-500">{order.address.phone}</p>
                  <p className="pt-2">{order.address.fullAddress}</p>
                  <p>
                    {order.address.city}, {order.address.province} {order.address.postalCode}
                  </p>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-zinc-900 font-bold border-b border-zinc-100 pb-3">
                  <CreditCard className="h-5 w-5 text-[#7F46FA]" />
                  <span>Payment Summary</span>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-zinc-900">{currencyFormatter.format(Number(order.subtotal))}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Shipping Cost</span>
                    <span className="font-semibold text-emerald-600">FREE</span>
                  </div>

                  {order.payment && order.payment.paidAmount && (
                    <>
                      <div className="flex justify-between text-zinc-600">
                        <span>Paid Amount</span>
                        <span className="font-semibold text-zinc-900">{currencyFormatter.format(Number(order.payment.paidAmount))}</span>
                      </div>
                      {Number(order.payment.changeAmount) > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Change Amount</span>
                          <span className="font-semibold">{currencyFormatter.format(Number(order.payment.changeAmount))}</span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-zinc-100 font-bold text-zinc-900 text-base">
                    <span>Grand Total</span>
                    <span className="text-xl text-[#7F46FA]">{currencyFormatter.format(Number(order.grandTotal))}</span>
                  </div>

                  {order.paymentStatus === "PENDING" && (
                    <div className="pt-4 border-t border-zinc-100">
                      <Link href={`/payment/${order.id}`}>
                        <Button className="w-full bg-[#7F46FA] hover:bg-[#6D3BE3] text-white font-semibold py-5">
                          Pay Now ({currencyFormatter.format(Number(order.grandTotal))})
                        </Button>
                      </Link>
                    </div>
                  )}

                  {order.paymentStatus === "PAID" && (
                    <div className="pt-4 border-t border-zinc-100">
                      <Button
                        onClick={handleDownloadPaymentReceipt}
                        disabled={downloadingPdf}
                        variant="outline"
                        className="w-full border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold py-5 gap-2"
                      >
                        {downloadingPdf ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-emerald-700" />
                            <span>Generating Receipt...</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 text-emerald-700" />
                            <span>Download Payment Receipt (PDF)</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
