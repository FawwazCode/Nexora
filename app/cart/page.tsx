"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/cart");
      if (res.status === 401) {
        toast.error("Please login to view your cart");
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (res.ok && data.success) {
        setCart(data.data);
      } else {
        toast.error(data.message || "Failed to load cart");
      }
    } catch {
      toast.error("Error loading cart");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (itemId: string, currentQty: number, newQty: number, maxStock: number) => {
    if (newQty > maxStock) {
      toast.error(`Cannot exceed available stock (${maxStock})`);
      return;
    }

    setUpdatingId(itemId);
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update quantity");
      }

      toast.success(newQty <= 0 ? "Item removed" : "Cart updated");
      window.dispatchEvent(new Event("cart-updated"));
      await fetchCart();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingId(itemId);
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to remove item");
      }

      toast.success("Item removed from cart");
      window.dispatchEvent(new Event("cart-updated"));
      await fetchCart();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove item");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!cart || cart.items.length === 0) return;
    setIsClearing(true);
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to clear cart");
      }

      toast.success("Cart cleared successfully");
      window.dispatchEvent(new Event("cart-updated"));
      await fetchCart();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to clear cart");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">Shopping Cart</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {cart ? `${cart.totalQuantity} items in your keranjang` : "Manage your selected items"}
            </p>
          </div>

          {cart && cart.items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCart}
              disabled={isClearing}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              {isClearing ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Trash2 className="h-4 w-4 mr-1.5" />}
              Clear Cart
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#7F46FA]" />
            <p className="mt-4 text-sm font-medium text-zinc-500">Loading your cart...</p>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 mb-4">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900">Your cart is empty</h2>
            <p className="mt-2 text-zinc-500 max-w-md">
              Looks like you haven&apos;t added any products to your cart yet. Explore our collection and find something you love!
            </p>
            <Link href="/products" className="mt-6">
              <Button className="bg-[#7F46FA] text-white hover:bg-[#6D3BE3]">
                Start Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300"
                >
                  {/* Thumbnail & Product Info */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100 border border-zinc-200">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <Link
                        href={`/products/${item.productSlug}`}
                        className="font-semibold text-zinc-900 transition hover:text-[#7F46FA]"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        SKU: {item.sku} {item.color ? `• Color: ${item.color}` : ""}
                      </p>
                      <p className="text-sm font-semibold text-[#7F46FA] mt-1">
                        {currencyFormatter.format(item.price)}
                      </p>
                      {!item.isActive && (
                        <span className="inline-block mt-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls & Subtotal */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100">
                    <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50 p-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, item.quantity - 1, item.stock)}
                        disabled={updatingId === item.id}
                        className="flex h-8 w-8 items-center justify-center rounded text-zinc-600 transition hover:bg-white disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>

                      <span className="w-10 text-center text-xs font-bold text-zinc-900">
                        {updatingId === item.id ? <Loader2 className="h-3 w-3 animate-spin mx-auto text-[#7F46FA]" /> : item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, item.quantity + 1, item.stock)}
                        disabled={item.quantity >= item.stock || updatingId === item.id}
                        className="flex h-8 w-8 items-center justify-center rounded text-zinc-600 transition hover:bg-white disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <p className="text-xs text-zinc-400 font-medium">Subtotal</p>
                      <p className="text-base font-bold text-zinc-900">
                        {currencyFormatter.format(item.subtotal)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={updatingId === item.id}
                      className="text-zinc-400 transition hover:text-red-600 p-1 disabled:opacity-40"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-900">Order Summary</h2>

                <div className="mt-6 space-y-3 border-b border-zinc-100 pb-4 text-sm">
                  <div className="flex justify-between text-zinc-600">
                    <span>Total Quantity</span>
                    <span className="font-semibold text-zinc-900">{cart.totalQuantity} items</span>
                  </div>

                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-zinc-900">{currencyFormatter.format(cart.grandTotal)}</span>
                  </div>

                  <div className="flex justify-between text-zinc-600">
                    <span>Estimated Shipping</span>
                    <span className="font-semibold text-emerald-600">FREE</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between font-bold text-zinc-900">
                  <span className="text-base">Grand Total</span>
                  <span className="text-xl text-[#7F46FA]">{currencyFormatter.format(cart.grandTotal)}</span>
                </div>

                <Link href="/checkout" className="mt-6 block">
                  <Button className="w-full bg-[#7F46FA] text-white hover:bg-[#6D3BE3] py-6 text-base font-semibold shadow-md shadow-[#7F46FA]/20">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                <div className="mt-4 text-center">
                  <Link href="/products" className="text-xs font-medium text-zinc-500 hover:text-[#7F46FA]">
                    ← Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
