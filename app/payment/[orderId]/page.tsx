"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, Loader2, DollarSign, Receipt } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/navbar/navbar";

type OrderDetail = {
  id: string;
  orderNumber: string;
  grandTotal: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    variant: {
      sku: string;
      color: string;
      product: {
        name: string;
      };
    };
  }[];
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function PaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nominal, setNominal] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ changeAmount: number } | null>(null);

  const fetchOrderDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.status === 401) {
        toast.error("Please login to access payment page");
        router.push("/login");
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setOrder(data.data);
        if (data.data.paymentStatus === "PAID") {
          toast.info("This order has already been paid.");
          router.push(`/orders/${orderId}`);
        } else {
          setNominal(data.data.grandTotal.toString());
        }
      } else {
        toast.error(data.message || "Order not found");
      }
    } catch {
      toast.error("Error loading order payment information");
    } finally {
      setIsLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!order) return;

    const parsedNominal = parseFloat(nominal);
    if (isNaN(parsedNominal) || parsedNominal <= 0) {
      setErrorMessage("Please enter a valid payment amount");
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (parsedNominal < order.grandTotal) {
      setErrorMessage("Nominal pembayaran kurang");
      toast.error("Nominal pembayaran kurang");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsedNominal }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Payment failed");
      }

      toast.success("Payment Success");
      setSuccessData({ changeAmount: data.data?.changeAmount || 0 });

      setTimeout(() => {
        router.push(`/orders/${orderId}`);
      }, 2500);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Payment processing failed";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setQuickNominal = (amount: number) => {
    setNominal(amount.toString());
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 border-b border-zinc-200 pb-6">
          <Link href={`/orders/${orderId}`}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">Payment</h1>
            <p className="mt-1 text-sm text-zinc-500">Complete manual payment for your order</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#7F46FA]" />
            <p className="mt-4 text-sm font-medium text-zinc-500">Loading order information...</p>
          </div>
        ) : !order ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Receipt className="h-12 w-12 text-zinc-300 mb-3" />
            <h2 className="text-2xl font-bold text-zinc-900">Order Not Found</h2>
            <p className="mt-2 text-zinc-500">We couldn&apos;t find the order associated with this payment page.</p>
            <Link href="/orders" className="mt-6">
              <Button variant="outline">Back to My Orders</Button>
            </Link>
          </div>
        ) : successData ? (
          <div className="mt-10 rounded-3xl border border-emerald-200 bg-emerald-50/50 p-8 text-center shadow-lg max-w-lg mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900">Payment Success!</h2>
            <p className="mt-2 text-sm text-emerald-700">
              Your payment for order <strong className="font-bold">{order.orderNumber}</strong> has been processed successfully.
            </p>
            {successData.changeAmount > 0 && (
              <div className="mt-4 rounded-xl bg-white border border-emerald-200 p-4 text-sm font-semibold text-emerald-800">
                Change Amount: {currencyFormatter.format(successData.changeAmount)}
              </div>
            )}
            <p className="mt-6 text-xs text-emerald-600">Redirecting to order details...</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 md:grid-cols-12">
            {/* Order Summary Box */}
            <div className="md:col-span-5 space-y-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Order Number</span>
                  <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                    {order.paymentStatus}
                  </Badge>
                </div>
                <h2 className="mt-2 text-xl font-bold text-zinc-900">{order.orderNumber}</h2>

                <div className="mt-6 space-y-3 border-t border-zinc-100 pt-4 text-sm">
                  <div className="flex justify-between text-zinc-600">
                    <span>Total Order Items</span>
                    <span className="font-semibold text-zinc-900">{order.items.length} item(s)</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Payment Method</span>
                    <span className="font-semibold text-zinc-900">Manual Payment</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-zinc-100 font-bold text-zinc-900">
                    <span className="text-base">Grand Total</span>
                    <span className="text-2xl text-[#7F46FA]">{currencyFormatter.format(order.grandTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-800 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-1">Manual Payment Instruction</strong>
                  Enter the payment amount equal to or greater than the Grand Total.
                  If the nominal is insufficient, the transaction will be rejected and status will remain <strong>PENDING</strong>.
                </div>
              </div>
            </div>

            {/* Payment Input Form */}
            <div className="md:col-span-7">
              <form onSubmit={handlePayNow} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7F46FA]/10 text-[#7F46FA]">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900">Enter Payment Nominal</h2>
                    <p className="text-xs text-zinc-500">Input your manual payment amount</p>
                  </div>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="nominal" className="text-sm font-semibold text-zinc-700">
                    Payment Amount ($) *
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <Input
                      id="nominal"
                      type="number"
                      step="0.01"
                      placeholder="e.g. 100"
                      value={nominal}
                      onChange={(e) => {
                        setNominal(e.target.value);
                        setErrorMessage(null);
                      }}
                      className="pl-10 h-12 text-lg font-bold text-zinc-900 focus-visible:ring-[#7F46FA]"
                      required
                    />
                  </div>
                </div>

                {/* Quick select options */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-500">Quick Select Nominal:</span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickNominal(order.grandTotal)}
                      className="rounded-lg text-xs"
                    >
                      Exact ({currencyFormatter.format(order.grandTotal)})
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickNominal(Math.ceil(order.grandTotal + 10))}
                      className="rounded-lg text-xs"
                    >
                      +{currencyFormatter.format(10)}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickNominal(Math.ceil(order.grandTotal + 20))}
                      className="rounded-lg text-xs"
                    >
                      +{currencyFormatter.format(20)}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#7F46FA] text-white hover:bg-[#6D3BE3] py-6 text-base font-semibold shadow-md shadow-[#7F46FA]/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying Payment...
                    </>
                  ) : (
                    "Pay Now"
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
