"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Truck, ArrowLeft, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/layout/navbar/navbar";

type CartItem = {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  thumbnail: string | null;
  sku: string;
  color: string;
  price: number;
  stock: number;
  quantity: number;
  subtotal: number;
  isActive: boolean;
};

type CartData = {
  cartId: string;
  items: CartItem[];
  totalQuantity: number;
  grandTotal: number;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    receiverName: "",
    phone: "",
    fullAddress: "",
    province: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/cart");
      if (res.status === 401) {
        toast.error("Please login to proceed to checkout");
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (res.ok && data.success) {
        if (!data.data || data.data.items.length === 0) {
          toast.error("Your cart is empty. Add products before checkout.");
          router.push("/products");
          return;
        }
        setCart(data.data);
      } else {
        toast.error(data.message || "Failed to load checkout details");
      }
    } catch {
      toast.error("Error loading checkout details");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!formData.receiverName.trim()) {
      toast.error("Recipient name is required");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    if (!formData.fullAddress.trim()) {
      toast.error("Address is required");
      return;
    }
    if (!formData.province.trim()) {
      toast.error("Province is required");
      return;
    }
    if (!formData.city.trim()) {
      toast.error("City is required");
      return;
    }
    if (!formData.postalCode.trim()) {
      toast.error("Postal code is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Checkout failed");
      }

      toast.success("Order placed successfully! Redirecting to payment...");
      window.dispatchEvent(new Event("cart-updated"));
      router.push(`/payment/${data.data.orderId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 border-b border-zinc-200 pb-6">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">Checkout</h1>
            <p className="mt-1 text-sm text-zinc-500">Provide shipping details to complete your order</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#7F46FA]" />
            <p className="mt-4 text-sm font-medium text-zinc-500">Loading order summary...</p>
          </div>
        ) : !cart || cart.items.length === 0 ? null : (
          <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-12">
            {/* Form Details */}
            <div className="lg:col-span-7 space-y-6">
              {/* Shipping Address Card */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7F46FA]/10 text-[#7F46FA]">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900">Shipping Address</h2>
                    <p className="text-xs text-zinc-500">Where should we deliver your order?</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="receiverName">Recipient Name *</Label>
                      <Input
                        id="receiverName"
                        name="receiverName"
                        placeholder="John Doe"
                        value={formData.receiverName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="+62 812 3456 7890"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullAddress">Full Address *</Label>
                    <Input
                      id="fullAddress"
                      name="fullAddress"
                      placeholder="Street name, building, house number"
                      value={formData.fullAddress}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="province">Province *</Label>
                      <Input
                        id="province"
                        name="province"
                        placeholder="State / Province"
                        value={formData.province}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        placeholder="12345"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                    <Input
                      id="notes"
                      name="notes"
                      placeholder="Special instructions for courier..."
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Card */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7F46FA]/10 text-[#7F46FA]">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900">Payment Information</h2>
                    <p className="text-xs text-zinc-500">Default payment method for order</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl border border-[#7F46FA]/30 bg-[#7F46FA]/5 p-4 text-sm font-medium text-zinc-900">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-[#7F46FA]" />
                    <span>Standard Checkout (Pending Admin Review)</span>
                  </div>
                  <span className="text-xs font-semibold text-[#7F46FA] bg-white px-2.5 py-1 rounded-full border border-[#7F46FA]/20">
                    PENDING
                  </span>
                </div>
              </div>
            </div>

            {/* Order Summary Side panel */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-4">
                  Order Summary ({cart.totalQuantity} items)
                </h2>

                {/* Items preview list */}
                <div className="mt-4 max-h-72 overflow-y-auto space-y-3 pr-1">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 text-sm py-1 border-b border-zinc-50 last:border-0">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 border border-zinc-200">
                          {item.thumbnail ? (
                            <Image src={item.thumbnail} alt={item.productName} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">N/A</div>
                          )}
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-zinc-900 truncate">{item.productName}</p>
                          <p className="text-xs text-zinc-500">Qty: {item.quantity} × {currencyFormatter.format(item.price)}</p>
                        </div>
                      </div>
                      <span className="font-bold text-zinc-900 flex-shrink-0">{currencyFormatter.format(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3 border-t border-zinc-100 pt-4 text-sm">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-zinc-900">{currencyFormatter.format(cart.grandTotal)}</span>
                  </div>

                  <div className="flex justify-between text-zinc-600">
                    <span>Shipping Cost</span>
                    <span className="font-semibold text-emerald-600">FREE</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 font-bold text-zinc-900 border-t border-zinc-100 text-base">
                    <span>Total Amount</span>
                    <span className="text-2xl text-[#7F46FA]">{currencyFormatter.format(cart.grandTotal)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 w-full bg-[#7F46FA] text-white hover:bg-[#6D3BE3] py-6 text-base font-semibold shadow-md shadow-[#7F46FA]/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
